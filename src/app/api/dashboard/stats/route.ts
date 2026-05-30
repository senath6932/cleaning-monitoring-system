import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalUsers,
    totalLocations,
    totalEvaluations,
    pendingReviews,
    pendingVCApprovals,
    approvedReports,
  ] = await Promise.all([
    prisma.systemUser.count(),
    prisma.location.count(),
    prisma.evaluationReport.count(),
    prisma.evaluationReport.count({
      where: {
        adminReview: null,
      },
    }),
    prisma.paymentRecommendation.count({
      where: {
        vcApproval: null,
      },
    }),
    prisma.vCApproval.count({
      where: {
        decision: "APPROVED",
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalLocations,
    totalEvaluations,
    pendingReviews,
    pendingVCApprovals,
    approvedReports,
  });
}
