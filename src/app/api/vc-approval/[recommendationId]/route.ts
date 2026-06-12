import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(
  _request: Request,
  context: { params: Promise<{ recommendationId: string }> }
) {
  const { recommendationId } = await context.params;
  const vc = await getCurrentUser("Vice Chancellor");

  if (!vc) {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const recommendation = await prisma.paymentRecommendation.findUnique({
    where: {
      recommendationId,
    },
    select: {
      recommendationId: true,
      completionPercentage: true,
      contractAmount: true,
      recommendedAmount: true,
      createdAt: true,
      reportId: true,
      createdBy: true,
      status: true,
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
  });

  if (!recommendation) {
    return NextResponse.json(
      { message: "Recommendation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(recommendation);
}
