import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export type LoginCredentials = {
  email: string;
  password: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getRoleRedirectPath(roleName?: string | null) {
  switch (roleName) {
    case "Evaluating Officer":
      return "/officer";
    case "Administration Officer":
      return "/admin";
    case "General Administration Officer":
      return "/gaa";
    case "Vice Chancellor":
      return "/vc";
    case "Finance Officer":
      return "/finance";
    default:
      return "/login";
  }
}

export async function findUserByEmail(email: string) {
  return prisma.systemUser.findUnique({
    where: {
      email: normalizeEmail(email),
    },
    include: {
      role: true,
    },
  });
}

// NEW FUNCTIONS

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
) {
  return bcrypt.compare(password, hash);
}