import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const reports = await prisma.paymentRecommendation.findMany({
    where: {
      vcApproval: {
        decision: "APPROVED",
      },
    },
    include: {
      report: {
        include: {
          location: true,
        },
      },
      vcApproval: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(reports);
}
