import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: any
) {
  const { reportId } =
    await context.params;

  const report =
    await prisma.evaluationReport.findUnique({
      where: {
        reportId,
      },
      include: {
        location: true,
      },
    });

  return NextResponse.json(report);
}
