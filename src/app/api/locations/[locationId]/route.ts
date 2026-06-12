import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await context.params;
    const body = await req.json();

    const { code, locationName, minWorkers, contractAmount } = body;

    const updated = await prisma.location.update({
      where: {
        locationId,
      },
      data: {
        code,
        locationName,
        minWorkers: Number(minWorkers),
        contractAmount:
          contractAmount === undefined || contractAmount === ""
            ? undefined
            : Number(contractAmount),
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
  _req: Request,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await context.params;

    await prisma.location.update({
      where: {
        locationId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete location",
      },
      {
        status: 500,
      }
    );
  }
}
