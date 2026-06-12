import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

const pendingApprovalStatuses = ["SUBMITTED", "RESUBMITTED"] as const;

export async function GET() {
  try {
    const officer = await getCurrentUser("Evaluating Officer");

    if (!officer) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [assignments, pendingApprovals, draftReports] = await Promise.all([
      prisma.locationOfficer.findMany({
        where: {
          officerId: officer.id,
          location: {
            isActive: true,
          },
        },
        select: {
          assignedDate: true,
          location: {
            select: {
              locationId: true,
              code: true,
              locationName: true,
              minWorkers: true,
              evaluationReports: {
                where: {
                  officerId: officer.id,
                  evaluationMonth: month,
                  evaluationYear: year,
                },
                take: 1,
                orderBy: {
                  updatedAt: "desc",
                },
                select: {
                  reportId: true,
                  status: true,
                  overallPercentage: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
        orderBy: {
          location: {
            locationName: "asc",
          },
        },
      }),
      prisma.evaluationReport.count({
        where: {
          officerId: officer.id,
          status: {
            in: [...pendingApprovalStatuses],
          },
        },
      }),
      prisma.evaluationReport.count({
        where: {
          officerId: officer.id,
          status: "DRAFT",
        },
      }),
    ]);

    const requiredWorkers = assignments.reduce(
      (total, assignment) => total + assignment.location.minWorkers,
      0
    );

    return NextResponse.json({
      generatedAt: now.toISOString(),
      month,
      year,
      stats: {
        assignedLocations: assignments.length,
        requiredWorkers,
        pendingApprovals,
        draftReports,
      },
      locations: assignments.map((assignment) => {
        const report = assignment.location.evaluationReports[0];

        return {
          locationId: assignment.location.locationId,
          code: assignment.location.code,
          name: assignment.location.locationName,
          minWorkers: assignment.location.minWorkers,
          assignedDate: assignment.assignedDate,
          currentReportId: report?.reportId ?? null,
          currentReportStatus: report?.status ?? "NOT_STARTED",
          currentPercentage: Number(report?.overallPercentage ?? 0),
          reportUpdatedAt: report?.updatedAt ?? null,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to load officer dashboard", error);

    return NextResponse.json(
      { message: "Failed to load officer dashboard data" },
      { status: 500 }
    );
  }
}
