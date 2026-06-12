import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDev = process.env.NODE_ENV !== "production";

const client = new PrismaClient({
  log: isDev ? ["query", "info", "warn", "error"] : ["warn", "error"],
});

// In development, also log query durations to the console for quick diagnostics.
if (isDev) {
  client.$on("query", (e) => {
    // Avoid printing the full query in some sensitive contexts — keep concise.
    // This helps identify slow queries during development.
    // eslint-disable-next-line no-console
    console.log(`[Prisma] ${e.duration}ms — ${e.query.replace(/\s+/g, " ").slice(0, 300)}${
      e.query.length > 300 ? "..." : ""
    }`);
  });
}

export const prisma = globalForPrisma.prisma ?? client;

if (isDev) {
  globalForPrisma.prisma = prisma;
}