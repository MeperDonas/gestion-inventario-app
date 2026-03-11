# Deployment Preparation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepare the codebase for production deployment on Vercel + Railway + Supabase by applying all required code changes from the deployment design (2026-03-05-deployment-design.md).

**Architecture:** 10 targeted changes to the existing codebase: Prisma schema update for Supabase pooler, NestJS server binding fix for Railway, health check endpoint, global rate limiting guard, build script automation, security hardening, git cleanup, and environment documentation.

**Tech Stack:** NestJS 11, Prisma 6, Next.js 16, PostgreSQL (Supabase), Railway (PaaS), Vercel

**Design doc:** `docs/plans/2026-03-05-deployment-design.md` (sections 3.1-3.10)

---

## Pre-requisites

- Local PostgreSQL running (`docker compose up -d` in `backend/`)
- Backend `.env` configured with local `DATABASE_URL`
- `npm install` completed in both `backend/` and `frontend/`

---

### Task 1: Add `directUrl` to Prisma schema for Supabase pooler

**Files:**
- Modify: `backend/prisma/schema.prisma:11-14`

**Why:** Supabase uses Supavisor connection pooler. Prisma needs a separate direct connection URL for migrations (the pooler breaks prepared statements used by `prisma migrate`). Without `directUrl`, deployments with migrations will fail.

**Step 1: Edit the datasource block**

In `backend/prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

To:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Step 2: Add DIRECT_URL to local .env**

In `backend/.env`, add (pointing to the same local database):

```
DIRECT_URL="postgresql://admin:admin123@localhost:5432/inventario_db"
```

This keeps local development working since both URLs point to the same local DB. In production, they will differ (pooler vs direct).

**Step 3: Verify Prisma still works**

Run (from `backend/`):
```bash
npx prisma validate
```
Expected: `The schema at prisma/schema.prisma is valid`

Run:
```bash
npx prisma generate
```
Expected: `Generated Prisma Client` success message

**Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/.env
git commit -m "feat(prisma): add directUrl for Supabase connection pooler support"
```

Note: `.env` is gitignored so only `schema.prisma` will be committed.

---

### Task 2: Bind NestJS to `0.0.0.0` for Railway

**Files:**
- Modify: `backend/src/main.ts:56`

**Why:** Railway assigns a dynamic internal IP. NestJS must listen on all interfaces (`0.0.0.0`) or Railway cannot route traffic to the container. This is explicitly required by Railway's documentation for NestJS apps.

**Step 1: Update the listen call**

In `backend/src/main.ts`, change line 56:

```typescript
  await app.listen(port);
```

To:

```typescript
  await app.listen(port, '0.0.0.0');
```

**Step 2: Verify server starts locally**

Run (from `backend/`):
```bash
npm run start:dev
```
Expected: Server starts successfully on configured port. Verify `curl http://localhost:3001/api` returns "Hello World!".

Kill the server with Ctrl+C after verification.

**Step 3: Commit**

```bash
git add backend/src/main.ts
git commit -m "fix(server): bind to 0.0.0.0 for Railway deployment compatibility"
```

---

### Task 3: Add health check endpoint

**Files:**
- Modify: `backend/src/app.controller.ts`

**Why:** Railway uses health checks to determine if a service is alive. Without this endpoint, Railway cannot distinguish between a healthy service and one with a broken database connection. Also used by monitoring tools like UptimeRobot.

**Step 1: Replace the entire app.controller.ts**

Replace the content of `backend/src/app.controller.ts` with:

```typescript
import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
      });
    }
  }
}
```

**Step 2: Verify PrismaModule is available in AppModule**

Open `backend/src/app.module.ts` and confirm `PrismaModule` is in the imports array (it already is at line 29). Since `PrismaModule` is global, `PrismaService` is injectable in `AppController` without additional imports.

**Step 3: Verify the endpoint works**

Run (from `backend/`):
```bash
npm run start:dev
```

Then test:
```bash
curl http://localhost:3001/api/health
```
Expected response:
```json
{"status":"ok","database":"connected","timestamp":"2026-03-06T..."}
```

Kill the server after verification.

**Step 4: Commit**

```bash
git add backend/src/app.controller.ts
git commit -m "feat(health): add /api/health endpoint with database connectivity check"
```

---

### Task 4: Harden prisma.config.ts for production

**Files:**
- Modify: `backend/prisma.config.ts`

**Why:** The current fallback `postgresql://admin:admin123@localhost:5432/inventario_db` silently uses local credentials if `DATABASE_URL` is missing. In production, this should crash immediately to prevent connecting to a wrong database.

**Step 1: Update prisma.config.ts**

Replace the content of `backend/prisma.config.ts` with:

```typescript
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url:
      process.env['DATABASE_URL'] ??
      (process.env.NODE_ENV === 'production'
        ? (() => {
            throw new Error('DATABASE_URL is required in production');
          })()
        : 'postgresql://admin:admin123@localhost:5432/inventario_db'),
  },
});
```

**Step 2: Verify local dev still works**

Run (from `backend/`):
```bash
npx prisma validate
```
Expected: Schema valid (uses local fallback since NODE_ENV is not "production").

**Step 3: Commit**

```bash
git add backend/prisma.config.ts
git commit -m "fix(prisma): fail loudly when DATABASE_URL missing in production"
```

---

### Task 5: Add `prebuild` script with generate + migrate

**Files:**
- Modify: `backend/package.json:8-22` (scripts section)

**Why:** Railway's Nixpacks runs `npm run build` automatically. We need `prisma generate` (creates the client) and `prisma migrate deploy` (applies pending migrations) to run before the NestJS build. The `prebuild` npm lifecycle hook runs automatically before `build`. Also, Railway defaults to `npm start` which runs `nest start` (dev mode) -- we need to ensure `start:prod` is used.

**Step 1: Add the prebuild script**

In `backend/package.json`, in the `"scripts"` section, add after the `"build"` line:

```json
"prebuild": "npx prisma generate && npx prisma migrate deploy",
```

The scripts section should now have (in order):
```json
"scripts": {
    "build": "nest build",
    "prebuild": "npx prisma generate && npx prisma migrate deploy",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    ...
}
```

**Step 2: Verify the prebuild runs correctly**

Run (from `backend/`):
```bash
npm run prebuild
```
Expected:
- `Prisma Client generated` message
- `X migrations applied` or `No pending migrations` message

Then verify build works:
```bash
npm run build
```
Expected: Build completes successfully, `dist/` directory populated.

**Step 3: Commit**

```bash
git add backend/package.json
git commit -m "feat(build): add prebuild script for Prisma generate + migrate deploy"
```

---

### Task 6: Register ThrottlerGuard as global APP_GUARD

**Files:**
- Modify: `backend/src/app.module.ts`

**Why:** The `ThrottlerModule.forRoot()` is registered (100 req/60s config) but `ThrottlerGuard` is never applied globally. Only the login endpoint has `@Throttle()`. This means ALL other endpoints have zero rate limiting -- a serious gap for production. Registering `ThrottlerGuard` via `APP_GUARD` protects every endpoint by default.

**Step 1: Add the global guard provider**

In `backend/src/app.module.ts`, add the imports:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
```

Then update the `@Module` decorator to include the provider:

```typescript
@Module({
  imports: [
    // ... existing imports unchanged ...
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Step 2: Verify rate limiting works**

Run (from `backend/`):
```bash
npm run start:dev
```

Then in a separate terminal, send rapid requests:
```bash
for i in $(seq 1 105); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api; done
```

Expected: First 100 requests return `200`, then `429` (Too Many Requests) starts appearing.

On Windows PowerShell, use:
```powershell
1..105 | ForEach-Object { (Invoke-WebRequest -Uri http://localhost:3001/api -Method GET -ErrorAction SilentlyContinue).StatusCode }
```

Kill the server after verification.

**Step 3: Commit**

```bash
git add backend/src/app.module.ts
git commit -m "fix(security): apply ThrottlerGuard globally to protect all endpoints"
```

---

### Task 7: Create environment example files

**Files:**
- Create: `backend/.env.example`
- Create: `frontend/.env.example`

**Why:** `.env` files are gitignored. Without `.env.example` files, a new developer (or the deployment platform) has no reference for what environment variables are required.

**Step 1: Create backend/.env.example**

Create `backend/.env.example` with:

```env
# ==============================================
# Supabase PostgreSQL
# ==============================================

# Session pooler - used by Prisma Client at runtime
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Direct connection - used by Prisma for migrations
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.com:5432/postgres"

# ==============================================
# Authentication
# ==============================================

# Generate with: openssl rand -hex 32
JWT_SECRET="your-jwt-secret-here"

# ==============================================
# Server
# ==============================================

PORT=3001
CORS_ORIGIN="https://your-frontend.vercel.app"
NODE_ENV=production

# ==============================================
# Cloudinary (product images)
# ==============================================

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Step 2: Create frontend/.env.example**

Create `frontend/.env.example` with:

```env
# Backend API URL (injected at BUILD TIME via NEXT_PUBLIC_ prefix)
# Must include /api suffix
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

**Step 3: Commit**

```bash
git add backend/.env.example frontend/.env.example
git commit -m "docs: add .env.example files for deployment reference"
```

---

### Task 8: Remove backend/dist/ from git tracking

**Files:**
- Remove from tracking: `backend/dist/**`

**Why:** Compiled JavaScript artifacts are tracked in git, adding bloat (~208 files) and causing merge conflicts on every build. The `backend/.gitignore` already ignores `dist/` but the files were committed before that rule existed.

**Step 1: Verify files are tracked**

Run (from project root):
```bash
git ls-files backend/dist/ | wc -l
```
Expected: A number > 0 (confirming files are tracked).

**Step 2: Remove from tracking (keep on disk)**

```bash
git rm -r --cached backend/dist
```

Expected: `rm 'backend/dist/...'` messages for each file.

**Step 3: Verify removal**

```bash
git ls-files backend/dist/ | wc -l
```
Expected: `0`

**Step 4: Commit**

```bash
git commit -m "chore: remove backend/dist/ build artifacts from git tracking"
```

---

### Task 9: Create root .gitignore

**Files:**
- Create: `.gitignore` (at project root)

**Why:** There is no root-level `.gitignore`. Each subproject has its own, but a root-level one provides a safety net and ensures consistency. It also protects against accidentally committing IDE files, OS files, or environment variables from the root.

**Step 1: Create .gitignore at project root**

Create `.gitignore` in the project root with:

```gitignore
# Dependencies
node_modules/

# Environment variables
.env*
!.env.example

# Build outputs
dist/
.next/
out/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Coverage
coverage/

# Logs
*.log
npm-debug.log*

# Prisma generated
generated/
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add root .gitignore for project-wide safety net"
```

---

### Task 10: Final verification build

**Files:** None (verification only)

**Why:** Confirm ALL changes work together before pushing to GitHub. A broken push triggers a failed deploy on Railway/Vercel.

**Step 1: Full backend build from clean state**

Run (from `backend/`):
```bash
npm run prebuild && npm run build
```
Expected: Both commands succeed. `dist/` directory contains compiled output.

**Step 2: Start production server locally**

Run (from `backend/`):
```bash
npm run start:prod
```
Expected: Server starts on port 3001.

**Step 3: Verify all endpoints**

In a separate terminal:
```bash
curl http://localhost:3001/api
curl http://localhost:3001/api/health
```
Expected:
- `/api` returns `Hello World!`
- `/api/health` returns `{"status":"ok","database":"connected","timestamp":"..."}`

Kill the server.

**Step 4: Verify frontend builds**

Run (from `frontend/`):
```bash
npm run build
```
Expected: Build succeeds without errors.

**Step 5: Final commit (if any unstaged changes)**

```bash
git status
```

If clean, proceed. If there are changes:
```bash
git add -A
git commit -m "chore: final deployment preparation cleanup"
```

**Step 6: Push to GitHub**

```bash
git push origin main
```

---

## Summary of Changes

| Task | File | Change | Design Ref |
|------|------|--------|-----------|
| 1 | `backend/prisma/schema.prisma` | Add `directUrl` for Supabase | 3.1 |
| 2 | `backend/src/main.ts` | Bind to `0.0.0.0` | 3.2 |
| 3 | `backend/src/app.controller.ts` | Health check endpoint | 3.3 |
| 4 | `backend/prisma.config.ts` | Fail on missing DATABASE_URL in prod | 3.4 |
| 5 | `backend/package.json` | `prebuild` = generate + migrate | 3.5 |
| 6 | `backend/src/app.module.ts` | Global ThrottlerGuard | 3.8 |
| 7 | `backend/.env.example` + `frontend/.env.example` | Env documentation | 3.6 |
| 8 | `backend/dist/` | Remove from git tracking | 3.9 |
| 9 | `.gitignore` (root) | Create root gitignore | 3.10 |
| 10 | -- | Full verification build | -- |

## Post-Implementation

After pushing to GitHub, proceed with the deployment design doc phases:
- **Fase 1**: Create Supabase project + run migrations + seed
- **Fase 2**: Create Railway service + set env vars + set start command to `npm run start:prod`
- **Fase 3**: Create Vercel project + set `NEXT_PUBLIC_API_URL`
- **Fase 4**: Update `CORS_ORIGIN` in Railway + E2E test

See `docs/plans/2026-03-05-deployment-design.md` sections 4.1-4.5 for detailed steps.
