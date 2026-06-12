import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Simple in-memory cache to reduce repeated DB load for dashboard stats in dev/local.
// TTL is short to keep numbers fresh while preventing spikes on frequent reloads.
let cache: { ts: number; payload: any } | null = null;
const TTL = 30 * 1000; // 30 seconds

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.payload);
  }

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
    prisma.evaluationReport.count({
      where: {
        adminReview: {
          decision: "APPROVED",
        },
      },
    }),
  ]);

  const payload = {
    totalUsers,
    totalLocations,
    totalEvaluations,
    pendingReviews,
    pendingVCApprovals,
    approvedReports,
  };

  cache = { ts: Date.now(), payload };

  return NextResponse.json(payload);
}
