import { NextRequest, NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createActivityLog, getCurrentUser } from "@/lib/workflow";

type ProfileUpdateBody = {
  fullName?: string;
  designation?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const user = await prisma.systemUser.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      fullName: true,
      email: true,
      designation: true,
      department: true,
      role: {
        select: {
          roleName: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    fullName: user.fullName,
    email: user.email,
    designation: user.designation,
    department: user.department,
    role: user.role.roleName,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = (await req.json()) as ProfileUpdateBody;
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : undefined;
    const designation =
      typeof body.designation === "string"
        ? body.designation.trim()
        : undefined;
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");
    const changingPassword = Boolean(
      currentPassword || newPassword || confirmPassword
    );

    if (fullName !== undefined && (fullName.length < 2 || fullName.length > 100)) {
      return NextResponse.json(
        { message: "Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (
      designation !== undefined &&
      (designation.length < 2 || designation.length > 100)
    ) {
      return NextResponse.json(
        { message: "Position must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (fullName === undefined && designation === undefined && !changingPassword) {
      return NextResponse.json(
        { message: "No profile changes were provided." },
        { status: 400 }
      );
    }

    const user = await prisma.systemUser.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let passwordHash: string | undefined;

    if (changingPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { message: "Current password, new password, and confirmation are required." },
          { status: 400 }
        );
      }

      if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "New password must contain at least 8 characters." },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: "New password and confirmation do not match." },
          { status: 400 }
        );
      }

      if (await verifyPassword(newPassword, user.passwordHash)) {
        return NextResponse.json(
          { message: "New password must be different from the current password." },
          { status: 400 }
        );
      }

      passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.systemUser.update({
      where: {
        id: currentUser.id,
      },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(designation !== undefined ? { designation } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        fullName: true,
        email: true,
        designation: true,
      },
    });

    try {
      await createActivityLog(
        currentUser.id,
        "UPDATE_PROFILE",
        changingPassword
          ? "User updated profile and password"
          : "User updated profile name or position",
        "SYSTEM_USER",
        currentUser.id
      );
    } catch (error) {
      console.error("Profile updated, but activity logging failed", error);
    }

    return NextResponse.json({
      success: true,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      designation: updatedUser.designation,
      message: changingPassword
        ? "Profile and password updated successfully."
        : "Name and position updated successfully.",
    });
  } catch (error) {
    console.error("Failed to update profile", error);

    return NextResponse.json(
      { message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
