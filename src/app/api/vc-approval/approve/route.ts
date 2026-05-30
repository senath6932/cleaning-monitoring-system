import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { recommendationId, remarks } = await req.json();

    const vc = await prisma.systemUser.findFirst();

    if (!vc) {
      return NextResponse.json(
        { message: "VC not found" },
        { status: 400 }
      );
    }

    const approval = await prisma.vCApproval.create({
      data: {
        recommendationId,
        approvedBy: vc.userId,
        decision: "APPROVED",
        remarks,
      },
    });

    return NextResponse.json({
      success: true,
      approval,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Approval failed",
      },
      {
        status: 500,
      }
    );
  }
}
