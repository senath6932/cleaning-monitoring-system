import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json([]);
    }

    const locationTasks = await prisma.locationTask.findMany({
      where: {
        locationId,
      },
      select: {
        taskId: true,
      },
    });

    return NextResponse.json(
      locationTasks.map((locationTask) => locationTask.taskId)
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load assigned tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const locationId = String(body.locationId || "").trim();
    const taskIds: string[] = Array.isArray(body.taskIds)
      ? Array.from(
          new Set(
            body.taskIds
              .map((taskId: unknown) => String(taskId || "").trim())
              .filter(Boolean)
          )
        )
      : [];

    if (!locationId) {
      return NextResponse.json(
        { message: "Location is required." },
        { status: 400 }
      );
    }

    const [location, validTaskCount] = await Promise.all([
      prisma.location.findFirst({
        where: {
          locationId,
          isActive: true,
        },
        select: {
          locationId: true,
        },
      }),
      prisma.task.count({
        where: {
          taskId: {
            in: taskIds,
          },
        },
      }),
    ]);

    if (!location) {
      return NextResponse.json(
        { message: "Selected location does not exist." },
        { status: 400 }
      );
    }

    if (validTaskCount !== taskIds.length) {
      return NextResponse.json(
        { message: "One or more selected tasks are invalid." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.locationTask.deleteMany({
        where: {
          locationId,
          taskEvaluations: {
            none: {},
          },
          ...(taskIds.length
            ? {
                taskId: {
                  notIn: taskIds,
                },
              }
            : {}),
        },
      });

      if (taskIds.length) {
        await transaction.locationTask.createMany({
          data: taskIds.map((taskId) => ({
            locationId,
            taskId,
          })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({
      success: true,
      taskIds,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to save" },
      { status: 500 }
    );
  }
}
