import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";
import { calculatePaymentBreakdown } from "@/lib/payment-calculation";

async function getContractContext() {
  const activeAgreement = await prisma.companyAgreement.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      contractStartDate: "desc",
    },
  });

  if (activeAgreement) {
    return {
      monthlyContractAmount: activeAgreement.monthlyContractAmount,
      source: "COMPANY_AGREEMENT",
      agreement: activeAgreement,
    };
  }

  const setting = await prisma.systemSetting.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    monthlyContractAmount: setting?.monthlyContractAmount ?? null,
    source: setting ? "SYSTEM_SETTING" : null,
    agreement: null,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ reportId: string }> }
) {
  const { reportId } =
    await context.params;
  const gaa = await getCurrentUser("General Administration Officer");

  if (!gaa) {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const report =
    await prisma.evaluationReport.findUnique({
      where: {
        reportId,
      },
      include: {
        location: {
          include: {
            tasks: {
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
        officer: true,
        adminReview: true,
        taskEvaluations: {
          select: {
            locationTaskId: true,
            result: true,
          },
        },
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

  if (
    !report ||
    ![
      "ADMIN_APPROVED",
      "VC_PENDING",
      "VC_APPROVED",
      "VC_REJECTED",
      "CLARIFICATION_REQUESTED",
    ].includes(report.status)
  ) {
    return NextResponse.json(
      { message: "Payment recommendation report not found" },
      { status: 404 }
    );
  }

  const contract = await getContractContext();
  const monthlyContractAmount = Number(contract.monthlyContractAmount ?? 0);
  const activeLocationCount = await prisma.location.count({
    where: {
      isActive: true,
    },
  });
  const breakdown = calculatePaymentBreakdown({
    monthlyContractAmount,
    activeLocationCount,
    locationTasks: report.location.tasks,
    taskEvaluations: report.taskEvaluations,
  });

  return NextResponse.json({
    report,
    contract,
    preview: {
      ...breakdown,
    },
  });
}
