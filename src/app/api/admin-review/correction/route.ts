import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createActivityLog,
  getCurrentUser,
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
        { message: "Correction remarks are required" },
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
        decision: "CORRECTION_REQUESTED",
        reviewedAt: new Date(),
      },
      update: {
        adminOfficerId: admin.id,
        remarks,
        decision: "CORRECTION_REQUESTED",
        reviewedAt: new Date(),
      },
    });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "CORRECTION_REQUESTED",
      },
    });

    await notifyUser(
      report.officerId,
      "Correction requested",
      "Administration Officer requested corrections for your evaluation report.",
      reportId
    );

    await createActivityLog(
      admin.id,
      "ADMIN_REQUEST_CORRECTION",
      "Administration Officer requested correction",
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
      { message: "Correction request failed" },
      { status: 500 }
    );
  }
}
