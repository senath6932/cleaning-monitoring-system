import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      reportId,
      completionPercentage,
      contractAmount,
      recommendedAmount,
    } = body;

    // TEMPORARY
    const user =
      await prisma.systemUser.findFirst();

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    const recommendation =
      await prisma.paymentRecommendation.create({
        data: {
          reportId,
          createdBy: user.userId,

          completionPercentage,

          contractAmount,

          recommendedAmount,
        },
      });

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to create recommendation",
      },
      {
        status: 500,
      }
    );
  }
}
