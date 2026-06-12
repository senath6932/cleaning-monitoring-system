# Cleaning Monitoring System - Code Review Bundle

This file collects the backend and frontend source code for GPT review.

Notes:
- Excluded generated/vendor files: `node_modules/`, `.next/`, `.git/`, `package-lock.json`, `tsconfig.tsbuildinfo`.
- Excluded secrets: `.env`. Do not upload credentials or private keys for review.
- Backend code is mainly under `src/app/api`, `src/lib`, and `prisma`.
- Frontend code is mainly under `src/app`, `src/components`, `src/types`, and `public` assets.

## File Manifest

- `AGENTS.md`
- `CLAUDE.md`
- `PROJECT_CONTEXT.md`
- `README.md`
- `eslint.config.mjs`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `prisma/create-admin.ts`
- `prisma/create-gaa.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/admin-review/[reportId]/route.ts`
- `src/app/api/admin-review/approve/route.ts`
- `src/app/api/admin-review/pending/route.ts`
- `src/app/api/admin-review/reject/route.ts`
- `src/app/api/assignments/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/dashboard/stats/route.ts`
- `src/app/api/evaluations/history/route.ts`
- `src/app/api/evaluations/locations/route.ts`
- `src/app/api/evaluations/route.ts`
- `src/app/api/evaluations/tasks/[locationId]/route.ts`
- `src/app/api/location-tasks/route.ts`
- `src/app/api/locations/[locationId]/route.ts`
- `src/app/api/locations/route.ts`
- `src/app/api/officers/route.ts`
- `src/app/api/payment-recommendation/[reportId]/route.ts`
- `src/app/api/payment-recommendation/create/route.ts`
- `src/app/api/payment-recommendation/pending/route.ts`
- `src/app/api/reports/[reportId]/route.ts`
- `src/app/api/reports/route.ts`
- `src/app/api/roles/route.ts`
- `src/app/api/settings/route.ts`
- `src/app/api/settings/update/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/users/route.ts`
- `src/app/api/vc-approval/[recommendationId]/route.ts`
- `src/app/api/vc-approval/approve/route.ts`
- `src/app/api/vc-approval/pending/route.ts`
- `src/app/api/vc-approval/reject/route.ts`
- `src/app/dashboard/admin-review/[reportId]/page.tsx`
- `src/app/dashboard/admin-review/page.tsx`
- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/assignments/page.tsx`
- `src/app/dashboard/evaluations/history/page.tsx`
- `src/app/dashboard/evaluations/page.tsx`
- `src/app/dashboard/finance/page.tsx`
- `src/app/dashboard/gaa/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/location-tasks/page.tsx`
- `src/app/dashboard/locations/page.tsx`
- `src/app/dashboard/officer/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/payment-recommendation/[reportId]/page.tsx`
- `src/app/dashboard/payment-recommendation/page.tsx`
- `src/app/dashboard/reports/[reportId]/page.tsx`
- `src/app/dashboard/reports/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/users/page.tsx`
- `src/app/dashboard/vc-approval/[recommendationId]/page.tsx`
- `src/app/dashboard/vc-approval/page.tsx`
- `src/app/dashboard/vc/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/layout/dashboard-layout.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/providers/session-provider.tsx`
- `src/lib/auth-config.ts`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`
- `src/types/next-auth-jwt.d.ts`
- `src/types/next-auth.d.ts`
- `tsconfig.json`

## Source Code

### `AGENTS.md`

````md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
````

### `CLAUDE.md`

````md
@AGENTS.md
````

### `PROJECT_CONTEXT.md`

````md
# Project Context

This document captures the current structure and runtime surface of the `cleaning-monitoring-system` project.

## Full Project Directory Structure

```text
cleaning-monitoring-system/
  - .env
  - AGENTS.md
  - CLAUDE.md
  - README.md
  - eslint.config.mjs
  - marcom.md
  - next.config.ts
  - package-lock.json
  - package.json
  - postcss.config.mjs
  - tsconfig.json
  - prisma/
    - create-admin.ts
    - schema.prisma
    - seed.ts
  - public/
    - file.svg
    - globe.svg
    - next.svg
    - vercel.svg
    - window.svg
  - src/
    - app/
      - (auth)/
        - login/
          - page.tsx
      - api/
        - assignments/
          - route.ts
        - auth/
          - [...nextauth]/
            - route.ts
          - login/
            - route.ts
        - evaluations/
          - locations/
            - route.ts
          - tasks/
            - [locationId]/
              - route.ts
        - locations/
          - route.ts
        - officers/
          - route.ts
        - roles/
          - route.ts
        - users/
          - route.ts
      - dashboard/
        - admin/
          - page.tsx
        - assignments/
          - page.tsx
        - finance/
          - page.tsx
        - gaa/
          - page.tsx
        - layout.tsx
        - officer/
          - page.tsx
        - page.tsx
        - users/
          - page.tsx
        - vc/
          - page.tsx
      - favicon.ico
      - globals.css
      - layout.tsx
      - page.tsx
    - components/
      - layout/
        - dashboard-layout.tsx
        - sidebar.tsx
      - providers/
        - session-provider.tsx
    - lib/
      - auth-config.ts
      - auth.ts
      - prisma.ts
```

## All Source Code Files

### Prisma and tooling

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/create-admin.ts`
- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `src/lib/auth-config.ts`

### App Router pages

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/(auth)/login/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/assignments/page.tsx`
- `src/app/dashboard/finance/page.tsx`
- `src/app/dashboard/gaa/page.tsx`
- `src/app/dashboard/officer/page.tsx`
- `src/app/dashboard/users/page.tsx`
- `src/app/dashboard/vc/page.tsx`

### App Router API routes

- `src/app/api/assignments/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/evaluations/locations/route.ts`
- `src/app/api/evaluations/tasks/[locationId]/route.ts`
- `src/app/api/locations/route.ts`
- `src/app/api/officers/route.ts`
- `src/app/api/roles/route.ts`
- `src/app/api/users/route.ts`

### Shared components

- `src/components/providers/session-provider.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/dashboard-layout.tsx`

### Project root files

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `marcom.md`
- `.env`

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- NextAuth.js
- bcryptjs
- jsonwebtoken
- Supabase client library

## Key Entry Points

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/lib/auth-config.ts`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`

## Database Schema Files

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/create-admin.ts`

## API Routes

### Auth

- `GET/POST /api/auth/[...nextauth]`
- `POST /api/auth/login`

### Users and access

- `GET /api/users`
- `GET /api/roles`
- `GET /api/officers`
- `GET /api/locations`
- `POST /api/assignments`

### Evaluations

- `GET /api/evaluations/locations`
- `GET /api/evaluations/tasks/{locationId}`

## Environment Variables Used

The project uses these environment variables. Values are intentionally omitted here.

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `JWT_SECRET`  
  - Used by `src/app/api/auth/login/route.ts`

## Notes

- Generated directories such as `.next/` and `node_modules/` are intentionally excluded from the source inventory.
- The dashboard area currently contains role-specific placeholder pages and a shared dashboard shell component.
- The evaluation APIs are the first phase of the evaluation workflow and are ready to be consumed by the UI.
````

### `README.md`

````md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
````

### `eslint.config.mjs`

````js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
````

### `next-env.d.ts`

````ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
````

### `next.config.ts`

````ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
````

### `package.json`

````json
{
  "name": "cleaning-monitoring-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "@supabase/supabase-js": "^2.106.2",
    "bcryptjs": "^3.0.3",
    "jsonwebtoken": "^9.0.3",
    "next": "16.2.6",
    "next-auth": "^4.24.14",
    "prisma": "^6.19.3",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "tsx": "^4.22.3",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
````

### `postcss.config.mjs`

````js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
````

### `prisma/create-admin.ts`

````ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      roleId: role.roleId,
    },
  });

  console.log("✅ Admin user created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
````

### `prisma/create-gaa.ts`

````ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const role = await prisma.userRole.upsert({
    where: { roleName: "General Administration Officer" },
    update: {},
    create: {
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
      roleId: role.roleId,
      isActive: true,
    },
    create: {
      fullName: "General Administration Officer",
      email: "gaa@wusl.lk",
      passwordHash,
      roleId: role.roleId,
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
````

### `prisma/schema.prisma`

````prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model UserRole {
  id          String       @id
  roleName    String       @unique
  roleCode    String       @unique
  description String?
  users       SystemUser[]

  @@map("USER_ROLE")
}

model SystemUser {
  id                     String                  @id
  fullName               String
  email                  String                  @unique
  passwordHash           String
  isActive               Boolean                 @default(true)
  phoneNumber            String?
  designation            String?
  department             String?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt
  roleId                 String
  ACTIVITY_LOGS          ACTIVITY_LOGS[]
  ADMIN_REVIEW           AdminReview[]
  evaluationReports      EvaluationReport[]      @relation("OfficerReports")
  payments               FinancePayment[]        @relation("FinancePayments")
  assignments            LocationOfficer[]
  NOTIFICATIONS          NOTIFICATIONS[]
  paymentRecommendations PaymentRecommendation[] @relation("PaymentCreators")
  role                   UserRole                @relation(fields: [roleId], references: [id])
  approvals              VCApproval[]            @relation("VCApprovals")

  @@map("SYSTEM_USER")
}

model Location {
  locationId        String             @id @default(uuid())
  code              String             @unique
  locationName      String
  minWorkers        Int
  contractAmount    Decimal            @db.Decimal(12, 2)
  isActive          Boolean            @default(true)
  updatedAt         DateTime           @updatedAt
  evaluationReports EvaluationReport[]
  officers          LocationOfficer[]
  tasks             LocationTask[]

  @@map("LOCATION")
}

model SystemSetting {
  settingId             String   @id @default(uuid())
  monthlyContractAmount Decimal  @db.Decimal(12, 2)
  updatedAt             DateTime @updatedAt

  @@map("SYSTEM_SETTING")
}

model LocationOfficer {
  assignmentId String     @id @default(uuid())
  assignedDate DateTime   @default(now())
  locationId   String
  officerId    String
  location     Location   @relation(fields: [locationId], references: [locationId], onDelete: Cascade)
  officer      SystemUser @relation(fields: [officerId], references: [id])

  @@map("LOCATION_OFFICER")
}

model TaskCategory {
  categoryId   String @id @default(uuid())
  categoryName String @unique
  tasks        Task[]

  @@map("TASK_CATEGORY")
}

model Task {
  taskId      String         @id @default(uuid())
  taskName    String
  description String?
  categoryId  String
  locations   LocationTask[]
  category    TaskCategory   @relation(fields: [categoryId], references: [categoryId])

  @@map("TASK")
}

model LocationTask {
  locationTaskId  String           @id @default(uuid())
  locationId      String
  taskId          String
  location        Location         @relation(fields: [locationId], references: [locationId], onDelete: Cascade)
  task            Task             @relation(fields: [taskId], references: [taskId])
  taskEvaluations TaskEvaluation[]

  @@unique([locationId, taskId])
  @@map("LOCATION_TASK")
}

model EvaluationReport {
  reportId              String                 @id @default(uuid())
  evaluationMonth       Int
  evaluationYear        Int
  overallPercentage     Decimal?               @db.Decimal(5, 2)
  status                ReportStatus           @default(DRAFT)
  submittedAt           DateTime?
  updatedAt             DateTime               @updatedAt
  locationId            String
  officerId             String
  adminReview           AdminReview?
  location              Location               @relation(fields: [locationId], references: [locationId], onDelete: Cascade)
  officer               SystemUser             @relation("OfficerReports", fields: [officerId], references: [id])
  paymentRecommendation PaymentRecommendation?
  taskEvaluations       TaskEvaluation[]

  @@unique([locationId, evaluationMonth, evaluationYear])
  @@map("EVALUATION_REPORT")
}

model TaskEvaluation {
  taskEvaluationId String           @id @default(uuid())
  evaluationDate   DateTime
  result           TaskResult
  percentage       Decimal?         @db.Decimal(5, 2)
  reportId         String
  locationTaskId   String
  locationTask     LocationTask     @relation(fields: [locationTaskId], references: [locationTaskId], onDelete: Cascade)
  report           EvaluationReport @relation(fields: [reportId], references: [reportId], onDelete: Cascade)

  @@map("TASK_EVALUATION")
}

model AdminReview {
  reviewId       String           @id @default(uuid())
  decision       String
  remarks        String?
  reviewedAt     DateTime         @default(now())
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  reportId       String           @unique
  adminOfficerId String
  SYSTEM_USER    SystemUser       @relation(fields: [adminOfficerId], references: [id])
  report         EvaluationReport @relation(fields: [reportId], references: [reportId], onDelete: Cascade)

  @@map("ADMIN_REVIEW")
}

model PaymentRecommendation {
  recommendationId     String           @id @default(uuid())
  completionPercentage Decimal          @db.Decimal(5, 2)
  contractAmount       Decimal          @db.Decimal(12, 2)
  recommendedAmount    Decimal          @db.Decimal(12, 2)
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  reportId             String           @unique
  createdBy            String
  creator              SystemUser       @relation("PaymentCreators", fields: [createdBy], references: [id])
  report               EvaluationReport @relation(fields: [reportId], references: [reportId], onDelete: Cascade)
  vcApproval           VCApproval?

  @@map("PAYMENT_RECOMMENDATION")
}

model VCApproval {
  approvalId       String                @id @default(uuid())
  decision         ApprovalDecision
  remarks          String?
  approvedAt       DateTime              @default(now())
  recommendationId String                @unique
  approvedBy       String
  financePayment   FinancePayment?
  approver         SystemUser            @relation("VCApprovals", fields: [approvedBy], references: [id])
  recommendation   PaymentRecommendation @relation(fields: [recommendationId], references: [recommendationId], onDelete: Cascade)

  @@map("VC_APPROVAL")
}

model FinancePayment {
  paymentId   String     @id @default(uuid())
  voucherNo   String?
  chequeNo    String?
  paidAmount  Decimal    @db.Decimal(12, 2)
  paymentDate DateTime
  approvalId  String     @unique
  processedBy String
  approval    VCApproval @relation(fields: [approvalId], references: [approvalId], onDelete: Cascade)
  processor   SystemUser @relation("FinancePayments", fields: [processedBy], references: [id])

  @@map("FINANCE_PAYMENT")
}

model ACTIVITY_LOGS {
  logId       String     @id
  userId      String
  action      String
  description String
  entityType  String
  entityId    String?
  createdAt   DateTime   @default(now())
  SYSTEM_USER SystemUser @relation(fields: [userId], references: [id])
}

model NOTIFICATIONS {
  notificationId String     @id
  userId         String
  title          String
  message        String
  reportId       String?
  isRead         Boolean    @default(false)
  createdAt      DateTime   @default(now())
  SYSTEM_USER    SystemUser @relation(fields: [userId], references: [id])
}

enum ReportStatus {
  DRAFT
  SUBMITTED
  CORRECTION_REQUESTED
  RESUBMITTED
  VERIFIED
  PAYMENT_RECOMMENDATION_PENDING
  REJECTED
  ADMIN_APPROVED
}

enum TaskResult {
  P
  X
  NA
}

enum ApprovalDecision {
  APPROVED
  REJECTED
  CLARIFICATION_REQUESTED
}
````

### `prisma/seed.ts`

````ts
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
````

### `public/file.svg`

````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

### `public/globe.svg`

````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

### `public/next.svg`

````xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

### `public/vercel.svg`

````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

### `public/window.svg`

````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

### `src/app/(auth)/login/page.tsx`

````tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-96 rounded-lg border p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">
          University Cleaning Monitoring System
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-3 w-full border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded bg-blue-600 p-2 text-white">
          Login
        </button>
      </form>
    </div>
  );
}
````

### `src/app/api/admin-review/[reportId]/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: any
) {
  const { reportId } = await context.params;

  const report =
    await prisma.evaluationReport.findUnique({
      where: {
        reportId,
      },
      include: {
        location: true,
        officer: true,
        taskEvaluations: {
          include: {
            locationTask: {
              include: {
                task: true,
              },
            },
          },
        },
      },
    });

  return NextResponse.json(report);
}
````

### `src/app/api/admin-review/approve/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      reportId,
      remarks,
    } = body;

    // TEMPORARY
    const admin =
      await prisma.systemUser.findFirst();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 400 }
      );
    }

    const review =
      await prisma.adminReview.create({
        data: {
          reportId,
          reviewedBy: admin.userId,
          remarks,
          status: "APPROVED",
        },
      });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "VERIFIED",
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Approval failed",
      },
      {
        status: 500,
      }
    );
  }
}
````

### `src/app/api/admin-review/pending/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.evaluationReport.findMany({
      where: {
        status: "SUBMITTED",
      },
      include: {
        location: true,
        officer: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load reports" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/admin-review/reject/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      reportId,
      remarks,
    } = body;

    const admin =
      await prisma.systemUser.findFirst();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 400 }
      );
    }

    const review =
      await prisma.adminReview.create({
        data: {
          reportId,
          reviewedBy: admin.userId,
          remarks,
          status: "REJECTED",
        },
      });

    await prisma.evaluationReport.update({
      where: {
        reportId,
      },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Reject failed",
      },
      {
        status: 500,
      }
    );
  }
}
````

### `src/app/api/assignments/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const assignment =
    await prisma.locationOfficer.create({
      data: {
        officerId: body.officerId,
        locationId: body.locationId,
      },
    });

  return NextResponse.json(assignment);
}
````

### `src/app/api/auth/[...nextauth]/route.ts`

````ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
````

### `src/app/api/auth/login/route.ts`

````ts
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
      sub: user.userId,
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
      userId: user.userId,
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

````

### `src/app/api/dashboard/stats/route.ts`

````ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalUsers,
    totalLocations,
    totalEvaluations,
    pendingReviews,
    pendingVCApprovals,
    approvedReports,
  ] = await Promise.all([
    prisma.systemUser.count(),
    prisma.location.count(),
    prisma.evaluationReport.count(),
    prisma.evaluationReport.count({
      where: {
        adminReview: null,
      },
    }),
    prisma.paymentRecommendation.count({
      where: {
        vcApproval: null,
      },
    }),
    prisma.vCApproval.count({
      where: {
        decision: "APPROVED",
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalLocations,
    totalEvaluations,
    pendingReviews,
    pendingVCApprovals,
    approvedReports,
  });
}
````

### `src/app/api/evaluations/history/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports =
      await prisma.evaluationReport.findMany({
        include: {
          location: true,
          officer: true,
        },
        orderBy: {
          submittedAt: "desc",
        },
      });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load history" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/evaluations/locations/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
      },
      select: {
        locationId: true,
        locationName: true,
      },
      orderBy: {
        locationName: "asc",
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load locations" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/evaluations/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      locationId,
      month,
      year,
      results,
    } = body;

    // TEMPORARY
    // Later replace with logged-in user id
    const officer = await prisma.systemUser.findFirst();

    if (!officer) {
      return NextResponse.json(
        { message: "Officer not found" },
        { status: 400 }
      );
    }

    const report =
      await prisma.evaluationReport.create({
        data: {
          locationId,
          officerId: officer.userId,
          evaluationMonth: month,
          evaluationYear: year,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

    let completed = 0;
    let total = 0;

    for (const locationTaskId of Object.keys(results)) {
      const result = results[locationTaskId];

      if (result !== "NA") {
        total++;
      }

      if (result === "P") {
        completed++;
      }

      await prisma.taskEvaluation.create({
        data: {
          reportId: report.reportId,
          locationTaskId,
          result,
          evaluationDate: new Date(),
        },
      });
    }

    const percentage =
      total === 0
        ? 0
        : (completed / total) * 100;

    await prisma.evaluationReport.update({
      where: {
        reportId: report.reportId,
      },
      data: {
        overallPercentage: percentage,
      },
    });

    return NextResponse.json({
      success: true,
      percentage,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to save evaluation",
      },
      {
        status: 500,
      }
    );
  }
}
````

### `src/app/api/evaluations/tasks/[locationId]/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { locationId: string } }
) {
  try {
    const tasks = await prisma.locationTask.findMany({
      where: {
        locationId: params.locationId,
      },
      include: {
        task: {
          include: {
            category: true,
          },
        },
      },
    });

    const result = tasks.map((item) => ({
      locationTaskId: item.locationTaskId,
      taskId: item.task.taskId,
      taskName: item.task.taskName,
      categoryName: item.task.category.categoryName,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load tasks" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/location-tasks/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { locationId, taskIds } = body;

    const records = taskIds.map((taskId: string) => ({
      locationId,
      taskId,
    }));

    await prisma.locationTask.createMany({
      data: records,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to save" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/locations/[locationId]/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const body = await req.json();

    const { locationName, minWorkers } = body;

    const updated = await prisma.location.update({
      where: {
        locationId: params.locationId,
      },
      data: {
        locationName,
        minWorkers: Number(minWorkers),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const deleted = await prisma.location.update({
      where: {
        locationId: params.locationId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to remove location.",
      },
      { status: 500 }
    );
  }
}
````

### `src/app/api/locations/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      locationName: "asc",
    },
  });

  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { code, locationName, minWorkers } = body;

    const created = await prisma.location.create({
      data: {
        code,
        locationName,
        minWorkers: Number(minWorkers),
        contractAmount: 0,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create location" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/officers/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const officers = await prisma.systemUser.findMany({
    where: {
      role: {
        roleName: "Evaluating Officer",
      },
    },
    select: {
      userId: true,
      fullName: true,
    },
  });

  return NextResponse.json(officers);
}
````

### `src/app/api/payment-recommendation/[reportId]/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: any
) {
  const { reportId } =
    await context.params;

  const report =
    await prisma.evaluationReport.findUnique({
      where: {
        reportId,
      },
      include: {
        location: true,
      },
    });

  return NextResponse.json(report);
}
````

### `src/app/api/payment-recommendation/create/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      reportId,
      completionPercentage,
      contractAmount,
      recommendedAmount,
    } = body;

    // TEMPORARY
    const user =
      await prisma.systemUser.findFirst();

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    const recommendation =
      await prisma.paymentRecommendation.create({
        data: {
          reportId,
          createdBy: user.userId,

          completionPercentage,

          contractAmount,

          recommendedAmount,
        },
      });

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to create recommendation",
      },
      {
        status: 500,
      }
    );
  }
}
````

### `src/app/api/payment-recommendation/pending/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports =
    await prisma.evaluationReport.findMany({
      where: {
        status: "VERIFIED",
      },
      include: {
        location: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

  return NextResponse.json(reports);
}
````

### `src/app/api/reports/[reportId]/route.ts`

````ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const { reportId } = await context.params;

  const report = await prisma.evaluationReport.findUnique({
    where: {
      reportId,
    },
    include: {
      location: true,
      taskEvaluations: {
        include: {
          locationTask: {
            include: {
              task: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
      adminReview: true,
      paymentRecommendation: {
        include: {
          vcApproval: true,
        },
      },
    },
  });

  return NextResponse.json(report);
}
````

### `src/app/api/reports/route.ts`

````ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const reports = await prisma.paymentRecommendation.findMany({
    where: {
      vcApproval: {
        decision: "APPROVED",
      },
    },
    include: {
      report: {
        include: {
          location: true,
        },
      },
      vcApproval: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(reports);
}
````

### `src/app/api/roles/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const roles = await prisma.userRole.findMany({
    orderBy: {
      roleName: "asc",
    },
  });

  return NextResponse.json(roles);
}
````

### `src/app/api/settings/route.ts`

````ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const setting =
    await prisma.systemSetting.findFirst();

  if (setting) {
    return NextResponse.json(setting);
  }

  const created = await prisma.systemSetting.create({
    data: {
      monthlyContractAmount: 0,
    },
  });

  return NextResponse.json(created);
}
````

### `src/app/api/settings/update/route.ts`

````ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  const setting =
    await prisma.systemSetting.findFirst();

  if (!setting) {
    const created = await prisma.systemSetting.create({
      data: {
        monthlyContractAmount: amount,
      },
    });

    return NextResponse.json(created);
  }

  const updated =
    await prisma.systemSetting.update({
      where: {
        settingId: setting!.settingId,
      },
      data: {
        monthlyContractAmount: amount,
      },
    });

  return NextResponse.json(updated);
}
````

### `src/app/api/tasks/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      category: true,
    },
    orderBy: {
      taskName: "asc",
    },
  });

  return NextResponse.json(tasks);
}
````

### `src/app/api/users/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const existingUser = await prisma.systemUser.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      body.password,
      10
    );

    const user = await prisma.systemUser.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        passwordHash,
        roleId: body.roleId,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
````

### `src/app/api/vc-approval/[recommendationId]/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: any) {
  const { recommendationId } = await context.params;

  const recommendation = await prisma.paymentRecommendation.findUnique({
    where: {
      recommendationId,
    },
    include: {
      report: {
        include: {
          location: true,
        },
      },
    },
  });

  return NextResponse.json(recommendation);
}
````

### `src/app/api/vc-approval/approve/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { recommendationId, remarks } = await req.json();

    const vc = await prisma.systemUser.findFirst();

    if (!vc) {
      return NextResponse.json(
        { message: "VC not found" },
        { status: 400 }
      );
    }

    const approval = await prisma.vCApproval.create({
      data: {
        recommendationId,
        approvedBy: vc.userId,
        decision: "APPROVED",
        remarks,
      },
    });

    return NextResponse.json({
      success: true,
      approval,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Approval failed",
      },
      {
        status: 500,
      }
    );
  }
}
````

### `src/app/api/vc-approval/pending/route.ts`

````ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recommendations =
    await prisma.paymentRecommendation.findMany({
      where: {
        vcApproval: null,
      },
      include: {
        report: {
          include: {
            location: true,
          },
        },
      },
    });

  return NextResponse.json(
    recommendations
  );
}
````

### `src/app/api/vc-approval/reject/route.ts`

````ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { recommendationId, remarks } = await req.json();

    const vc = await prisma.systemUser.findFirst();

    if (!vc) {
      return NextResponse.json(
        { message: "VC not found" },
        { status: 400 }
      );
    }

    const approval = await prisma.vCApproval.create({
      data: {
        recommendationId,
        approvedBy: vc.userId,
        decision: "REJECTED",
        remarks,
      },
    });

    return NextResponse.json({
      success: true,
      approval,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Reject failed",
      },
      {
        status: 500,
      }
    );
  }
}
````

### `src/app/dashboard/admin-review/[reportId]/page.tsx`

````tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!reportId) return;

    fetch(`/api/admin-review/${reportId}`)
      .then((res) => res.json())
      .then(setReport);
  }, [reportId]);

  async function approve() {
    const response = await fetch(
      "/api/admin-review/approve",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          reportId,
          remarks,
        }),
      }
    );

    const data =
      await response.json();

    if (response.ok) {
      alert("Approved");

      window.location.href =
        "/dashboard/admin-review";
    } else {
      alert(data.message);
    }
  }

  async function reject() {
    const response = await fetch(
      "/api/admin-review/reject",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          reportId,
          remarks,
        }),
      }
    );

    const data =
      await response.json();

    if (response.ok) {
      alert("Rejected");

      window.location.href =
        "/dashboard/admin-review";
    } else {
      alert(data.message);
    }
  }

  if (!report) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Review Evaluation
      </h1>

      <div className="mb-6 rounded border p-4">
        <p>
          <strong>Location:</strong>{" "}
          {report.location.locationName}
        </p>

        <p>
          <strong>Month:</strong>{" "}
          {report.evaluationMonth}
        </p>

        <p>
          <strong>Year:</strong>{" "}
          {report.evaluationYear}
        </p>

        <p>
          <strong>Percentage:</strong>{" "}
          {report.overallPercentage}%
        </p>

        <p>
          <strong>Officer:</strong>{" "}
          {report.officer.fullName}
        </p>
      </div>

      <h2 className="mb-4 text-xl font-bold">
        Task Evaluations
      </h2>

      <table className="mb-6 w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Task
            </th>

            <th className="border p-2">
              Result
            </th>
          </tr>
        </thead>

        <tbody>
          {report.taskEvaluations.map(
            (evaluation: any) => (
              <tr
                key={
                  evaluation.taskEvaluationId
                }
              >
                <td className="border p-2">
                  {
                    evaluation.locationTask
                      .task.taskName
                  }
                </td>

                <td className="border p-2">
                  {evaluation.result}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="mb-6">
        <label className="mb-2 block font-semibold">
          Remarks
        </label>

        <textarea
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
          }
          className="w-full rounded border p-3"
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={approve}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Approve
        </button>

        <button
          onClick={reject}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/admin-review/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number;
  status: string;
  location: {
    locationName: string;
  };
  officer: {
    fullName: string;
  };
};

export default function AdminReviewPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/admin-review/pending")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">
        Admin Review
      </h1>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-slate-900">
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Percentage</th>
              <th className="border-b p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.reportId} className="border-b last:border-b-0">
                <td className="p-3">
                  {report.location.locationName}
                </td>
                <td className="p-3">
                  {report.evaluationMonth}/{report.evaluationYear}
                </td>
                <td className="p-3">
                  {report.overallPercentage}%
                </td>
                <td className="p-3">
                  <a
                    href={`/dashboard/admin-review/${report.reportId}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Review
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/admin/page.tsx`

````tsx
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">
            Administration Officer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Validate evaluation reports, review officer submissions, and manage
            the approval workflow before recommendations move forward.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pending Reviews</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Verified Reports</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Rejected Reports</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        </section>

        <Link
          href="/login"
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

````

### `src/app/dashboard/assignments/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Officer = {
  userId: string;
  fullName: string;
};

type Location = {
  locationId: string;
  locationName: string;
};

export default function AssignmentPage() {
  const { data: session, status } = useSession();
  const [officers, setOfficers] = useState<
    Officer[]
  >([]);

  const [locations, setLocations] = useState<
    Location[]
  >([]);

  const [officerId, setOfficerId] =
    useState("");

  const [locationId, setLocationId] =
    useState("");

  useEffect(() => {
    fetch("/api/officers")
      .then((res) => res.json())
      .then(setOfficers);

    fetch("/api/locations")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-8">Access Denied</div>;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response = await fetch(
      "/api/assignments",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          officerId,
          locationId,
        }),
      }
    );

    if (response.ok) {
      alert("Assignment created");
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Location Assignment
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4"
      >
        <select
          className="w-full border p-2"
          value={officerId}
          onChange={(e) =>
            setOfficerId(e.target.value)
          }
        >
          <option value="">
            Select Officer
          </option>

          {officers.map((officer) => (
            <option
              key={officer.userId}
              value={officer.userId}
            >
              {officer.fullName}
            </option>
          ))}
        </select>

        <select
          className="w-full border p-2"
          value={locationId}
          onChange={(e) =>
            setLocationId(e.target.value)
          }
        >
          <option value="">
            Select Location
          </option>

          {locations.map((location) => (
            <option
              key={location.locationId}
              value={location.locationId}
            >
              {location.locationName}
            </option>
          ))}
        </select>

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Assign
        </button>
      </form>
    </div>
  );
}
````

### `src/app/dashboard/evaluations/history/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number;
  status: string;

  location: {
    locationName: string;
  };

  officer: {
    fullName: string;
  };
};

export default function EvaluationHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/evaluations/history")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">
        Evaluation History
      </h1>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-slate-900">
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Year</th>
              <th className="border-b p-3">Percentage</th>
              <th className="border-b p-3">Status</th>
              <th className="border-b p-3">Officer</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr
                key={report.reportId}
                className="border-b last:border-b-0"
              >
                <td className="p-3">
                  {report.location.locationName}
                </td>
                <td className="p-3">
                  {report.evaluationMonth}
                </td>
                <td className="p-3">
                  {report.evaluationYear}
                </td>
                <td className="p-3">
                  {report.overallPercentage}%
                </td>
                <td className="p-3">
                  {report.status}
                </td>
                <td className="p-3">
                  {report.officer.fullName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/evaluations/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  locationName: string;
};

type Task = {
  locationTaskId: string;
  taskName: string;
  categoryName: string;
};

type TaskResult = "P" | "X" | "NA";

export default function EvaluationsPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [locationId, setLocationId] = useState("");
  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );
  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [results, setResults] = useState<
    Record<string, TaskResult>
  >({});

  // Load locations
  useEffect(() => {
    fetch("/api/evaluations/locations")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  // Load tasks when location changes
  useEffect(() => {
    if (!locationId) return;

    fetch(`/api/evaluations/tasks/${locationId}`)
      .then((res) => res.json())
      .then(setTasks);
  }, [locationId]);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Evaluating Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  function updateResult(
    locationTaskId: string,
    result: TaskResult
  ) {
    setResults((prev) => ({
      ...prev,
      [locationTaskId]: result,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response =
      await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          locationId,
          month,
          year,
          results,
        }),
      });

    const data =
      await response.json();

    if (response.ok) {
      alert(
        `Evaluation Saved. Percentage: ${data.percentage.toFixed(
          2
        )}%`
      );
    } else {
      alert(data.message);
    }
  }

  const dailyTasks = tasks.filter(
    (t) => t.categoryName === "Daily"
  );

  const weeklyTasks = tasks.filter(
    (t) => t.categoryName === "Weekly"
  );

  const monthlyTasks = tasks.filter(
    (t) => t.categoryName === "Monthly"
  );

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        Evaluation Form
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Location */}
        <div>
          <label className="mb-2 block font-semibold text-slate-800">
            Location
          </label>

          <select
            value={locationId}
            onChange={(e) =>
              setLocationId(e.target.value)
            }
            className="rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">
              Select Location
            </option>

            {locations.map((location) => (
              <option
                key={location.locationId}
                value={location.locationId}
              >
                {location.locationName}
              </option>
            ))}
          </select>
        </div>

        {/* Month / Year */}
        <div className="flex gap-4">
          <div>
            <label className="mb-2 block font-semibold text-slate-800">
              Month
            </label>

            <select
              value={month}
              onChange={(e) =>
                setMonth(Number(e.target.value))
              }
              className="rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {Array.from(
                { length: 12 },
                (_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                  >
                    {i + 1}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-800">
              Year
            </label>

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              className="rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {[2025, 2026, 2027].map((y) => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Tasks */}
        <TaskSection
          title="Daily Tasks"
          tasks={dailyTasks}
          results={results}
          updateResult={updateResult}
        />

        {/* Weekly Tasks */}
        <TaskSection
          title="Weekly Tasks"
          tasks={weeklyTasks}
          results={results}
          updateResult={updateResult}
        />

        {/* Monthly Tasks */}
        <TaskSection
          title="Monthly Tasks"
          tasks={monthlyTasks}
          results={results}
          updateResult={updateResult}
        />

        <button
          className="rounded bg-blue-600 px-6 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Submit Evaluation
        </button>
      </form>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  results,
  updateResult,
}: any) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <div className="space-y-4">
        {tasks.map((task: any) => (
          <div
            key={task.locationTaskId}
            className="rounded border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 font-medium text-slate-900">
              {task.taskName}
            </div>

            <div className="flex gap-6">
              {["P", "X", "NA"].map((result) => (
                <label
                  key={result}
                  className="flex items-center gap-2 text-slate-800"
                >
                  <input
                    type="radio"
                    name={task.locationTaskId}
                    checked={
                      results[
                        task.locationTaskId
                      ] === result
                    }
                    onChange={() =>
                      updateResult(
                        task.locationTaskId,
                        result as TaskResult
                      )
                    }
                  />
                  {result}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
````

### `src/app/dashboard/finance/page.tsx`

````tsx
import Link from "next/link";

export default function FinanceDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Finance Officer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Finance Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Process approved payments, track vouchers and cheques, and maintain
            the final payment ledger.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Payments Pending</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Processed This Month</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Voucher Queue</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        </section>

        <Link
          href="/login"
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

````

### `src/app/dashboard/gaa/page.tsx`

````tsx
import Link from "next/link";

export default function GaaDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
            General Administration Officer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            GAA Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Coordinate administrative oversight, monitor approval status, and
            keep the monthly payment workflow moving without delays.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Reports to Monitor</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Recommendations</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Awaiting VC Review</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        </section>

        <Link
          href="/login"
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

````

### `src/app/dashboard/layout.tsx`

````tsx
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
````

### `src/app/dashboard/location-tasks/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  locationName: string;
};

type Task = {
  taskId: string;
  taskName: string;
};

export default function LocationTasksPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [locationId, setLocationId] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then(setLocations);

    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  function toggleTask(taskId: string) {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/location-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId,
        taskIds: selectedTasks,
      }),
    });

    if (response.ok) {
      alert("Tasks Assigned");
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Location Task Assignment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select Location</option>

          {locations.map((location) => (
            <option key={location.locationId} value={location.locationId}>
              {location.locationName}
            </option>
          ))}
        </select>

        <div className="grid gap-2">
          {tasks.map((task) => (
            <label key={task.taskId} className="flex gap-2">
              <input
                type="checkbox"
                checked={selectedTasks.includes(task.taskId)}
                onChange={() => toggleTask(task.taskId)}
              />

              {task.taskName}
            </label>
          ))}
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Assign Tasks
        </button>
      </form>
    </div>
  );
}
````

### `src/app/dashboard/locations/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LocationsPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newLocationName, setNewLocationName] =
    useState("");
  const [newMinWorkers, setNewMinWorkers] =
    useState(0);
  const [creating, setCreating] = useState(false);

  async function loadLocations() {
    const res = await fetch("/api/locations");
    const data = await res.json();
    setLocations(data);
  }

  useEffect(() => {
    loadLocations();
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  async function createLocation() {
    if (!newCode.trim() || !newLocationName.trim()) {
      alert("Please enter a code and location name.");
      return;
    }

    setCreating(true);

    const response = await fetch("/api/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: newCode.trim(),
        locationName: newLocationName.trim(),
        minWorkers: newMinWorkers,
      }),
    });

    if (response.ok) {
      alert("Location created");
      setNewCode("");
      setNewLocationName("");
      setNewMinWorkers(0);
      await loadLocations();
    } else {
      const data = await response.json();
      alert(data.message || "Failed to create location");
    }

    setCreating(false);
  }

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">
        Locations
      </h1>

      <div className="mb-8 rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Add New Location
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Code
            </label>

            <input
              type="text"
              value={newCode}
              onChange={(e) =>
                setNewCode(e.target.value)
              }
              className="w-full rounded border border-slate-300 bg-white p-2"
              placeholder="A"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location Name
            </label>

            <input
              type="text"
              value={newLocationName}
              onChange={(e) =>
                setNewLocationName(e.target.value)
              }
              className="w-full rounded border border-slate-300 bg-white p-2"
              placeholder="Faculty of Business Studies & Finance"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Number of Workers
            </label>

            <input
              type="number"
              value={newMinWorkers}
              onChange={(e) =>
                setNewMinWorkers(Number(e.target.value))
              }
              className="w-full rounded border border-slate-300 bg-white p-2"
            />
          </div>
        </div>

        <button
          onClick={createLocation}
          disabled={creating}
          className="mt-4 rounded bg-emerald-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {creating ? "Creating..." : "Create Location"}
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Code</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Workers</th>
          </tr>
        </thead>

        <tbody>
          {locations.map((location) => (
            <tr key={location.locationId}>
              <td className="border p-2">
                {location.code}
              </td>

              <td className="border p-2">
                {location.locationName}
              </td>

              <td className="border p-2">
                {location.minWorkers}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
````

### `src/app/dashboard/officer/page.tsx`

````tsx
import Link from "next/link";

export default function OfficerDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Evaluating Officer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Officer Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Review assigned locations, submit monthly evaluation reports, and
            track task completion across daily, weekly, and monthly categories.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Assigned Locations</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Draft Reports</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Submitted This Month</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        </section>

        <Link
          href="/login"
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

````

### `src/app/dashboard/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Locations</h2>
          <p className="text-3xl font-bold">{stats.totalLocations}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Evaluations</h2>
          <p className="text-3xl font-bold">{stats.totalEvaluations}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Pending Reviews</h2>
          <p className="text-3xl font-bold">{stats.pendingReviews}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Pending VC Approvals</h2>
          <p className="text-3xl font-bold">{stats.pendingVCApprovals}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Approved Reports</h2>
          <p className="text-3xl font-bold">{stats.approvedReports}</p>
        </div>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/payment-recommendation/[reportId]/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const reportId = params.reportId as string;

  const [report, setReport] = useState<any>(null);
  const [setting, setSetting] = useState<any>(null);

  useEffect(() => {
    if (!reportId) return;

    fetch(`/api/payment-recommendation/${reportId}`)
      .then((res) => res.json())
      .then(setReport);

    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSetting);
  }, [reportId]);

  async function createRecommendation() {
    if (!report) return;
    if (!setting) return;

    const completionPercentage =
      Number(report.overallPercentage);

    const contractAmount =
      Number(
        setting.monthlyContractAmount
      );

    const recommendedAmount =
      (contractAmount * completionPercentage) / 100;

    const response = await fetch(
      "/api/payment-recommendation/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          completionPercentage,
          contractAmount,
          recommendedAmount,
        }),
      }
    );

    const data =
      await response.json();

    if (response.ok) {
      alert(
        "Recommendation Created"
      );

      router.push(
        "/dashboard/payment-recommendation"
      );
    } else {
      alert(data.message);
    }
  }

  if (!report) {
    return <div className="p-6">Loading...</div>;
  }

  const completionPercentage =
    Number(report.overallPercentage);

  const contractAmount =
    Number(
      setting?.monthlyContractAmount ?? 0
    );

  const recommendedAmount =
    (contractAmount * completionPercentage) / 100;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Payment Recommendation
      </h1>

      <div className="space-y-4 rounded border p-6">
        <p>
          <strong>Location:</strong>{" "}
          {report.location.locationName}
        </p>

        <p>
          <strong>Month:</strong>{" "}
          {report.evaluationMonth}
        </p>

        <p>
          <strong>Year:</strong>{" "}
          {report.evaluationYear}
        </p>

        <p>
          <strong>Completion Percentage:</strong>{" "}
          {completionPercentage.toFixed(2)}%
        </p>

        <p>
          <strong>Contract Amount:</strong>{" "}
          Rs. {contractAmount.toFixed(2)}
        </p>

        <p className="text-xl font-bold text-green-700">
          Recommended Amount: Rs.{" "}
          {recommendedAmount.toFixed(2)}
        </p>

        <button
          onClick={createRecommendation}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create Recommendation
        </button>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/payment-recommendation/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PaymentRecommendationPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch(
      "/api/payment-recommendation/pending"
    )
      .then((res) => res.json())
      .then(setReports);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Payment Recommendation
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Location
            </th>

            <th className="border p-2">
              Percentage
            </th>

            <th className="border p-2">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report: any) => (
            <tr key={report.reportId}>
              <td className="border p-2">
                {report.location.locationName}
              </td>

              <td className="border p-2">
                {report.overallPercentage}%
              </td>

              <td className="border p-2">
                <a
                  href={`/dashboard/payment-recommendation/${report.reportId}`}
                  className="text-blue-600"
                >
                  Recommend
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
````

### `src/app/dashboard/reports/[reportId]/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!params.reportId) return;

    fetch(`/api/reports/${params.reportId}`)
      .then((res) => res.json())
      .then(setReport);
  }, [params.reportId]);

  if (!report) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="bg-white p-8 text-slate-900">
      <button
        onClick={() => window.print()}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Print Report
      </button>

      <h1 className="text-center text-3xl font-bold">
        Evaluation Report
      </h1>

      <h2 className="mt-4">
        Location: {report.location.locationName}
      </h2>

      <h2>
        Month: {report.evaluationMonth}/{report.evaluationYear}
      </h2>

      <h2 className="mt-8 mb-4 text-xl font-bold">
        Evaluation Results
      </h2>

      <table className="w-full border border-black">
        <thead>
          <tr>
            <th className="border p-2">Task</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Result</th>
          </tr>
        </thead>

        <tbody>
          {report.taskEvaluations.map((evaluation: any) => (
            <tr key={evaluation.taskEvaluationId}>
              <td className="border p-2">
                {evaluation.locationTask.task.taskName}
              </td>

              <td className="border p-2">
                {evaluation.locationTask.task.category.categoryName}
              </td>

              <td className="border p-2 text-center">
                {evaluation.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 border p-4">
        <h2 className="text-xl font-bold">
          Recommendation For Payment
        </h2>

        <p className="mt-2">
          Completion Percentage:{" "}
          {report.paymentRecommendation?.completionPercentage}%
        </p>

        <p>
          Contract Amount: Rs.{report.paymentRecommendation?.contractAmount}
        </p>

        <p>
          Recommended Amount: Rs.
          {report.paymentRecommendation?.recommendedAmount}
        </p>
      </div>

      <div className="mt-8 border p-4">
        <h2 className="text-xl font-bold">
          Administration Review
        </h2>

        <p>
          Status: {report.adminReview?.status}
        </p>

        <p>
          Remarks: {report.adminReview?.remarks}
        </p>
      </div>

      <div className="mt-8 border p-4">
        <h2 className="text-xl font-bold">
          Vice Chancellor Approval
        </h2>

        <p>
          Decision: {report.paymentRecommendation?.vcApproval?.decision}
        </p>

        <p>
          Remarks: {report.paymentRecommendation?.vcApproval?.remarks}
        </p>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/reports/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">Approved Reports</h1>

      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2">Location</th>
            <th className="border p-2">Month</th>
            <th className="border p-2">Percentage</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.recommendationId}>
              <td className="border p-2">
                {report.report.location.locationName}
              </td>
              <td className="border p-2">
                {report.report.evaluationMonth}/{report.report.evaluationYear}
              </td>
              <td className="border p-2">{report.completionPercentage}%</td>
              <td className="border p-2">Rs. {report.recommendedAmount}</td>
              <td className="border p-2">
                <a
                  href={`/dashboard/reports/${report.reportId}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
````

### `src/app/dashboard/settings/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) =>
        setAmount(Number(data?.monthlyContractAmount ?? 0))
      );
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  async function save() {
    await fetch("/api/settings/update", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        amount,
      }),
    });

    alert("Contract Amount Updated");
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        System Settings
      </h1>

      <label>
        Monthly Contract Amount
      </label>

      <input
        type="number"
        value={amount}
        onChange={(e) =>
          setAmount(Number(e.target.value))
        }
        className="mt-2 block border p-2"
      />

      <button
        onClick={save}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Save
      </button>
    </div>
  );
}
````

### `src/app/dashboard/users/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Role = {
  roleId: string;
  roleName: string;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data));
  }, []);

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-8">Access Denied</div>;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response = await fetch(
      "/api/users",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          roleId,
        }),
      }
    );

    if (response.ok) {
      alert("User created");

      setFullName("");
      setEmail("");
      setPassword("");
      setRoleId("");
    } else {
      alert("Error creating user");
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        User Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4"
      >
        <input
          className="w-full border p-2"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
        />

        <input
          className="w-full border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <select
          className="w-full border p-2"
          value={roleId}
          onChange={(e) =>
            setRoleId(e.target.value)
          }
        >
          <option value="">
            Select Role
          </option>

          {roles.map((role) => (
            <option
              key={role.roleId}
              value={role.roleId}
            >
              {role.roleName}
            </option>
          ))}
        </select>

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
````

### `src/app/dashboard/vc-approval/[recommendationId]/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VCReviewPage() {
  const params = useParams();
  const recommendationId = params.recommendationId as string;

  const [recommendation, setRecommendation] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!recommendationId) return;

    fetch(`/api/vc-approval/${recommendationId}`)
      .then((res) => res.json())
      .then(setRecommendation);
  }, [recommendationId]);

  async function approve() {
    const response = await fetch("/api/vc-approval/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendationId,
        remarks,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Approved");

      window.location.href = "/dashboard/vc-approval";
    } else {
      alert(data.message);
    }
  }

  async function reject() {
    const response = await fetch("/api/vc-approval/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendationId,
        remarks,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Rejected");

      window.location.href = "/dashboard/vc-approval";
    } else {
      alert(data.message);
    }
  }

  if (!recommendation) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">VC Approval Review</h1>

      <div className="space-y-3 rounded border p-6">
        <p>
          <strong>Location:</strong>{" "}
          {recommendation.report.location.locationName}
        </p>

        <p>
          <strong>Completion Percentage:</strong>{" "}
          {Number(recommendation.completionPercentage).toFixed(2)}%
        </p>

        <p>
          <strong>Contract Amount:</strong>{" "}
          Rs. {Number(recommendation.contractAmount).toFixed(2)}
        </p>

        <p className="text-lg font-bold text-green-700">
          Recommended Amount: Rs.{" "}
          {Number(recommendation.recommendedAmount).toFixed(2)}
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-semibold">VC Remarks</label>

        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          className="w-full rounded border p-3"
        />
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={approve}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Approve
        </button>

        <button
          onClick={reject}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/vc-approval/page.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function VCApprovalPage() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] =
    useState<any[]>([]);

  useEffect(() => {
    fetch("/api/vc-approval/pending")
      .then((res) => res.json())
      .then(setRecommendations);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Vice Chancellor") {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        VC Approval
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">
                Location
              </th>

              <th className="border p-2">
                Percentage
              </th>

              <th className="border p-2">
                Contract Amount
              </th>

              <th className="border p-2">
                Recommended Amount
              </th>

              <th className="border p-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {recommendations.map(
              (recommendation) => (
                <tr
                  key={
                    recommendation.recommendationId
                  }
                >
                  <td className="border p-2">
                    {
                      recommendation.report
                        .location
                        .locationName
                    }
                  </td>

                  <td className="border p-2">
                    {Number(
                      recommendation.completionPercentage
                    ).toFixed(2)}
                    %
                  </td>

                  <td className="border p-2">
                    Rs.
                    {Number(
                      recommendation.contractAmount
                    ).toFixed(2)}
                  </td>

                  <td className="border p-2">
                    Rs.
                    {Number(
                      recommendation.recommendedAmount
                    ).toFixed(2)}
                  </td>

                  <td className="border p-2">
                    <a
                      href={`/dashboard/vc-approval/${recommendation.recommendationId}`}
                      className="text-blue-600"
                    >
                      Review
                    </a>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
````

### `src/app/dashboard/vc/page.tsx`

````tsx
import Link from "next/link";

export default function VcDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
            Vice Chancellor
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            VC Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Approve or reject payment recommendations after administrative
            review and keep the university payment approvals moving.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Awaiting Approval</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Approved</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Clarifications</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        </section>

        <Link
          href="/login"
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

````

### `src/app/globals.css`

````css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

@media print {
  nav,
  aside,
  button {
    display: none !important;
  }

  body {
    background: white;
  }
}
````

### `src/app/layout.tsx`

````tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
````

### `src/app/page.tsx`

````tsx
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
````

### `src/components/layout/dashboard-layout.tsx`

````tsx
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-100 p-6 text-slate-900">
        {children}
      </main>
    </div>
  );
}
````

### `src/components/layout/sidebar.tsx`

````tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Users",
      href: "/dashboard/users",
      roles: ["General Administration Officer"],
    },
    {
      name: "Locations",
      href: "/dashboard/locations",
      roles: ["General Administration Officer"],
    },
    {
      name: "Location Tasks",
      href: "/dashboard/location-tasks",
      roles: ["General Administration Officer"],
    },
    {
      name: "Assignments",
      href: "/dashboard/assignments",
      roles: ["General Administration Officer"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      roles: ["General Administration Officer"],
    },
    {
      name: "Evaluations",
      href: "/dashboard/evaluations",
      roles: ["Evaluating Officer"],
    },
    {
      name: "Evaluation History",
      href: "/dashboard/evaluations/history",
      roles: ["Evaluating Officer"],
    },
    {
      name: "Admin Review",
      href: "/dashboard/admin-review",
      roles: ["Administration Officer"],
    },
    {
      name: "Payment Recommendation",
      href: "/dashboard/payment-recommendation",
      roles: ["Administration Officer"],
    },
    {
      name: "VC Approval",
      href: "/dashboard/vc-approval",
      roles: ["Vice Chancellor"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      roles: [
        "General Administration Officer",
        "Administration Officer",
        "Vice Chancellor",
        "Finance Officer",
      ],
    },
  ].filter((item) => !item.roles || item.roles.includes(role ?? ""));

  return (
    <div className="w-64 min-h-screen bg-slate-800 text-white">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">
          Cleaning System
        </h1>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded p-2 ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
````

### `src/components/providers/session-provider.tsx`

````tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
````

### `src/lib/auth-config.ts`

````ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "./auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(
          credentials.email
        );

        if (!user) {
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
          id: user.userId,
          name: user.fullName,
          email: user.email,
          role: user.role.roleName,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? (user as any).roleName;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }

      return session;
    },
  },
};
````

### `src/lib/auth.ts`

````ts
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
````

### `src/lib/prisma.ts`

````ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
````

### `src/types/next-auth-jwt.d.ts`

````ts
import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
````

### `src/types/next-auth.d.ts`

````ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: string;
    };
  }
}

````

### `tsconfig.json`

````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
````
