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
