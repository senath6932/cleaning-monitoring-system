import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/workflow";

export async function GET() {
  try {
    const officer = await getCurrentUser("Evaluating Officer");

    if (!officer) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const assignments = await prisma.locationOfficer.findMany({
      where: {
        officerId: officer.id,
        location: {
          isActive: true,
        },
      },
      include: {
        location: {
          select: {
            locationId: true,
            code: true,
            locationName: true,
          },
        },
      },
      orderBy: {
        location: {
          locationName: "asc",
        },
      },
    });

    return NextResponse.json(
      assignments.map((assignment) => assignment.location)
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load assigned locations" },
      { status: 500 }
    );
  }
}
