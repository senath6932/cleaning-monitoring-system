import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(req: NextRequest) {
  const gaa = await getCurrentUser("General Administration Officer");

  if (!gaa) {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const month = Number(req.nextUrl.searchParams.get("month") || "");
  const year = Number(req.nextUrl.searchParams.get("year") || "");
  const locationId = req.nextUrl.searchParams.get("locationId");
  const status = req.nextUrl.searchParams.get("status");

  const reports = await prisma.evaluationReport.findMany({
      where: {
        adminReview: {
          decision: "APPROVED",
        },
        status: status === "CLARIFICATION_REQUESTED"
          ? "CLARIFICATION_REQUESTED"
          : undefined,
        evaluationMonth: month || undefined,
        evaluationYear: year || undefined,
        locationId: locationId || undefined,
      },
      include: {
        location: true,
        adminReview: true,
        officer: true,
        paymentRecommendation: {
          select: {
            recommendationId: true,
            completionPercentage: true,
            contractAmount: true,
            recommendedAmount: true,
            createdAt: true,
            reportId: true,
            createdBy: true,
            status: true,
            vcApproval: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

  return NextResponse.json(reports);
}
