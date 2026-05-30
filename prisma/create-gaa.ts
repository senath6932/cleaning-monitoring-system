import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const role = await prisma.userRole.findFirst({
    where: {
      roleName: "General Administration Officer",
    },
  });

  if (!role) {
    throw new Error(
      "General Administration Officer role not found"
    );
  }

  const email = "gaa@wusl.lk";
  const passwordHash = await bcrypt.hash("gaa123", 10);

  const existingUser = await prisma.systemUser.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("GAA user already exists");
    return;
  }

  await prisma.systemUser.create({
    data: {
      fullName: "General Administration Officer",
      email,
      passwordHash,
      roleId: role.roleId,
    },
  });

  console.log("GAA user created");
  console.log("Email: gaa@wusl.lk");
  console.log("Password: gaa123");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
