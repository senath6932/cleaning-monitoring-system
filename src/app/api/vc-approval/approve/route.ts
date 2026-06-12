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
        decision: "APPROVED",
        remarks: remarks || null,
        approvedAt: new Date(),
      },
      update: {
        approvedBy: vc.id,
        decision: "APPROVED",
        remarks: remarks || null,
        approvedAt: new Date(),
      },
    });

    await prisma.evaluationReport.update({
      where: {
        reportId: recommendation.reportId,
      },
      data: {
        status: "VC_APPROVED",
      },
    });

    await prisma.paymentRecommendation.update({
      where: {
        recommendationId,
      },
      data: {
        status: "VC_APPROVED",
      },
    });

    await notifyRole(
      "General Administration Officer",
      "Payment recommendation approved",
      "Vice Chancellor approved a payment recommendation.",
      recommendation.reportId
    );

    await createActivityLog(
      vc.id,
      "VC_APPROVE_RECOMMENDATION",
      "Vice Chancellor approved payment recommendation",
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
      { message: "Approval failed" },
      { status: 500 }
    );
  }
}
