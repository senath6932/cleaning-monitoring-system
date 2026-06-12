import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createActivityLog,
  getCurrentUser,
  notifyRole,
} from "@/lib/workflow";
import { calculatePaymentBreakdown } from "@/lib/payment-calculation";

async function getMonthlyContractAmount() {
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
      amount: Number(activeAgreement.monthlyContractAmount),
      source: "COMPANY_AGREEMENT",
    };
  }

  const setting = await prisma.systemSetting.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (setting) {
    return {
      amount: Number(setting.monthlyContractAmount),
      source: "SYSTEM_SETTING",
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const gaa = await getCurrentUser("General Administration Officer");

    if (!gaa) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const { reportId } = await req.json();

    const report = await prisma.evaluationReport.findUnique({
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
        taskEvaluations: {
          select: {
            locationTaskId: true,
            result: true,
          },
        },
        paymentRecommendation: {
          select: {
            recommendationId: true,
            status: true,
          },
        },
      },
    });

    if (
      !report ||
      !["ADMIN_APPROVED", "CLARIFICATION_REQUESTED"].includes(report.status)
    ) {
      return NextResponse.json(
        {
          message:
            "Only admin-approved or clarification-requested reports can be recommended",
        },
        { status: 400 }
      );
    }

    if (
      report.paymentRecommendation &&
      report.paymentRecommendation.status !== "CLARIFICATION_REQUESTED"
    ) {
      return NextResponse.json(
        { message: "A payment recommendation already exists for this report" },
        { status: 400 }
      );
    }

    const contract = await getMonthlyContractAmount();

    if (!contract) {
      return NextResponse.json(
        {
          message:
            "No active company agreement or system setting contract amount found.",
        },
        { status: 400 }
      );
    }

    const activeLocationCount = await prisma.location.count({
      where: {
        isActive: true,
      },
    });
    const breakdown = calculatePaymentBreakdown({
      monthlyContractAmount: contract.amount,
      activeLocationCount,
      locationTasks: report.location.tasks,
      taskEvaluations: report.taskEvaluations,
    });

    const recommendation =
      await prisma.paymentRecommendation.upsert({
        where: {
          reportId,
        },
        create: {
          reportId,
          createdBy: gaa.id,
          completionPercentage: breakdown.completionPercentage,
          contractAmount: breakdown.locationMonthlyAllocation,
          recommendedAmount: breakdown.recommendedAmount,
          status: "VC_PENDING",
        },
        update: {
          createdBy: gaa.id,
          completionPercentage: breakdown.completionPercentage,
          contractAmount: breakdown.locationMonthlyAllocation,
          recommendedAmount: breakdown.recommendedAmount,
          status: "VC_PENDING",
        },
      });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "VC_PENDING",
      },
    });

    await notifyRole(
      "Vice Chancellor",
      "Payment recommendation pending",
      "A payment recommendation is waiting for Vice Chancellor approval.",
      reportId
    );

    await createActivityLog(
      gaa.id,
      "CREATE_PAYMENT_RECOMMENDATION",
      "GAA created payment recommendation",
      "PAYMENT_RECOMMENDATION",
      recommendation.recommendationId
    );

    return NextResponse.json({
      success: true,
      recommendation,
      contractSource: contract.source,
      breakdown,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create recommendation" },
      { status: 500 }
    );
  }
}
