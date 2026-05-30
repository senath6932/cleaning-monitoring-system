import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const assignment =
    await prisma.locationOfficer.create({
      data: {
        officerId: body.officerId,
        locationId: body.locationId,
      },
    });

  return NextResponse.json(assignment);
}