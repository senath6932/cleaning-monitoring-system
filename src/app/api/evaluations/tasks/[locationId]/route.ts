import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { locationId: string } }
) {
  try {
    const tasks = await prisma.locationTask.findMany({
      where: {
        locationId: params.locationId,
      },
      include: {
        task: {
          include: {
            category: true,
          },
        },
      },
    });

    const result = tasks.map((item) => ({
      locationTaskId: item.locationTaskId,
      taskId: item.task.taskId,
      taskName: item.task.taskName,
      categoryName: item.task.category.categoryName,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load tasks" },
      { status: 500 }
    );
  }
}
