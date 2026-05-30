import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  const setting =
    await prisma.systemSetting.findFirst();

  if (!setting) {
    const created = await prisma.systemSetting.create({
      data: {
        monthlyContractAmount: amount,
      },
    });

    return NextResponse.json(created);
  }

  const updated =
    await prisma.systemSetting.update({
      where: {
        settingId: setting!.settingId,
      },
      data: {
        monthlyContractAmount: amount,
      },
    });

  return NextResponse.json(updated);
}
