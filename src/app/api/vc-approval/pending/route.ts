import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recommendations =
    await prisma.paymentRecommendation.findMany({
      where: {
        vcApproval: null,
      },
      include: {
        report: {
          include: {
            location: true,
          },
        },
      },
    });

  return NextResponse.json(
    recommendations
  );
}