import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const role = await prisma.userRole.upsert({
    where: { roleName: "General Administration Officer" },
    update: {},
    create: {
      id: randomUUID(),
      roleName: "General Administration Officer",
      roleCode: "GENERAL_ADMIN",
      description: "Main system administrator",
    },
  });

  const passwordHash = await bcrypt.hash("gaa123", 10);

  await prisma.systemUser.upsert({
    where: { email: "gaa@wusl.lk" },
    update: {
      fullName: "General Administration Officer",
      passwordHash,
      roleId: role.id,
      isActive: true,
    },
    create: {
      id: randomUUID(),
      fullName: "General Administration Officer",
      email: "gaa@wusl.lk",
      passwordHash,
      roleId: role.id,
      isActive: true,
    },
  });

  console.log("GAA account created/updated");
  console.log("Email: gaa@wusl.lk");
  console.log("Password: gaa123");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
