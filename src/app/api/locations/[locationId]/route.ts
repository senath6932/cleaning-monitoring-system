import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const body = await req.json();

    const { locationName, minWorkers } = body;

    const updated = await prisma.location.update({
      where: {
        locationId: params.locationId,
      },
      data: {
        locationName,
        minWorkers: Number(minWorkers),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const deleted = await prisma.location.update({
      where: {
        locationId: params.locationId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to remove location.",
      },
      { status: 500 }
    );
  }
}
