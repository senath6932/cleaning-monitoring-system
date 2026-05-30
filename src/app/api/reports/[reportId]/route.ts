import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const { reportId } = await context.params;

  const report = await prisma.evaluationReport.findUnique({
    where: {
      reportId,
    },
    include: {
      location: true,
      taskEvaluations: {
        include: {
          locationTask: {
            include: {
              task: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
      adminReview: true,
      paymentRecommendation: {
        include: {
          vcApproval: true,
        },
      },
    },
  });

  return NextResponse.json(report);
}
