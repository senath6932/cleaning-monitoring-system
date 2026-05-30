import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
      },
      select: {
        locationId: true,
        locationName: true,
      },
      orderBy: {
        locationName: "asc",
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load locations" },
      { status: 500 }
    );
  }
}
