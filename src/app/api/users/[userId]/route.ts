import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type UserUpdateBody = {
  fullName?: string;
  email?: string;
  roleId?: string;
  phoneNumber?: string;
  department?: string;
  designation?: string;
  isActive?: boolean;
  newPassword?: string;
};

type UserWithRole = Prisma.SystemUserGetPayload<{
  include: {
    role: {
      select: {
        id: true;
        roleName: true;
        roleCode: true;
      };
    };
  };
}>;

function serializeUser(user: UserWithRole) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roleId: user.roleId,
    role: user.role,
    phoneNumber: user.phoneNumber,
    department: user.department,
    designation: user.designation,
    isActive: user.isActive,
  };
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = (await req.json()) as UserUpdateBody;
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const roleId = String(body.roleId || "");
    const designation = body.designation
      ? String(body.designation).trim()
      : null;
    const phoneNumber = body.phoneNumber
      ? String(body.phoneNumber).trim()
      : null;
    const department = body.department
      ? String(body.department).trim()
      : null;

    if (!fullName || !email || !roleId) {
      return NextResponse.json(
        { message: "Full name, email, and role are required" },
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

    const existingEmailUser = await prisma.systemUser.findUnique({
      where: {
        email,
      },
    });

    if (existingEmailUser && existingEmailUser.id !== userId) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const passwordUpdate =
      body.newPassword && body.newPassword.trim()
        ? {
            passwordHash: await bcrypt.hash(body.newPassword, 10),
          }
        : {};

    const user = await prisma.systemUser.update({
      where: {
        id: userId,
      },
      data: {
        fullName,
        email,
        roleId,
        phoneNumber,
        department,
        designation,
        isActive:
          typeof body.isActive === "boolean" ? body.isActive : true,
        ...passwordUpdate,
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

    return NextResponse.json(serializeUser(user));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    await prisma.systemUser.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
