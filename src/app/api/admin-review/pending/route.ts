import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET() {
  try {
    const admin = await getCurrentUser("Administration Officer");

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const reports = await prisma.evaluationReport.findMany({
      where: {
        OR: [
          {
            status: {
              in: ["SUBMITTED", "RESUBMITTED"],
            },
          },
          {
            adminReview: {
              isNot: null,
            },
          },
        ],
      },
      include: {
        location: true,
        officer: true,
        adminReview: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load reports" },
      { status: 500 }
    );
  }
}
