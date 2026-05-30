import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports =
    await prisma.evaluationReport.findMany({
      where: {
        status: "VERIFIED",
      },
      include: {
        location: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

  return NextResponse.json(reports);
}