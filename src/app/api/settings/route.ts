import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const setting =
    await prisma.systemSetting.findFirst();

  if (setting) {
    return NextResponse.json(setting);
  }

  const created = await prisma.systemSetting.create({
    data: {
      monthlyContractAmount: 0,
    },
  });

  return NextResponse.json(created);
}
