import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // ROLES
  // =========================
  const evaluatingRole = await prisma.userRole.upsert({
    where: { roleName: "Evaluating Officer" },
    update: {},
    create: {
      id: randomUUID(),
      roleName: "Evaluating Officer",
      roleCode: "EVALUATING_OFFICER",
    },
  });

  const adminRole = await prisma.userRole.upsert({
    where: { roleName: "Administration Officer" },
    update: {},
    create: {
      id: randomUUID(),
      roleName: "Administration Officer",
      roleCode: "ADMINISTRATION_OFFICER",
    },
  });

  const gaaRole = await prisma.userRole.upsert({
    where: { roleName: "General Administration Officer" },
    update: {},
    create: {
      id: randomUUID(),
      roleName: "General Administration Officer",
      roleCode: "GENERAL_ADMINISTRATION_OFFICER",
    },
  });

  const vcRole = await prisma.userRole.upsert({
    where: { roleName: "Vice Chancellor" },
    update: {},
    create: {
      id: randomUUID(),
      roleName: "Vice Chancellor",
      roleCode: "VICE_CHANCELLOR",
    },
  });

  await prisma.userRole.upsert({
    where: { roleName: "Finance Officer" },
    update: {},
    create: {
      id: randomUUID(),
      roleName: "Finance Officer",
      roleCode: "FINANCE_OFFICER",
    },
  });

  await prisma.systemUser.upsert({
    where: { email: "gaa@wusl.lk" },
    update: {
      passwordHash: await bcrypt.hash("gaa123", 10),
      roleId: gaaRole.id,
    },
    create: {
      id: randomUUID(),
      fullName: "General Administration Officer",
      email: "gaa@wusl.lk",
      passwordHash: await bcrypt.hash("gaa123", 10),
      roleId: gaaRole.id,
    },
  });

  await prisma.systemUser.upsert({
    where: { email: "admin@wusl.lk" },
    update: {
      passwordHash: await bcrypt.hash("admin123", 10),
      roleId: adminRole.id,
    },
    create: {
      id: randomUUID(),
      fullName: "Administration Officer",
      email: "admin@wusl.lk",
      passwordHash: await bcrypt.hash("admin123", 10),
      roleId: adminRole.id,
    },
  });

  await prisma.systemUser.upsert({
    where: { email: "officer@wusl.lk" },
    update: {
      passwordHash: await bcrypt.hash("officer123", 10),
      roleId: evaluatingRole.id,
    },
    create: {
      id: randomUUID(),
      fullName: "Evaluating Officer",
      email: "officer@wusl.lk",
      passwordHash: await bcrypt.hash("officer123", 10),
      roleId: evaluatingRole.id,
    },
  });

  await prisma.systemUser.upsert({
    where: { email: "vc@wusl.lk" },
    update: {
      passwordHash: await bcrypt.hash("vc123", 10),
      roleId: vcRole.id,
    },
    create: {
      id: randomUUID(),
      fullName: "Vice Chancellor",
      email: "vc@wusl.lk",
      passwordHash: await bcrypt.hash("vc123", 10),
      roleId: vcRole.id,
    },
  });

  // =========================
  // TASK CATEGORIES
  // =========================
  const dailyCategory = await prisma.taskCategory.upsert({
    where: { categoryName: "Daily" },
    update: {},
    create: { categoryName: "Daily" },
  });

  const weeklyCategory = await prisma.taskCategory.upsert({
    where: { categoryName: "Weekly" },
    update: {},
    create: { categoryName: "Weekly" },
  });

  const monthlyCategory = await prisma.taskCategory.upsert({
    where: { categoryName: "Monthly" },
    update: {},
    create: { categoryName: "Monthly" },
  });

  // =========================
  // TASKS
  // =========================
  await prisma.task.createMany({
    data: [
      // Daily
      {
        taskName: "Dust Mopping",
        categoryId: dailyCategory.categoryId,
      },
      {
        taskName: "Sweeping",
        categoryId: dailyCategory.categoryId,
      },
      {
        taskName: "Toilet Cleaning",
        categoryId: dailyCategory.categoryId,
      },
      {
        taskName: "Garbage Collection",
        categoryId: dailyCategory.categoryId,
      },
      {
        taskName: "Furniture Cleaning",
        categoryId: dailyCategory.categoryId,
      },

      // Weekly
      {
        taskName: "Deep Cleaning",
        categoryId: weeklyCategory.categoryId,
      },
      {
        taskName: "Damp Mopping",
        categoryId: weeklyCategory.categoryId,
      },
      {
        taskName: "Toilet Disinfection",
        categoryId: weeklyCategory.categoryId,
      },

      // Monthly
      {
        taskName: "Roof and Gutter Cleaning",
        categoryId: monthlyCategory.categoryId,
      },
      {
        taskName: "Machine Polishing",
        categoryId: monthlyCategory.categoryId,
      },
    ],
    skipDuplicates: true,
  });

  // =========================
  // LOCATIONS
  // =========================
  await prisma.location.createMany({
    data: [
      {
        code: "A",
        locationName: "Faculty of Business Studies & Finance",
        minWorkers: 10,
        contractAmount: 0,
      },
      {
        code: "B",
        locationName: "Faculty of Applied Sciences",
        minWorkers: 10,
        contractAmount: 0,
      },
      {
        code: "C",
        locationName: "Faculty of Technology",
        minWorkers: 10,
        contractAmount: 0,
      },
      {
        code: "D",
        locationName: "Main Administration Building",
        minWorkers: 5,
        contractAmount: 0,
      },
      {
        code: "E",
        locationName: "Auditorium Building",
        minWorkers: 1,
        contractAmount: 0,
      },
      {
        code: "F",
        locationName: "Gymnasium, Pavilion & Playground Toilet Complex",
        minWorkers: 2,
        contractAmount: 0,
      },
      {
        code: "G",
        locationName: "Swarnapali Hall I & II",
        minWorkers: 3,
        contractAmount: 0,
      },
      {
        code: "H",
        locationName: "Pandukabhaya Hall I & II",
        minWorkers: 3,
        contractAmount: 0,
      },
      {
        code: "I",
        locationName: "Paduwasdewa Hall I & II",
        minWorkers: 3,
        contractAmount: 0,
      },
      {
        code: "J",
        locationName: "Chithradevi Hall",
        minWorkers: 4,
        contractAmount: 0,
      },
      {
        code: "K",
        locationName: "Anuladevi Hall",
        minWorkers: 4,
        contractAmount: 0,
      },
      {
        code: "L",
        locationName: "Vijitha Kuruwita Hall",
        minWorkers: 4,
        contractAmount: 0,
      },
      {
        code: "M",
        locationName: "Vishaka Devi Hall",
        minWorkers: 2,
        contractAmount: 0,
      },
      {
        code: "N",
        locationName: "Seetha Devi Hall",
        minWorkers: 4,
        contractAmount: 0,
      },
      {
        code: "O",
        locationName: "Staff Quarters & Guest House",
        minWorkers: 1,
        contractAmount: 0,
      },
      {
        code: "P",
        locationName: "Library",
        minWorkers: 3,
        contractAmount: 0,
      },
      {
        code: "Q",
        locationName: "Department of English Language Teaching",
        minWorkers: 1,
        contractAmount: 0,
      },
      {
        code: "R",
        locationName: "Land, Roads & Landscape",
        minWorkers: 5,
        contractAmount: 0,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
