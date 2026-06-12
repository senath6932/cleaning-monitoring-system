import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createActivityLog,
  getCurrentUser,
  notifyRole,
  notifyUser,
} from "@/lib/workflow";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser("Administration Officer");

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const { reportId, remarks } = await req.json();

    if (!remarks?.trim()) {
      return NextResponse.json(
        { message: "Remarks are required for rejection" },
        { status: 400 }
      );
    }

    const report = await prisma.evaluationReport.findFirst({
      where: {
        reportId,
        status: {
          in: ["SUBMITTED", "RESUBMITTED"],
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Pending report not found" },
        { status: 404 }
      );
    }

    const review = await prisma.adminReview.upsert({
      where: {
        reportId,
      },
      create: {
        reportId,
        adminOfficerId: admin.id,
        remarks,
        decision: "REJECTED",
        reviewedAt: new Date(),
      },
      update: {
        adminOfficerId: admin.id,
        remarks,
        decision: "REJECTED",
        reviewedAt: new Date(),
      },
    });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "ADMIN_REJECTED",
      },
    });

    await notifyUser(
      report.officerId,
      "Evaluation rejected",
      "Your evaluation report was rejected by Administration Officer.",
      reportId
    );

    await notifyRole(
      "General Administration Officer",
      "Evaluation rejected",
      "An evaluation report was rejected during administration review.",
      reportId
    );

    await createActivityLog(
      admin.id,
      "ADMIN_REJECT_REPORT",
      "Administration Officer rejected evaluation report",
      "EVALUATION_REPORT",
      reportId
    );

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Reject failed" },
      { status: 500 }
    );
  }
}
