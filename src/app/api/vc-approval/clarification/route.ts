import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createActivityLog,
  getCurrentUser,
  notifyRole,
} from "@/lib/workflow";

export async function POST(req: NextRequest) {
  try {
    const vc = await getCurrentUser("Vice Chancellor");

    if (!vc) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const { recommendationId, remarks } = await req.json();

    if (!remarks?.trim()) {
      return NextResponse.json(
        { message: "Clarification remarks are required" },
        { status: 400 }
      );
    }

    const recommendation =
      await prisma.paymentRecommendation.findFirst({
        where: {
          recommendationId,
          status: "VC_PENDING",
          report: {
            status: "VC_PENDING",
          },
        },
      });

    if (!recommendation) {
      return NextResponse.json(
        { message: "Pending recommendation not found" },
        { status: 404 }
      );
    }

    const approval = await prisma.vCApproval.upsert({
      where: {
        recommendationId,
      },
      create: {
        recommendationId,
        approvedBy: vc.id,
        decision: "CLARIFICATION_REQUESTED",
        remarks,
        approvedAt: new Date(),
      },
      update: {
        approvedBy: vc.id,
        decision: "CLARIFICATION_REQUESTED",
        remarks,
        approvedAt: new Date(),
      },
    });

    await prisma.evaluationReport.update({
      where: {
        reportId: recommendation.reportId,
      },
      data: {
        status: "CLARIFICATION_REQUESTED",
      },
    });

    await prisma.paymentRecommendation.update({
      where: {
        recommendationId,
      },
      data: {
        status: "CLARIFICATION_REQUESTED",
      },
    });

    await notifyRole(
      "General Administration Officer",
      "Clarification requested",
      "Vice Chancellor requested clarification for a payment recommendation.",
      recommendation.reportId
    );

    await createActivityLog(
      vc.id,
      "VC_REQUEST_CLARIFICATION",
      "Vice Chancellor requested clarification",
      "VC_APPROVAL",
      approval.approvalId
    );

    return NextResponse.json({
      success: true,
      approval,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Clarification request failed" },
      { status: 500 }
    );
  }
}
