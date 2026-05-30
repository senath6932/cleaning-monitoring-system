import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { locationId, taskIds } = body;

    const records = taskIds.map((taskId: string) => ({
      locationId,
      taskId,
    }));

    await prisma.locationTask.createMany({
      data: records,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to save" },
      { status: 500 }
    );
  }
}
