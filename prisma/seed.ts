import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // ROLES
  // =========================
  await prisma.userRole.upsert({
    where: { roleName: "Evaluating Officer" },
    update: {},
    create: { roleName: "Evaluating Officer" },
  });

  await prisma.userRole.upsert({
    where: { roleName: "Administration Officer" },
    update: {},
    create: { roleName: "Administration Officer" },
  });

  await prisma.userRole.upsert({
    where: { roleName: "General Administration Officer" },
    update: {},
    create: { roleName: "General Administration Officer" },
  });

  await prisma.userRole.upsert({
    where: { roleName: "Vice Chancellor" },
    update: {},
    create: { roleName: "Vice Chancellor" },
  });

  await prisma.userRole.upsert({
    where: { roleName: "Finance Officer" },
    update: {},
    create: { roleName: "Finance Officer" },
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
