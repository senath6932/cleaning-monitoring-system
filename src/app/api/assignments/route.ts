import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET() {
  try {
    const gaa = await getCurrentUser("General Administration Officer");
    if (!gaa) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const assignments = await prisma.locationOfficer.findMany({
      include: {
        location: {
          select: {
            locationId: true,
            code: true,
            locationName: true,
            minWorkers: true,
            isActive: true,
          },
        },
        officer: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        assignedDate: "desc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to load assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const gaa = await getCurrentUser("General Administration Officer");
    if (!gaa) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const officerId = String(body.officerId || "").trim();
    const locationId = String(body.locationId || "").trim();

    if (!officerId || !locationId) {
      return NextResponse.json(
        { message: "Officer and location are required." },
        { status: 400 }
      );
    }

    const [officer, location] = await Promise.all([
      prisma.systemUser.findFirst({
        where: {
          id: officerId,
          isActive: true,
          role: { roleName: "Evaluating Officer" },
        },
        select: { id: true },
      }),
      prisma.location.findFirst({
        where: { locationId, isActive: true },
        select: { locationId: true },
      }),
    ]);

    if (!officer || !location) {
      return NextResponse.json(
        { message: "Selected officer or location is invalid." },
        { status: 400 }
      );
    }

    const assignment = await prisma.$transaction(async (transaction) => {
      await transaction.locationOfficer.deleteMany({
        where: { locationId },
      });

      return transaction.locationOfficer.create({
        data: { officerId, locationId },
        include: {
          location: true,
          officer: {
            select: {
              id: true,
              fullName: true,
              designation: true,
              email: true,
              isActive: true,
            },
          },
        },
      });
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to save assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const gaa = await getCurrentUser("General Administration Officer");
    if (!gaa) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const assignmentId = req.nextUrl.searchParams.get("assignmentId");
    if (!assignmentId) {
      return NextResponse.json(
        { message: "Assignment ID is required." },
        { status: 400 }
      );
    }

    const result = await prisma.locationOfficer.deleteMany({
      where: { assignmentId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Assignment was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
