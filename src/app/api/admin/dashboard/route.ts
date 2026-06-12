import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

const pendingReviewStatuses = ["SUBMITTED", "RESUBMITTED"] as const;

export async function GET() {
  try {
    const admin = await getCurrentUser("Administration Officer");

    if (!admin) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const [totalLocations, totalOfficers, pendingReviews, reviewedByAdmin, reports] =
      await Promise.all([
        prisma.location.count({
          where: {
            isActive: true,
          },
        }),
        prisma.systemUser.count({
          where: {
            isActive: true,
            role: {
              roleName: "Evaluating Officer",
            },
          },
        }),
        prisma.evaluationReport.count({
          where: {
            status: {
              in: [...pendingReviewStatuses],
            },
          },
        }),
        prisma.adminReview.count({
          where: {
            adminOfficerId: admin.id,
          },
        }),
        prisma.evaluationReport.findMany({
          where: {
            status: {
              in: [...pendingReviewStatuses],
            },
          },
          take: 8,
          orderBy: {
            submittedAt: "desc",
          },
          select: {
            reportId: true,
            evaluationMonth: true,
            evaluationYear: true,
            overallPercentage: true,
            status: true,
            submittedAt: true,
            location: {
              select: {
                code: true,
                locationName: true,
              },
            },
            officer: {
              select: {
                fullName: true,
                designation: true,
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      stats: {
        totalLocations,
        totalOfficers,
        pendingReviews,
        reviewedByAdmin,
      },
      pendingReports: reports.map((report) => ({
        ...report,
        overallPercentage: Number(report.overallPercentage ?? 0),
      })),
    });
  } catch (error) {
    console.error("Failed to load administration dashboard", error);

    return NextResponse.json(
      { message: "Failed to load administration dashboard data" },
      { status: 500 }
    );
  }
}
