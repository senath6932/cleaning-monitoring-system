import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
    },
    include: {
      officers: {
        include: {
          officer: {
            select: {
              fullName: true,
              designation: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      locationName: "asc",
    },
  });

  return NextResponse.json(
    locations.map((location) => {
      const assignedOfficers = location.officers.map(
        ({ officer }) => ({
          name: officer.fullName,
          position: officer.designation || "Evaluating Officer",
          email: officer.email,
        })
      );

      return {
        locationId: location.locationId,
        code: location.code,
        locationName: location.locationName,
        minWorkers: location.minWorkers,
        contractAmount: Number(location.contractAmount),
        assignedOfficerName:
          assignedOfficers.length > 0
            ? assignedOfficers
                .map((officer) => officer.name)
                .join(", ")
            : "Not Assigned",
        assignedOfficerPosition:
          assignedOfficers.length > 0
            ? assignedOfficers
                .map((officer) => officer.position)
                .join(", ")
            : "Not Assigned",
        assignedOfficerDisplay:
          assignedOfficers.length > 0
            ? assignedOfficers
                .map((officer) =>
                  `${officer.position} - ${officer.name}`
                )
                .join(", ")
            : "Not Assigned",
      };
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const code = String(body.code || "").trim();
    const locationName = String(body.locationName || "").trim();
    const minWorkers = Number(body.minWorkers);
    const officerId = body.officerId
      ? String(body.officerId).trim()
      : "";

    if (!code || !locationName || !Number.isInteger(minWorkers) || minWorkers < 0) {
      return NextResponse.json(
        { message: "Code, location name, and a valid minimum worker count are required." },
        { status: 400 }
      );
    }

    if (officerId) {
      const officer = await prisma.systemUser.findFirst({
        where: {
          id: officerId,
          isActive: true,
          role: {
            roleName: "Evaluating Officer",
          },
        },
        select: {
          id: true,
        },
      });

      if (!officer) {
        return NextResponse.json(
          { message: "Selected evaluating officer is invalid or inactive." },
          { status: 400 }
        );
      }
    }

    const created = await prisma.$transaction(async (transaction) => {
      const location = await transaction.location.create({
        data: {
          code,
          locationName,
          minWorkers,
          contractAmount: 0,
        },
      });

      if (officerId) {
        await transaction.locationOfficer.create({
          data: {
            officerId,
            locationId: location.locationId,
          },
        });
      }

      return location;
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
