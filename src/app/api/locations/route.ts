import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      locationName: "asc",
    },
  });

  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { code, locationName, minWorkers } = body;

    const created = await prisma.location.create({
      data: {
        code,
        locationName,
        minWorkers: Number(minWorkers),
        contractAmount: 0,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create location" },
      { status: 500 }
    );
  }
}
