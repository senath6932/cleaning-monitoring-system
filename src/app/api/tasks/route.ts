import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      category: true,
    },
    orderBy: {
      taskName: "asc",
    },
  });

  return NextResponse.json(tasks);
}
