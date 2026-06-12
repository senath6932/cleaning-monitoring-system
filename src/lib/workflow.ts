import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser(requiredRole?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return null;
  }

  return {
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function notifyRole(
  roleName: string,
  title: string,
  message: string,
  reportId?: string
) {
  const users = await prisma.systemUser.findMany({
    where: {
      isActive: true,
      role: {
        roleName,
      },
    },
    select: {
      id: true,
    },
  });

  if (users.length === 0) return;

  await prisma.nOTIFICATIONS.createMany({
    data: users.map((user) => ({
      notificationId: randomUUID(),
      userId: user.id,
      title,
      message,
      reportId,
    })),
  });
}

export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  reportId?: string
) {
  await prisma.nOTIFICATIONS.create({
    data: {
      notificationId: randomUUID(),
      userId,
      title,
      message,
      reportId,
    },
  });
}

export async function createActivityLog(
  userId: string,
  action: string,
  description: string,
  entityType: string,
  entityId?: string
) {
  await prisma.aCTIVITY_LOGS.create({
    data: {
      logId: randomUUID(),
      userId,
      action,
      description,
      entityType,
      entityId,
    },
  });
}
