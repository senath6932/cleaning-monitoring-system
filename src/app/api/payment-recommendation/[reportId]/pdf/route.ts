import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePaymentRecommendationPdf } from "@/lib/payment-report-pdf";
import { calculatePaymentBreakdown } from "@/lib/payment-calculation";
import { getCurrentUser } from "@/lib/workflow";

async function getContractContext() {
  const agreement = await prisma.companyAgreement.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      contractStartDate: "desc",
    },
  });

  if (agreement) {
    return {
      agreement,
      monthlyContractAmount: Number(agreement.monthlyContractAmount),
    };
  }

  const setting = await prisma.systemSetting.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    agreement: null,
    monthlyContractAmount: Number(setting?.monthlyContractAmount ?? 0),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await context.params;
    const user = await getCurrentUser();

    if (
      !user ||
      ![
        "General Administration Officer",
        "Vice Chancellor",
        "Administration Officer",
        "Finance Officer",
      ].includes(user.role ?? "")
    ) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const recommendation = await prisma.paymentRecommendation.findUnique({
      where: {
        reportId,
      },
      select: {
        recommendationId: true,
        completionPercentage: true,
        contractAmount: true,
        recommendedAmount: true,
        createdAt: true,
        reportId: true,
        createdBy: true,
        creator: true,
        report: {
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
            adminReview: true,
            taskEvaluations: {
              select: {
                locationTaskId: true,
                result: true,
              },
            },
          },
        },
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { message: "Payment recommendation not found" },
        { status: 404 }
      );
    }

    const [contract, activeLocationCount] = await Promise.all([
      getContractContext(),
      prisma.location.count({ where: { isActive: true } }),
    ]);
    const breakdown = calculatePaymentBreakdown({
      monthlyContractAmount: contract.monthlyContractAmount,
      activeLocationCount,
      locationTasks: recommendation.report.location.tasks,
      taskEvaluations: recommendation.report.taskEvaluations,
    });
    const pdf = generatePaymentRecommendationPdf(
      recommendation,
      contract.agreement,
      breakdown
    );

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="payment-${recommendation.recommendationId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to generate payment recommendation PDF" },
      { status: 500 }
    );
  }
}
