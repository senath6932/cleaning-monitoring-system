import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      reportId,
      remarks,
    } = body;

    const admin =
      await prisma.systemUser.findFirst();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 400 }
      );
    }

    const review =
      await prisma.adminReview.create({
        data: {
          reportId,
          reviewedBy: admin.userId,
          remarks,
          status: "REJECTED",
        },
      });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Reject failed",
      },
      {
        status: 500,
      }
    );
  }
}
