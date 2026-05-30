import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const roles = await prisma.userRole.findMany({
    orderBy: {
      roleName: "asc",
    },
  });

  return NextResponse.json(roles);
}