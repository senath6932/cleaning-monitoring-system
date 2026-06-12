import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      category: true,
    },
    orderBy: {
      taskName: "asc",
    },
  });

  const uniqueTasks = Array.from(
    new Map(
      tasks.map((task) => [
        task.taskName.trim().toLowerCase(),
        task,
      ])
    ).values()
  );

  return NextResponse.json(uniqueTasks);
}

export async function POST(req: NextRequest) {
  try {
    const gaa = await getCurrentUser("General Administration Officer");

    if (!gaa) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const taskName = String(body.taskName || "").trim();
    const description = String(body.description || "").trim();
    const categoryId = String(body.categoryId || "").trim();

    if (!taskName || !categoryId) {
      return NextResponse.json(
        { message: "Task name and frequency are required." },
        { status: 400 }
      );
    }

    if (taskName.length > 120) {
      return NextResponse.json(
        { message: "Task name must be 120 characters or fewer." },
        { status: 400 }
      );
    }

    const [category, existingTasks] = await Promise.all([
      prisma.taskCategory.findUnique({
        where: { categoryId },
        select: { categoryId: true },
      }),
      prisma.task.findMany({
        select: { taskName: true },
      }),
    ]);

    if (!category) {
      return NextResponse.json(
        { message: "Selected frequency does not exist." },
        { status: 400 }
      );
    }

    if (
      existingTasks.some(
        (task) => task.taskName.trim().toLowerCase() === taskName.toLowerCase()
      )
    ) {
      return NextResponse.json(
        { message: "A task with this name already exists." },
        { status: 409 }
      );
    }

    const task = await prisma.task.create({
      data: {
        taskName,
        description: description || null,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task", error);

    return NextResponse.json(
      { message: "Failed to create task." },
      { status: 500 }
    );
  }
}
