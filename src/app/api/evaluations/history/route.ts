import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET() {
  try {
    const officer = await getCurrentUser("Evaluating Officer");

    if (!officer) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const reports = await prisma.evaluationReport.findMany({
      where: {
        officerId: officer.id,
      },
      include: {
        location: true,
        officer: true,
        adminReview: true,
        taskEvaluations: {
          include: {
            locationTask: {
              include: {
                task: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load history" },
      { status: 500 }
    );
  }
}
