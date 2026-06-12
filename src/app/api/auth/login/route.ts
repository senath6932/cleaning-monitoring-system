import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  getRoleRedirectPath,
  verifyPassword,
} from "@/lib/auth";

const COOKIE_NAME = "auth_token";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json(
      { error: "JWT_SECRET is not configured." },
      { status: 500 }
    );
  }

  let body: LoginBody | null = null;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(email);

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role.roleName,
    },
    jwtSecret,
    {
      expiresIn: SESSION_DURATION_SECONDS,
    }
  );

  const response = NextResponse.json({
    success: true,
    user: {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.roleName,
    },
    redirectTo: getRoleRedirectPath(user.role.roleName),
  });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}

export function GET() {
  return NextResponse.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
