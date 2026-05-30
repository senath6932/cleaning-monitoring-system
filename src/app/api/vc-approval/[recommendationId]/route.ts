import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: any) {
  const { recommendationId } = await context.params;

  const recommendation = await prisma.paymentRecommendation.findUnique({
    where: {
      recommendationId,
    },
    include: {
      report: {
        include: {
          location: true,
        },
      },
    },
  });

  return NextResponse.json(recommendation);
}
