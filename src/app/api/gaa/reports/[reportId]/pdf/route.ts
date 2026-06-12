import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEvaluationReportPdf } from "@/lib/report-pdf";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(
  _request: Request,
  context: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await context.params;
    const user = await getCurrentUser();

    if (
      !user ||
      ![
        "General Administration Officer",
        "Administration Officer",
        "Vice Chancellor",
        "Finance Officer",
      ].includes(user.role ?? "")
    ) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const report = await prisma.evaluationReport.findFirst({
      where: {
        reportId,
        status: {
          in: ["ADMIN_APPROVED", "VC_PENDING", "VC_APPROVED"],
        },
      },
      include: {
        location: true,
        officer: true,
        adminReview: true,
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
          orderBy: {
            evaluationDate: "asc",
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Approved report not found" },
        { status: 404 }
      );
    }

    const pdf = generateEvaluationReportPdf(report);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="evaluation-${report.reportId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
