import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const officers = await prisma.systemUser.findMany({
    where: {
      isActive: true,
      role: {
        roleName: "Evaluating Officer",
      },
    },
    select: {
      id: true,
      fullName: true,
      designation: true,
      email: true,
    },
  });

  return NextResponse.json(officers);
}
