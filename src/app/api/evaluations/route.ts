import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      locationId,
      month,
      year,
      results,
    } = body;

    // TEMPORARY
    // Later replace with logged-in user id
    const officer = await prisma.systemUser.findFirst();

    if (!officer) {
      return NextResponse.json(
        { message: "Officer not found" },
        { status: 400 }
      );
    }

    const report =
      await prisma.evaluationReport.create({
        data: {
          locationId,
          officerId: officer.userId,
          evaluationMonth: month,
          evaluationYear: year,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

    let completed = 0;
    let total = 0;

    for (const locationTaskId of Object.keys(results)) {
      const result = results[locationTaskId];

      if (result !== "NA") {
        total++;
      }

      if (result === "P") {
        completed++;
      }

      await prisma.taskEvaluation.create({
        data: {
          reportId: report.reportId,
          locationTaskId,
          result,
          evaluationDate: new Date(),
        },
      });
    }

    const percentage =
      total === 0
        ? 0
        : (completed / total) * 100;

    await prisma.evaluationReport.update({
      where: {
        reportId: report.reportId,
      },
      data: {
        overallPercentage: percentage,
      },
    });

    return NextResponse.json({
      success: true,
      percentage,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to save evaluation",
      },
      {
        status: 500,
      }
    );
  }
}
