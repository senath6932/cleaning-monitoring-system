import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "./auth";
import { prisma } from "./prisma";

type AuthenticatedUser = {
  id: string;
  role?: string;
  designation?: string | null;
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email);

        if (!user || !user.isActive) {
          return null;
        }

        const validPassword = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role.roleName,
          designation: user.designation,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const authenticatedUser = user as AuthenticatedUser;
        token.id = authenticatedUser.id;
        token.role = authenticatedUser.role;
        token.designation = authenticatedUser.designation;
      }

      if (trigger === "update" && token.id) {
        const refreshedUser = await prisma.systemUser.findUnique({
          where: {
            id: String(token.id),
          },
          include: {
            role: true,
          },
        });

        if (refreshedUser) {
          token.name = refreshedUser.fullName;
          token.email = refreshedUser.email;
          token.role = refreshedUser.role.roleName;
          token.designation = refreshedUser.designation;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.designation = token.designation as
          | string
          | null
          | undefined;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
