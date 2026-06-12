import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const status = req.nextUrl.searchParams.get("status");

  if (status === "ADMIN_APPROVED") {
    const approvedReports = await prisma.evaluationReport.findMany({
      where: {
        adminReview: {
          decision: "APPROVED",
        },
      },
      include: {
        location: true,
        officer: true,
        adminReview: {
          include: {
            SYSTEM_USER: true,
          },
        },
        paymentRecommendation: {
          select: {
            recommendationId: true,
            recommendedAmount: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(approvedReports);
  }

  const reports = await prisma.paymentRecommendation.findMany({
    where: {
      vcApproval: {
        decision: "APPROVED",
      },
    },
    select: {
      recommendationId: true,
      completionPercentage: true,
      contractAmount: true,
      recommendedAmount: true,
      createdAt: true,
      reportId: true,
      report: {
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
          },
        },
      },
      creator: true,
      vcApproval: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(
    reports.map((report) => ({
      ...report,
      status: "VC_APPROVED",
    }))
  );
}
