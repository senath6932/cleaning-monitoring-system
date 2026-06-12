import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const role = await prisma.userRole.findFirst({
    where: {
      roleName: "Administration Officer",
    },
  });

  if (!role) {
    throw new Error("Administration Officer role not found");
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.systemUser.create({
    data: {
      fullName: "System Administrator",
      email: "admin@wusl.lk",
      passwordHash,
      roleId: role.id,
      id: randomUUID(),
    },
  });

  console.log("✅ Admin user created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
