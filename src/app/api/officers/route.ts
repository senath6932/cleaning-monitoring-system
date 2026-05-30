import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const officers = await prisma.systemUser.findMany({
    where: {
      role: {
        roleName: "Evaluating Officer",
      },
    },
    select: {
      userId: true,
      fullName: true,
    },
  });

  return NextResponse.json(officers);
}