import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET() {
  const vc = await getCurrentUser("Vice Chancellor");

  if (!vc) {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const recommendations =
    await prisma.paymentRecommendation.findMany({
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
            adminReview: true,
            officer: true,
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
    recommendations
  );
}
