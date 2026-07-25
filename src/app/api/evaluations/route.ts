import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createActivityLog,
  getCurrentUser,
  notifyRole,
} from "@/lib/workflow";

type TaskResult = "P" | "X" | "NA";

type EvaluationBody = {
  reportId?: string;
  locationId?: string;
  month?: number;
  year?: number;
  results?: Record<string, TaskResult>;
  taskRemarks?: Record<string, string>;
  officerRemarks?: string;
  action?: "DRAFT" | "SUBMIT" | "RESUBMIT";
};

const validTaskResults = new Set<TaskResult>(["P", "X", "NA"]);
const editableReportStatuses = new Set([
  "DRAFT",
  "CORRECTION_REQUESTED",
  "ADMIN_REJECTED",
  "VC_REJECTED",
  "REJECTED",
]);

function getEvaluationSaveErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A report already exists for this location, month, and year.";
    }

    if (error.code === "P2003") {
      return "Evaluation could not be saved because one selected record is no longer valid. Refresh the page and try again.";
    }

    if (error.code === "P2025") {
      return "Evaluation could not be saved because the report or task was not found. Refresh the page and try again.";
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return "Evaluation data is incomplete or invalid. Please check the marked tasks and try again.";
  }

  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    return error.message;
  }

  return "Failed to save evaluation. Please try again.";
}

function calculatePercentage(results: Record<string, TaskResult>) {
  const values = Object.values(results);
  const applicable = values.filter((result) => result !== "NA");
  const completed = applicable.filter((result) => result === "P");

  return {
    totalApplicable: applicable.length,
    percentage:
      applicable.length === 0
        ? 0
        : (completed.length / applicable.length) * 100,
  };
}

export async function POST(req: NextRequest) {
  try {
    const officer = await getCurrentUser("Evaluating Officer");

    if (!officer) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as EvaluationBody;
    const locationId = body.locationId || "";
    const month = Number(body.month);
    const year = Number(body.year);
    const results = body.results || {};
    const taskRemarks = body.taskRemarks || {};
    const action = body.action || "SUBMIT";
    const officerRemarks = body.officerRemarks?.trim() || null;

    if (!locationId || !month || !year) {
      return NextResponse.json(
        { message: "Location, month, and year are required" },
        { status: 400 }
      );
    }

    if (action !== "DRAFT" && Object.keys(results).length === 0) {
      return NextResponse.json(
        { message: "At least one task result is required" },
        { status: 400 }
      );
    }

    const hasInvalidResult = Object.values(results).some(
      (result) => !validTaskResults.has(result)
    );

    if (hasInvalidResult) {
      return NextResponse.json(
        { message: "One or more task results are invalid" },
        { status: 400 }
      );
    }

    const assignment = await prisma.locationOfficer.findFirst({
      where: {
        officerId: officer.id,
        locationId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "You are not assigned to this location" },
        { status: 403 }
      );
    }

    const currentReport = body.reportId
      ? await prisma.evaluationReport.findUnique({
          where: {
            reportId: body.reportId,
          },
          include: {
            adminReview: true,
            _count: {
              select: {
                taskEvaluations: true,
              },
            },
          },
        })
      : null;

    if (body.reportId && !currentReport) {
      return NextResponse.json(
        { message: "Editable report not found" },
        { status: 404 }
      );
    }

    if (currentReport && currentReport.officerId !== officer.id) {
      return NextResponse.json(
        { message: "You can edit only your own reports" },
        { status: 403 }
      );
    }

    if (
      currentReport &&
      !editableReportStatuses.has(currentReport.status) &&
      currentReport._count.taskEvaluations > 0
    ) {
      return NextResponse.json(
        { message: "Only draft, returned, rejected, or incomplete reports can be edited" },
        { status: 400 }
      );
    }

    const allowedTaskIds = await prisma.locationTask.findMany({
      where: {
        locationId,
      },
      select: {
        locationTaskId: true,
      },
    });
    const allowedTaskIdSet = new Set(
      allowedTaskIds.map((task) => task.locationTaskId)
    );
    const submittedTaskIds = Object.keys(results);
    const hasInvalidTask = submittedTaskIds.some(
      (locationTaskId) => !allowedTaskIdSet.has(locationTaskId)
    );

    if (hasInvalidTask) {
      return NextResponse.json(
        { message: "One or more task results do not belong to this location" },
        { status: 400 }
      );
    }

    if (
      currentReport &&
      (currentReport.locationId !== locationId ||
        currentReport.evaluationMonth !== month ||
        currentReport.evaluationYear !== year)
    ) {
      return NextResponse.json(
        { message: "Report location, month, and year cannot be changed" },
        { status: 400 }
      );
    }

    const periodReport = await prisma.evaluationReport.findUnique({
      where: {
        locationId_evaluationMonth_evaluationYear: {
          locationId,
          evaluationMonth: month,
          evaluationYear: year,
        },
      },
      include: {
        _count: {
          select: {
            taskEvaluations: true,
          },
        },
      },
    });

    if (
      periodReport &&
      periodReport.reportId !== body.reportId &&
      periodReport.officerId !== officer.id
    ) {
      return NextResponse.json(
        {
          message:
            "A report already exists for this location, month, and year",
        },
        { status: 400 }
      );
    }

    const periodReportIsEditable =
      periodReport &&
      periodReport.officerId === officer.id &&
      (editableReportStatuses.has(periodReport.status) ||
        periodReport._count.taskEvaluations === 0);

    if (periodReport && periodReport.reportId !== body.reportId && !periodReportIsEditable) {
      return NextResponse.json(
        {
          message:
            "A submitted report already exists for this location, month, and year",
        },
        { status: 400 }
      );
    }

    const { totalApplicable, percentage } =
      calculatePercentage(results);

    if (action !== "DRAFT" && submittedTaskIds.length === 0) {
      return NextResponse.json(
        { message: "At least one task must be evaluated" },
        { status: 400 }
      );
    }

    if (action !== "DRAFT" && totalApplicable === 0) {
      return NextResponse.json(
        { message: "At least one applicable task is required" },
        { status: 400 }
      );
    }

    const status =
      action === "DRAFT"
        ? "DRAFT"
        : action === "RESUBMIT" || currentReport?.status === "CORRECTION_REQUESTED"
          ? "RESUBMITTED"
          : "SUBMITTED";

    const editableReportId =
      currentReport?.reportId ??
      (periodReportIsEditable ? periodReport.reportId : null);

    const taskEvaluationData = Object.entries(results).map(
      ([locationTaskId, result]) => ({
        locationTaskId,
        result,
        remarks: taskRemarks[locationTaskId]?.trim() || null,
        evaluationDate: new Date(),
        percentage: result === "P" && totalApplicable > 0 ? 100 : 0,
      })
    );

    const report = await prisma.$transaction(async (tx) => {
      const savedReport = editableReportId
        ? await tx.evaluationReport.update({
            where: {
              reportId: editableReportId,
            },
            data: {
              officerId: officer.id,
              officerRemarks,
              overallPercentage: percentage,
              status,
              submittedAt: status === "DRAFT" ? null : new Date(),
            },
          })
        : await tx.evaluationReport.create({
            data: {
              locationId,
              officerId: officer.id,
              evaluationMonth: month,
              evaluationYear: year,
              officerRemarks,
              overallPercentage: percentage,
              status,
              submittedAt: status === "DRAFT" ? null : new Date(),
            },
          });

      await tx.taskEvaluation.deleteMany({
        where: {
          reportId: savedReport.reportId,
        },
      });

      if (taskEvaluationData.length > 0) {
        await tx.taskEvaluation.createMany({
          data: taskEvaluationData.map((evaluation) => ({
            ...evaluation,
            reportId: savedReport.reportId,
          })),
        });
      }

      return savedReport;
    });

    try {
      await createActivityLog(
        officer.id,
        status === "DRAFT" ? "SAVE_DRAFT" : "SUBMIT_EVALUATION",
        status === "DRAFT"
          ? "Evaluation draft saved"
          : "Evaluation submitted for administration review",
        "EVALUATION_REPORT",
        report.reportId
      );

      if (status !== "DRAFT") {
        await notifyRole(
          "Administration Officer",
          "Evaluation report submitted",
          "A submitted evaluation report is ready for administration review.",
          report.reportId
        );
      }
    } catch (sideEffectError) {
      console.error("Evaluation saved, but post-save workflow failed", sideEffectError);
    }

    return NextResponse.json({
      success: true,
      reportId: report.reportId,
      status,
      percentage,
      message:
        status === "DRAFT"
          ? "Evaluation draft saved successfully."
          : "Evaluation submitted successfully. It is pending approval until the administration officer takes action.",
    });
  } catch (error) {
    console.error("Failed to save evaluation", error);

    return NextResponse.json(
      { message: getEvaluationSaveErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const officer = await getCurrentUser("Evaluating Officer");

    if (!officer) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const reportId = req.nextUrl.searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { message: "Report ID is required" },
        { status: 400 }
      );
    }

    const report = await prisma.evaluationReport.findFirst({
      where: {
        reportId,
        officerId: officer.id,
        status: {
          in: [
            "DRAFT",
            "CORRECTION_REQUESTED",
            "ADMIN_REJECTED",
            "VC_REJECTED",
            "REJECTED",
            "SUBMITTED",
            "RESUBMITTED",
          ],
        },
      },
      include: {
        taskEvaluations: true,
        _count: {
          select: {
            taskEvaluations: true,
          },
        },
      },
    });

    if (
      !report ||
      (!editableReportStatuses.has(report.status) &&
        report._count.taskEvaluations > 0)
    ) {
      return NextResponse.json(
        { message: "Editable report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load evaluation" },
      { status: 500 }
    );
  }
}
