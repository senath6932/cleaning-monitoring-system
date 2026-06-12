import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(
  _request: Request,
  context: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const report = await prisma.evaluationReport.findUnique({
    where: {
      reportId,
    },
    include: {
      location: true,
      officer: true,
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
      adminReview: true,
      paymentRecommendation: {
        select: {
          recommendationId: true,
          completionPercentage: true,
          contractAmount: true,
          recommendedAmount: true,
          createdAt: true,
          reportId: true,
          createdBy: true,
          creator: true,
          vcApproval: true,
        },
      },
    },
  });

  if (!report || report.adminReview?.decision !== "APPROVED") {
    return NextResponse.json(
      { message: "Approved report not found" },
      { status: 404 }
    );
  }

  const activeAgreement = await prisma.companyAgreement.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      contractStartDate: "desc",
    },
  });

  return NextResponse.json({
    ...report,
    companyAgreement: activeAgreement,
  });
}
