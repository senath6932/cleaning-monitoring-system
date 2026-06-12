import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const activeAgreement =
    await prisma.companyAgreement.findFirst({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        contractStartDate: "desc",
      },
    });

  if (!activeAgreement) {
    return NextResponse.json(
      {
        message:
          "No active company agreement found. Please add company details first.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...activeAgreement,
    monthlyContractAmount: Number(
      activeAgreement.monthlyContractAmount
    ),
    totalContractAmount:
      activeAgreement.totalContractAmount === null
        ? null
        : Number(activeAgreement.totalContractAmount),
  });
}
