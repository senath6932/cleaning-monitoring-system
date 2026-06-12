import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET(
  _request: Request,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await context.params;
    const officer = await getCurrentUser("Evaluating Officer");

    if (!officer) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const assignment = await prisma.locationOfficer.findFirst({
      where: {
        officerId: officer.id,
        locationId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "You are not assigned to this location" },
        { status: 403 }
      );
    }

    const tasks = await prisma.locationTask.findMany({
      where: {
        locationId,
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
