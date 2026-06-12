import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

const gaaStatuses = [
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
  "CORRECTION_REQUESTED",
] as const;

export async function GET(req: NextRequest) {
  try {
    const gaa = await getCurrentUser("General Administration Officer");

    if (!gaa) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const status = req.nextUrl.searchParams.get("status");
    const month = Number(req.nextUrl.searchParams.get("month") || "");
    const year = Number(req.nextUrl.searchParams.get("year") || "");
    const locationId = req.nextUrl.searchParams.get("locationId");

    const reports = await prisma.evaluationReport.findMany({
      where: {
        status: gaaStatuses.includes(status as (typeof gaaStatuses)[number])
          ? status as (typeof gaaStatuses)[number]
          : {
              in: [...gaaStatuses],
            },
        evaluationMonth: month || undefined,
        evaluationYear: year || undefined,
        locationId: locationId || undefined,
      },
      include: {
        location: true,
        officer: true,
        adminReview: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load GAA reports" },
      { status: 500 }
    );
  }
}
