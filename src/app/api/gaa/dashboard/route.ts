import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const pendingReviewStatuses = ["SUBMITTED", "RESUBMITTED"] as const;

export async function GET() {
  try {
    const gaa = await getCurrentUser("General Administration Officer");

    if (!gaa) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [
      totalUsers,
      totalLocations,
      totalEvaluations,
      pendingReviews,
      pendingVCApprovals,
      approvedReports,
      assignedOfficerRows,
      activeAgreement,
      monthlyProgress,
      unassignedLocations,
      inactiveOfficers,
      recentActivities,
      locationRows,
    ] = await Promise.all([
      prisma.systemUser.count(),
      prisma.location.count({ where: { isActive: true } }),
      prisma.evaluationReport.count(),
      prisma.evaluationReport.count({
        where: { status: { in: [...pendingReviewStatuses] } },
      }),
      prisma.paymentRecommendation.count({
        where: { vcApproval: null },
      }),
      prisma.evaluationReport.count({
        where: { status: "VC_APPROVED" },
      }),
      prisma.locationOfficer.findMany({
        distinct: ["officerId"],
        select: { officerId: true },
      }),
      prisma.companyAgreement.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { contractStartDate: "desc" },
      }),
      prisma.evaluationReport.groupBy({
        by: ["evaluationMonth"],
        where: {
          evaluationYear: year,
          overallPercentage: { not: null },
        },
        _avg: { overallPercentage: true },
        _count: { reportId: true },
        orderBy: { evaluationMonth: "asc" },
      }),
      prisma.location.count({
        where: { isActive: true, officers: { none: {} } },
      }),
      prisma.systemUser.count({
        where: {
          isActive: false,
          role: { roleName: "Evaluating Officer" },
        },
      }),
      prisma.aCTIVITY_LOGS.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          SYSTEM_USER: {
            select: { fullName: true },
          },
        },
      }),
      prisma.location.findMany({
        where: { isActive: true },
        orderBy: { locationName: "asc" },
        include: {
          officers: {
            take: 1,
            orderBy: { assignedDate: "desc" },
            include: {
              officer: { select: { fullName: true } },
            },
          },
          evaluationReports: {
            where: {
              evaluationMonth: month,
              evaluationYear: year,
            },
            take: 1,
            orderBy: { updatedAt: "desc" },
            select: {
              overallPercentage: true,
              status: true,
              evaluationMonth: true,
              evaluationYear: true,
            },
          },
        },
      }),
    ]);

    const progressByMonth = new Map(
      monthlyProgress.map((entry) => [
        entry.evaluationMonth,
        {
          percentage: Math.round(Number(entry._avg.overallPercentage ?? 0)),
          reports: entry._count.reportId,
        },
      ])
    );

    const payload = {
      generatedAt: now.toISOString(),
      year,
      month,
      stats: {
        totalUsers,
        totalLocations,
        totalEvaluations,
        pendingReviews,
        pendingVCApprovals,
        approvedReports,
        assignedOfficers: assignedOfficerRows.length,
        monthlyContractAmount: Number(
          activeAgreement?.monthlyContractAmount ?? 0
        ),
      },
      monthlyProgress: Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        percentage: progressByMonth.get(index + 1)?.percentage ?? 0,
        reports: progressByMonth.get(index + 1)?.reports ?? 0,
      })),
      pendingActions: {
        pendingReviews,
        pendingVCApprovals,
        unassignedLocations,
        inactiveOfficers,
      },
      recentActivities: recentActivities.map((activity) => ({
        id: activity.logId,
        action: activity.action,
        description: activity.description,
        user: activity.SYSTEM_USER.fullName,
        createdAt: activity.createdAt,
      })),
      locations: locationRows.map((location) => {
        const report = location.evaluationReports[0];

        return {
          id: location.locationId,
          code: location.code,
          name: location.locationName,
          officer: location.officers[0]?.officer.fullName ?? "Not assigned",
          completion: Number(report?.overallPercentage ?? 0),
          reportStatus: report?.status ?? "NO_REPORT",
          reportMonth: report?.evaluationMonth ?? null,
          reportYear: report?.evaluationYear ?? null,
        };
      }),
      agreement: activeAgreement
        ? {
            companyName: activeAgreement.companyName,
            startDate: activeAgreement.contractStartDate,
            endDate: activeAgreement.contractEndDate,
            status: activeAgreement.status,
          }
        : null,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to load GAA dashboard", error);

    return NextResponse.json(
      { message: "Failed to load GAA dashboard data" },
      { status: 500 }
    );
  }
}
