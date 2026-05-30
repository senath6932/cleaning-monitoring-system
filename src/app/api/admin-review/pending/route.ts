import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.evaluationReport.findMany({
      where: {
        status: "SUBMITTED",
      },
      include: {
        location: true,
        officer: true,
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
