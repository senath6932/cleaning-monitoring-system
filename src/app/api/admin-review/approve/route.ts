import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createActivityLog,
  getCurrentUser,
  notifyRole,
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
        remarks: remarks || null,
        decision: "APPROVED",
        reviewedAt: new Date(),
      },
      update: {
        adminOfficerId: admin.id,
        remarks: remarks || null,
        decision: "APPROVED",
        reviewedAt: new Date(),
      },
    });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "ADMIN_APPROVED",
      },
    });

    await notifyRole(
      "General Administration Officer",
      "Evaluation approved",
      "An administration-approved evaluation report is ready for GAA viewing.",
      reportId
    );

    await createActivityLog(
      admin.id,
      "ADMIN_APPROVE_REPORT",
      "Administration Officer approved evaluation report",
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
      { message: "Approval failed" },
      { status: 500 }
    );
  }
}
