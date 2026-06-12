import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.systemUser.findMany({
    include: {
      role: {
        select: {
          id: true,
          roleName: true,
          roleCode: true,
        },
      },
      assignments: {
        include: {
          location: {
            select: {
              code: true,
              locationName: true,
            },
          },
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
      phoneNumber: user.phoneNumber,
      department: user.department,
      designation: user.designation,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      assignedLocations: user.assignments.map(({ location }) => ({
        code: location.code,
        locationName: location.locationName,
      })),
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.fullName || "").trim();
    const password = String(body.password || "");
    const roleId = String(body.roleId || "");
    const phoneNumber = body.phoneNumber
      ? String(body.phoneNumber).trim()
      : null;
    const department = body.department
      ? String(body.department).trim()
      : null;
    const designation = body.designation
      ? String(body.designation).trim()
      : null;
    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : true;

    if (!fullName || !email || !password || !roleId) {
      return NextResponse.json(
        { message: "Full name, email, password, and role are required" },
        { status: 400 }
      );
    }

    const role = await prisma.userRole.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Selected role does not exist" },
        { status: 400 }
      );
    }

    if (role.roleName === "Evaluating Officer" && !designation) {
      return NextResponse.json(
        { message: "Evaluating Officer Position is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.systemUser.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const user = await prisma.systemUser.create({
      data: {
        id: randomUUID(),
        fullName,
        email,
        passwordHash,
        roleId,
        phoneNumber,
        department,
        designation,
        isActive,
      },
      include: {
        role: {
          select: {
            id: true,
            roleName: true,
            roleCode: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
      phoneNumber: user.phoneNumber,
      department: user.department,
      designation: user.designation,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
