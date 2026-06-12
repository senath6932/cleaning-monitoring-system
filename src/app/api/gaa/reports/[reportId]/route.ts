import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(
  _request: Request,
  context: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await context.params;
    const gaa = await getCurrentUser("General Administration Officer");

    if (!gaa) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const report = await prisma.evaluationReport.findFirst({
      where: {
        reportId,
        status: {
          in: [
            "ADMIN_APPROVED",
            "ADMIN_REJECTED",
            "CORRECTION_REQUESTED",
          ],
        },
      },
      include: {
        location: true,
        officer: true,
        adminReview: true,
        taskEvaluations: {
          include: {
            locationTask: {
              include: {
                task: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: {
            evaluationDate: "asc",
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load GAA report" },
      { status: 500 }
    );
  }
}
