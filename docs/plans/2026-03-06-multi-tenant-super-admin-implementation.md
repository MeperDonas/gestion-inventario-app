# Multi-Tenant + SUPER_ADMIN Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform single-tenant inventory system into a multi-tenant platform with SUPER_ADMIN (software distributor) role that manages business tenants and their admins.

**Architecture:** Add `Tenant` model with `tenantId` column on all business tables. Use Prisma Client Extensions via request-scoped `TENANT_PRISMA` provider for automatic tenant filtering. New `platform` module for SUPER_ADMIN operations. Login via email + password + tenant slug. Admin onboarding via one-time activation tokens (SHA-256 hashed, TTL-based). Impersonation with JWT jti + revocation table.

**Tech Stack:** NestJS 11, Prisma 6, PostgreSQL, Next.js 16, React 19, TanStack Query v5, TailwindCSS v4

**Design Document:** `docs/plans/2026-03-06-multi-tenant-super-admin-design.md`

---

## Phase 1: Database

### Task 1: Update Prisma Schema - New Enums

**Files:**
- Modify: `backend/prisma/schema.prisma:31-35` (Role enum)

**Step 1: Add SUPER_ADMIN to Role enum and add new enums**

In `backend/prisma/schema.prisma`, replace the Role enum (lines 31-35) with:

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  CASHIER
  INVENTORY_USER
}
```

Then add these new enums after the existing `SaleStatus` enum (after line 147):

```prisma
enum TenantStatus {
  PENDING_SETUP
  ACTIVE
  SUSPENDED
  TRIAL_EXPIRED
}

enum TenantPlan {
  BASIC
  PRO
  ENTERPRISE
}

enum UserStatus {
  PENDING_ACTIVATION
  ACTIVE
  BLOCKED
}

enum InviteTokenType {
  ADMIN_ACTIVATION
  PASSWORD_RESET
}
```

**Step 2: Verify schema syntax**

Run: `npx prisma validate` in `backend/`
Expected: "The schema is valid"

**Step 3: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat(schema): add SUPER_ADMIN role and multi-tenant enums"
```

---

### Task 2: Add Tenant, InviteToken, ImpersonationSession Models

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Add Tenant model**

Add before the User model (before line 17):

```prisma
model Tenant {
  id        String       @id @default(uuid())
  name      String
  slug      String       @unique
  status    TenantStatus @default(PENDING_SETUP)
  plan      TenantPlan   @default(BASIC)

  users              User[]
  products           Product[]
  categories         Category[]
  customers          Customer[]
  sales              Sale[]
  inventoryMovements InventoryMovement[]
  settings           Settings[]
  auditLogs          AuditLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Step 2: Add InviteToken model**

Add after Settings model (end of file):

```prisma
model InviteToken {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            InviteTokenType
  tokenHash       String
  expiresAt       DateTime
  consumedAt      DateTime?
  createdByUserId String
  createdAt       DateTime        @default(now())

  @@index([tokenHash])
  @@index([userId])
}
```

**Step 3: Add ImpersonationSession model**

Add after InviteToken model:

```prisma
model ImpersonationSession {
  id             String    @id @default(uuid())
  superAdminId   String
  targetTenantId String
  targetUserId   String
  reason         String
  revokedAt      DateTime?
  expiresAt      DateTime
  createdAt      DateTime  @default(now())

  @@index([id, revokedAt])
}
```

**Step 4: Verify schema syntax**

Run: `npx prisma validate` in `backend/`
Expected: "The schema is valid"

**Step 5: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat(schema): add Tenant, InviteToken, ImpersonationSession models"
```

---

### Task 3: Add tenantId + New Fields to User Model

**Files:**
- Modify: `backend/prisma/schema.prisma:17-30` (User model)

**Step 1: Update User model**

Replace the User model (lines 17-30) with:

```prisma
model User {
  id                 String     @id @default(uuid())
  email              String
  password           String
  name               String
  role               Role       @default(CASHIER)
  active             Boolean    @default(true)
  status             UserStatus @default(ACTIVE)
  mustChangePassword Boolean    @default(false)

  tenantId String?
  tenant   Tenant? @relation(fields: [tenantId], references: [id])

  settings           Settings[]
  sales              Sale[]
  inventoryMovements InventoryMovement[]
  auditLogs          AuditLog[]
  inviteTokens       InviteToken[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, email])
}
```

**IMPORTANT:** Remove the old `@unique` on email (line 19 of original). The new `@@unique([tenantId, email])` replaces it.

**Step 2: Verify schema syntax**

Run: `npx prisma validate` in `backend/`
Expected: "The schema is valid"

**Step 3: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat(schema): add tenantId, status, mustChangePassword to User model"
```

---

### Task 4: Add tenantId to All Business Models

**Files:**
- Modify: `backend/prisma/schema.prisma` (Category, Product, InventoryMovement, Customer, Sale, Payment, SaleItem, Settings, AuditLog)

**Step 1: Add tenantId to Category model (lines ~37-45)**

Add these fields inside the Category model:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
```

Remove `@unique` from `name` field. Replace with compound unique:

```prisma
  @@unique([tenantId, name])
  @@index([tenantId])
```

**Step 2: Add tenantId to Product model (lines ~47-67)**

Add inside the Product model:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
```

Change `sku @unique` and `barcode @unique` to compound uniques:

```prisma
  @@unique([tenantId, sku])
  @@unique([tenantId, barcode])
  @@index([tenantId])
```

**Step 3: Add tenantId to InventoryMovement model (lines ~69-85)**

Add:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
```

Update the existing index to include tenantId:

```prisma
  @@index([tenantId])
  @@index([productId, createdAt])
```

**Step 4: Add tenantId to Customer model (lines ~95-108)**

Add:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
```

Change `documentNumber @unique` to compound:

```prisma
  @@unique([tenantId, documentNumber])
  @@index([tenantId])
```

**Step 5: Add tenantId to Sale model (lines ~116-137)**

Add:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
```

For `saleNumber`, it currently uses `@default(autoincrement())`. In multi-tenant, we need a compound approach. Change to:

```prisma
  saleNumber Int
  @@unique([tenantId, saleNumber])
  @@index([tenantId])
  @@index([createdAt, status])
```

NOTE: Sale number generation will need to be handled in the service layer (max saleNumber for tenant + 1).

**Step 6: Add tenantId to Payment model (lines ~149-158)**

Add:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([saleId])
```

**Step 7: Add tenantId to SaleItem model (lines ~160-175)**

Add:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([saleId])
  @@index([productId])
```

**Step 8: Add tenantId to Settings model (lines ~188-201)**

Add:

```prisma
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
```

**Step 9: Update AuditLog model (lines ~177-186)**

Replace with expanded version:

```prisma
model AuditLog {
  id             String   @id @default(uuid())
  requestId      String?
  actorUserId    String?
  actorRole      String?
  targetTenantId String?
  action         String
  resource       String
  metadata       Json?
  ip             String?
  userAgent      String?
  reason         String?

  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  tenantId String?
  tenant   Tenant? @relation(fields: [tenantId], references: [id])

  createdAt DateTime @default(now())

  @@index([requestId])
  @@index([actorUserId])
  @@index([targetTenantId])
  @@index([tenantId])
  @@index([action])
}
```

**Step 10: Verify schema syntax**

Run: `npx prisma validate` in `backend/`
Expected: "The schema is valid"

**Step 11: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat(schema): add tenantId to all business models with compound uniques"
```

---

### Task 5: Create Migration (EXPAND phase)

**Files:**
- Will create: `backend/prisma/migrations/YYYYMMDDHHMMSS_add_multi_tenant_expand/migration.sql`

**Step 1: Generate Prisma migration (do NOT apply yet)**

Run: `npx prisma migrate dev --name add_multi_tenant_expand --create-only` in `backend/`
Expected: Creates a migration SQL file without applying it.

**Step 2: Review the generated migration SQL**

Open the generated migration file and verify it:
- Creates `Tenant` table
- Creates `InviteToken` table
- Creates `ImpersonationSession` table
- Adds nullable `tenantId` columns to all business tables
- Adds `status`, `mustChangePassword` to User
- Adds new enums
- Creates new indexes and unique constraints

**Step 3: Add partial unique index for SUPER_ADMIN email**

Append this SQL at the end of the generated migration file:

```sql
-- Partial unique index for SUPER_ADMIN (tenantId IS NULL)
CREATE UNIQUE INDEX "User_email_superadmin_unique" ON "User" (email) WHERE "tenantId" IS NULL;
```

**Step 4: Apply the migration**

Run: `npx prisma migrate dev` in `backend/`
Expected: Migration applied successfully

**Step 5: Generate Prisma Client**

Run: `npx prisma generate` in `backend/`
Expected: Client generated

**Step 6: Commit**

```bash
git add backend/prisma/
git commit -m "feat(migration): expand phase - add multi-tenant tables and columns"
```

---

### Task 6: Create Backfill Migration

**Files:**
- Create: `backend/prisma/migrations/YYYYMMDDHHMMSS_backfill_default_tenant/migration.sql`

**Step 1: Create the backfill migration**

Run: `npx prisma migrate dev --name backfill_default_tenant --create-only` in `backend/`

**Step 2: Write the backfill SQL**

Replace the content of the generated (likely empty) migration file with:

```sql
-- Create default tenant for existing data
INSERT INTO "Tenant" (id, name, slug, status, plan, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Negocio Original',
  'negocio-original',
  'ACTIVE',
  'BASIC',
  NOW(),
  NOW()
);

-- Backfill users (skip SUPER_ADMIN which would have tenantId NULL)
UPDATE "User" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "User" SET "status" = 'ACTIVE' WHERE "status" IS NULL;

-- Backfill all business tables
UPDATE "Category" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "Product" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "InventoryMovement" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "Customer" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "Sale" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "Payment" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "SaleItem" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "Settings" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "AuditLog" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
```

**Step 3: Apply migration**

Run: `npx prisma migrate dev` in `backend/`
Expected: Migration applied, all rows now have tenantId

**Step 4: Commit**

```bash
git add backend/prisma/
git commit -m "feat(migration): backfill default tenant for existing data"
```

---

### Task 7: Create Contract Migration (NOT NULL constraints)

**Files:**
- Create: `backend/prisma/migrations/YYYYMMDDHHMMSS_contract_tenant_not_null/migration.sql`

**Step 1: Create contract migration**

Run: `npx prisma migrate dev --name contract_tenant_not_null --create-only` in `backend/`

**Step 2: Write the contract SQL**

Replace with:

```sql
-- Make tenantId NOT NULL on all business tables
-- User.tenantId stays nullable (SUPER_ADMIN has NULL)
ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "InventoryMovement" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "SaleItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Settings" ALTER COLUMN "tenantId" SET NOT NULL;
-- AuditLog.tenantId stays nullable (SUPER_ADMIN actions have no tenant)
```

**Step 3: Update Prisma schema to match**

In `backend/prisma/schema.prisma`, change the `tenantId` fields on Category, Product, InventoryMovement, Customer, Sale, Payment, SaleItem, Settings from `String?` to `String` (if they were optional). Make sure `Tenant` relation changes from `Tenant?` to `Tenant`.

User.tenantId and AuditLog.tenantId remain `String?` (nullable).

**Step 4: Apply migration**

Run: `npx prisma migrate dev` in `backend/`

**Step 5: Generate Prisma Client**

Run: `npx prisma generate` in `backend/`

**Step 6: Commit**

```bash
git add backend/prisma/
git commit -m "feat(migration): contract phase - enforce NOT NULL on tenantId"
```

---

### Task 8: Update Seed Script

**Files:**
- Modify: `backend/prisma/seed.ts` (183 lines)

**Step 1: Rewrite seed.ts**

Replace the entire content of `backend/prisma/seed.ts` with a new version that:

1. In production: Creates only SUPER_ADMIN from env vars (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`). Fails if env vars missing.
2. In development: Creates SUPER_ADMIN + demo tenant + demo admin/cashier/inventory_user + demo categories/products/customers.
3. Uses `findFirst` + `create` instead of `upsert` (because partial unique index).
4. All demo data includes `tenantId: demoTenant.id`.

Key changes from original:
- Add `Tenant` creation before users
- All `prisma.user.create()` calls include `tenantId`
- All `prisma.category.create()` calls include `tenantId`
- All `prisma.product.createMany()` data includes `tenantId`
- All `prisma.customer.createMany()` data includes `tenantId`
- Settings creation includes `tenantId`
- SUPER_ADMIN user has `tenantId: null`, `status: 'ACTIVE'`, `role: 'SUPER_ADMIN'`
- Demo admin has `status: 'ACTIVE'`, `role: 'ADMIN'`

**Step 2: Test seed in development**

Run: `npx prisma migrate reset --force` in `backend/` (this drops, migrates, and seeds)
Expected: Seed completes without errors. Database has SUPER_ADMIN + demo tenant with data.

**Step 3: Verify seed data**

Run: `npx prisma studio` in `backend/` and verify:
- 1 SUPER_ADMIN user with `tenantId: null`
- 1 Tenant record (demo)
- 3 tenant users with `tenantId` matching the demo tenant
- All products/categories/customers have the demo `tenantId`

**Step 4: Commit**

```bash
git add backend/prisma/seed.ts
git commit -m "feat(seed): multi-tenant seed with SUPER_ADMIN from env vars"
```

---

## Phase 2: Backend Core Infrastructure

### Task 9: Create Error Codes Enum

**Files:**
- Create: `backend/src/common/constants/error-codes.ts`

**Step 1: Create error codes file**

```typescript
export enum ErrorCode {
  TENANT_SUSPENDED = 'TENANT_SUSPENDED',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  USER_BLOCKED = 'USER_BLOCKED',
  USER_PENDING = 'USER_PENDING_ACTIVATION',
  INVITE_EXPIRED = 'INVITE_EXPIRED',
  INVITE_ALREADY_USED = 'INVITE_ALREADY_USED',
  INVITE_INVALID = 'INVITE_INVALID',
  IMPERSONATION_EXPIRED = 'IMPERSONATION_EXPIRED',
}
```

**Step 2: Commit**

```bash
git add backend/src/common/constants/error-codes.ts
git commit -m "feat: add stable error codes for multi-tenant"
```

---

### Task 10: Update Roles Decorator for SUPER_ADMIN

**Files:**
- Modify: `backend/src/common/decorators/roles.decorator.ts` (6 lines)

**Step 1: Update RoleType to include SUPER_ADMIN**

Replace entire file:

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
```

**Step 2: Commit**

```bash
git add backend/src/common/decorators/roles.decorator.ts
git commit -m "feat: add SUPER_ADMIN to RoleType"
```

---

### Task 11: Create SkipTenantCheck Decorator

**Files:**
- Create: `backend/src/common/decorators/skip-tenant-check.decorator.ts`

**Step 1: Create decorator**

```typescript
import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_CHECK_KEY = 'skipTenantCheck';
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK_KEY, true);
```

**Step 2: Commit**

```bash
git add backend/src/common/decorators/skip-tenant-check.decorator.ts
git commit -m "feat: add SkipTenantCheck decorator"
```

---

### Task 12: Update JWT Strategy to Include tenantId

**Files:**
- Modify: `backend/src/auth/jwt.strategy.ts` (28 lines)

**Step 1: Add tenantId to validate return**

In the `validate()` method (line 21-27), add `tenantId`:

```typescript
async validate(payload: { sub: string; email: string; role: string; tenantId: string | null; impersonatedBy?: string; jti?: string }) {
  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId ?? null,
    impersonatedBy: payload.impersonatedBy ?? null,
    jti: payload.jti ?? null,
  };
}
```

**Step 2: Commit**

```bash
git add backend/src/auth/jwt.strategy.ts
git commit -m "feat(auth): add tenantId to JWT validation payload"
```

---

### Task 13: Create Tenant-Scoped Prisma Provider

**Files:**
- Create: `backend/src/prisma/tenant-prisma.provider.ts`
- Modify: `backend/src/prisma/prisma.module.ts`

**Step 1: Create TenantPrismaProvider**

Create `backend/src/prisma/tenant-prisma.provider.ts`:

```typescript
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from './prisma.service';

// Models that have tenantId
const TENANT_MODELS = [
  'category',
  'product',
  'inventoryMovement',
  'customer',
  'sale',
  'payment',
  'saleItem',
  'settings',
  'auditLog',
] as const;

// Models where tenantId is in User (handled separately)
const USER_MODEL = 'user' as const;

export const TENANT_PRISMA = Symbol('TENANT_PRISMA');

@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaProvider {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  getClient() {
    const user = this.request.user;

    // SUPER_ADMIN bypasses tenant filtering
    if (!user || user.role === 'SUPER_ADMIN') {
      return this.prisma;
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant context required for non-SUPER_ADMIN users');
    }

    return this.prisma.$extends({
      query: {
        $allModels: {
          async findMany({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async findFirst({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async findUnique({ model, args, query }) {
            // Convert findUnique to findFirst with tenantId for safety
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async count({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async aggregate({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async groupBy({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async create({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.data = { ...args.data, tenantId };
            }
            return query(args);
          },
          async createMany({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((d: any) => ({ ...d, tenantId }));
              } else {
                args.data = { ...args.data, tenantId };
              }
            }
            return query(args);
          },
          async update({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async updateMany({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async delete({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async deleteMany({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async upsert({ model, args, query }) {
            if (TENANT_MODELS.includes(model.toLowerCase() as any) || model.toLowerCase() === USER_MODEL) {
              args.where = { ...args.where, tenantId };
              args.create = { ...args.create, tenantId };
            }
            return query(args);
          },
        },
      },
    });
  }
}
```

**Step 2: Update PrismaModule to export TENANT_PRISMA**

In `backend/src/prisma/prisma.module.ts`, add the provider:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantPrismaProvider, TENANT_PRISMA } from './tenant-prisma.provider';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: TENANT_PRISMA,
      useClass: TenantPrismaProvider,
    },
  ],
  exports: [PrismaService, TENANT_PRISMA],
})
export class PrismaModule {}
```

**Step 3: Verify compilation**

Run: `npm run build` in `backend/`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add backend/src/prisma/
git commit -m "feat(prisma): add request-scoped TenantPrismaProvider with $extends"
```

---

### Task 14: Create TenantGuard

**Files:**
- Create: `backend/src/common/guards/tenant.guard.ts`

**Step 1: Create TenantGuard**

```typescript
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_TENANT_CHECK_KEY } from '../decorators/skip-tenant-check.decorator';
import { ErrorCode } from '../constants/error-codes';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is exempt from tenant check
    const skipTenantCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipTenantCheck) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // SUPER_ADMIN bypasses tenant checks
    if (user.role === 'SUPER_ADMIN') return true;

    // Check user status
    if (user.status === 'BLOCKED') {
      throw new ForbiddenException({
        code: ErrorCode.USER_BLOCKED,
        message: 'Tu cuenta ha sido bloqueada. Contacta al administrador de tu negocio.',
      });
    }

    if (user.status === 'PENDING_ACTIVATION') {
      throw new ForbiddenException({
        code: ErrorCode.USER_PENDING,
        message: 'Tu cuenta esta pendiente de activacion.',
      });
    }

    // Check tenant status
    if (!user.tenantId) {
      throw new ForbiddenException({ message: 'Tenant context required.' });
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { status: true },
    });

    if (!tenant) {
      throw new ForbiddenException({
        code: ErrorCode.TENANT_NOT_FOUND,
        message: 'Negocio no encontrado.',
      });
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException({
        code: ErrorCode.TENANT_SUSPENDED,
        message: 'Tu negocio esta suspendido. Contacta al distribuidor del sistema.',
      });
    }

    if (tenant.status === 'TRIAL_EXPIRED') {
      throw new ForbiddenException({
        code: ErrorCode.TENANT_SUSPENDED,
        message: 'El periodo de prueba de tu negocio ha expirado. Contacta al distribuidor.',
      });
    }

    // Check impersonation session validity
    if (user.impersonatedBy && user.jti) {
      const session = await this.prisma.impersonationSession.findUnique({
        where: { id: user.jti },
      });
      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new ForbiddenException({
          code: ErrorCode.IMPERSONATION_EXPIRED,
          message: 'La sesion de impersonacion ha expirado.',
        });
      }
    }

    return true;
  }
}
```

**Step 2: Verify compilation**

Run: `npm run build` in `backend/`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add backend/src/common/guards/tenant.guard.ts
git commit -m "feat: add TenantGuard with tenant/user status validation"
```

---

### Task 15: Create RequestId Middleware

**Files:**
- Create: `backend/src/common/middleware/request-id.middleware.ts`

**Step 1: Create middleware**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    (req as any).requestId = req.headers['x-request-id'] as string || randomUUID();
    next();
  }
}
```

**Step 2: Register middleware in AppModule**

In `backend/src/app.module.ts`, add:

```typescript
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
```

**Step 3: Commit**

```bash
git add backend/src/common/middleware/request-id.middleware.ts backend/src/app.module.ts
git commit -m "feat: add RequestId middleware for audit correlation"
```

---

### Task 16: Add ESLint Rule for $queryRaw

**Files:**
- Modify: `backend/eslint.config.mjs` (35 lines)

**Step 1: Add no-restricted-properties rule**

Add this rule to the rules object in the ESLint config:

```javascript
'no-restricted-properties': ['error',
  {
    object: 'prisma',
    property: '$queryRaw',
    message: 'Use TenantRawQueryHelper instead of $queryRaw directly. See docs/plans/2026-03-06-multi-tenant-super-admin-design.md',
  },
  {
    object: 'prisma',
    property: '$executeRaw',
    message: 'Use TenantRawQueryHelper instead of $executeRaw directly.',
  },
  {
    property: '$queryRaw',
    message: 'Direct $queryRaw usage is prohibited. Use TenantRawQueryHelper.',
  },
  {
    property: '$executeRaw',
    message: 'Direct $executeRaw usage is prohibited. Use TenantRawQueryHelper.',
  },
],
```

NOTE: This will flag existing `$queryRaw` usage in `products.service.ts` and `reports.service.ts`. These will need to be refactored in Phase 5 to use a helper.

**Step 2: Create TenantRawQueryHelper**

Create `backend/src/common/utils/tenant-raw-query.helper.ts`:

```typescript
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * All raw SQL queries MUST go through this helper to ensure tenant isolation.
 * Direct $queryRaw/$executeRaw usage is prohibited by ESLint rule.
 */
export class TenantRawQueryHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantId: string | null,
  ) {}

  // eslint-disable-next-line no-restricted-properties
  async queryRaw<T = unknown>(query: TemplateStringsArray, ...values: any[]): Promise<T> {
    return this.prisma.$queryRaw(query, ...values) as Promise<T>;
  }

  // eslint-disable-next-line no-restricted-properties
  async executeRaw(query: TemplateStringsArray, ...values: any[]): Promise<number> {
    return this.prisma.$executeRaw(query, ...values);
  }

  getTenantId(): string | null {
    return this.tenantId;
  }
}
```

**Step 3: Commit**

```bash
git add backend/eslint.config.mjs backend/src/common/utils/tenant-raw-query.helper.ts
git commit -m "feat: add ESLint rule prohibiting direct $queryRaw and raw query helper"
```

---

## Phase 3: Platform Module

### Task 17: Create Platform Module Structure

**Files:**
- Create: `backend/src/platform/platform.module.ts`
- Create: `backend/src/platform/platform.controller.ts`
- Create: `backend/src/platform/platform.service.ts`
- Create: `backend/src/platform/dto/create-tenant.dto.ts`
- Create: `backend/src/platform/dto/update-tenant-status.dto.ts`
- Create: `backend/src/platform/dto/impersonate.dto.ts`
- Modify: `backend/src/app.module.ts`

**Step 1: Create DTOs**

Create `backend/src/platform/dto/create-tenant.dto.ts`:

```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export enum TenantPlanDto {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens only' })
  @MinLength(3)
  @MaxLength(50)
  slug: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  adminName: string;

  @IsEnum(TenantPlanDto)
  @IsOptional()
  plan?: TenantPlanDto;
}
```

Create `backend/src/platform/dto/update-tenant-status.dto.ts`:

```typescript
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum TenantStatusUpdateDto {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatusUpdateDto)
  status: TenantStatusUpdateDto;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
```

Create `backend/src/platform/dto/impersonate.dto.ts`:

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class ImpersonateDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
```

**Step 2: Create PlatformService**

Create `backend/src/platform/platform.service.ts` with methods:

- `createTenant(dto, superAdminId)` - Creates Tenant + Admin (PENDING_ACTIVATION) + InviteToken in a transaction. Returns tenant, admin user, and the raw activation token (shown once).
- `getTenants(filters?)` - Lists all tenants with admin user info.
- `getTenant(id)` - Get tenant detail with admin and user count.
- `updateTenantStatus(id, dto, superAdminId)` - Change tenant status, audit.
- `resendInvite(tenantId, superAdminId)` - Invalidate old tokens, create new InviteToken, return raw token.
- `resetAdminPassword(userId, superAdminId, reason)` - Invalidate old tokens, create PASSWORD_RESET token, return raw token.
- `impersonate(tenantId, superAdminId, reason)` - Create ImpersonationSession, generate JWT with jti.
- `endImpersonation(jti)` - Revoke ImpersonationSession.

Token generation pattern:
```typescript
import { randomBytes, createHash } from 'crypto';

const rawToken = randomBytes(32).toString('hex');
const tokenHash = createHash('sha256').update(rawToken).digest('hex');
// Store tokenHash in DB, return rawToken to caller
```

**Step 3: Create PlatformController**

Create `backend/src/platform/platform.controller.ts` with all endpoints listed in the design. All routes prefixed with `platform/`. All guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` at class level and `@Roles('SUPER_ADMIN')`.

**Step 4: Create PlatformModule**

Create `backend/src/platform/platform.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
```

**Step 5: Register PlatformModule in AppModule**

In `backend/src/app.module.ts`, add `PlatformModule` to imports array.

**Step 6: Verify compilation**

Run: `npm run build` in `backend/`

**Step 7: Commit**

```bash
git add backend/src/platform/ backend/src/app.module.ts
git commit -m "feat: add platform module for SUPER_ADMIN tenant management"
```

---

## Phase 4: Auth Endpoints Update

### Task 18: Update Login to Support Tenant Slug

**Files:**
- Modify: `backend/src/auth/dto/auth.dto.ts:11-20` (LoginDto)
- Modify: `backend/src/auth/auth.service.ts:80-114` (login method)
- Modify: `backend/src/auth/auth.controller.ts:33-40` (login endpoint)

**Step 1: Update LoginDto**

Add `tenantSlug` field to LoginDto:

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  tenantSlug?: string;
}
```

**Step 2: Update login() method in auth.service.ts**

Rewrite the login method to:
1. If `tenantSlug` is empty/undefined → search for SUPER_ADMIN with `tenantId: null`
2. If `tenantSlug` provided → find Tenant by slug → check Tenant.status === ACTIVE → find User by `(tenantId, email)`
3. Check User.status (ACTIVE, BLOCKED, PENDING_ACTIVATION)
4. Return stable error codes for each failure case
5. Include `tenantId` in JWT payload

**Step 3: Update JWT payload to include tenantId**

In the `jwtService.sign()` call (around line 97-101), add `tenantId`:

```typescript
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId,
};
```

**Step 4: Update the login endpoint response**

Include tenant info in response for the frontend:

```typescript
return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
  },
};
```

**Step 5: Verify compilation and test manually**

Run: `npm run build` in `backend/`

**Step 6: Commit**

```bash
git add backend/src/auth/
git commit -m "feat(auth): multi-tenant login with tenantSlug"
```

---

### Task 19: Add Activate and Reset Password Endpoints

**Files:**
- Modify: `backend/src/auth/dto/auth.dto.ts` (add new DTOs)
- Modify: `backend/src/auth/auth.service.ts` (add new methods)
- Modify: `backend/src/auth/auth.controller.ts` (add new endpoints)

**Step 1: Add ActivateAccountDto and ResetPasswordDto**

Add to `backend/src/auth/dto/auth.dto.ts`:

```typescript
export class ActivateAccountDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;
}

export class ResetPasswordWithTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;
}
```

**Step 2: Add activateAccount() method to auth.service.ts**

Implements atomic token consumption:
```typescript
async activateAccount(dto: ActivateAccountDto) {
  const tokenHash = createHash('sha256').update(dto.token).digest('hex');

  // Atomic: consume token only if valid and unused
  const consumed = await this.prisma.inviteToken.updateMany({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      type: 'ADMIN_ACTIVATION',
    },
    data: { consumedAt: new Date() },
  });

  if (consumed.count === 0) {
    throw new BadRequestException({ code: ErrorCode.INVITE_INVALID });
  }

  // Find the token to get userId
  const inviteToken = await this.prisma.inviteToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });

  // Update user: set password, activate
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  await this.prisma.user.update({
    where: { id: inviteToken.user.id },
    data: {
      password: hashedPassword,
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  // Activate tenant if PENDING_SETUP
  if (inviteToken.user.tenantId) {
    await this.prisma.tenant.updateMany({
      where: { id: inviteToken.user.tenantId, status: 'PENDING_SETUP' },
      data: { status: 'ACTIVE' },
    });
  }

  // Audit
  await this.prisma.auditLog.create({
    data: {
      action: 'ADMIN_ACTIVATED',
      resource: 'auth',
      actorUserId: inviteToken.user.id,
      targetTenantId: inviteToken.user.tenantId,
      tenantId: inviteToken.user.tenantId,
    },
  });

  return { message: 'Cuenta activada exitosamente' };
}
```

**Step 3: Add resetPasswordWithToken() method (similar pattern)**

**Step 4: Add controller endpoints**

```typescript
@Post('activate')
async activateAccount(@Body() dto: ActivateAccountDto) {
  return this.authService.activateAccount(dto);
}

@Post('reset-password')
async resetPassword(@Body() dto: ResetPasswordWithTokenDto) {
  return this.authService.resetPasswordWithToken(dto);
}
```

These are PUBLIC endpoints (no guards).

**Step 5: Verify compilation**

Run: `npm run build` in `backend/`

**Step 6: Commit**

```bash
git add backend/src/auth/
git commit -m "feat(auth): add activate and reset-password public endpoints"
```

---

### Task 20: Update Auth Service User Management for Tenant Context

**Files:**
- Modify: `backend/src/auth/auth.service.ts`

**Step 1: Update createUser() to require tenantId**

The admin creating users passes their own tenantId. The created user inherits it.

**Step 2: Update getUsers() to filter by tenantId**

Only show users from the same tenant.

**Step 3: Update deleteUser() and toggleUserActive() to check tenant**

Ensure admin can only manage users within their tenant.

**Step 4: Update getProfile() to include tenant info**

Return `tenantId`, `tenantName`, `tenantSlug` in the profile response.

**Step 5: Verify and commit**

```bash
git add backend/src/auth/
git commit -m "feat(auth): scope user management to tenant context"
```

---

## Phase 5: Adapt Existing Services

### Task 21: Migrate Services to Use TENANT_PRISMA

**Files to modify (8 service files + 1 interceptor):**

1. `backend/src/products/products.service.ts` (405 lines)
2. `backend/src/categories/categories.service.ts` (131 lines)
3. `backend/src/customers/customers.service.ts` (143 lines)
4. `backend/src/sales/sales.service.ts` (672 lines)
5. `backend/src/reports/reports.service.ts` (396 lines)
6. `backend/src/settings/settings.service.ts` (99 lines)
7. `backend/src/exports/exports.service.ts` (341 lines)
8. `backend/src/imports/imports.service.ts` (1373 lines)
9. `backend/src/common/interceptors/audit.interceptor.ts` (113 lines)

**For each service:**

**Step 1: Change PrismaService injection to TENANT_PRISMA**

Replace:
```typescript
constructor(private prisma: PrismaService) {}
```

With:
```typescript
constructor(
  @Inject(TENANT_PRISMA) private tenantPrismaProvider: TenantPrismaProvider,
) {}

private get prisma() {
  return this.tenantPrismaProvider.getClient();
}
```

This approach minimizes changes to existing code. The `this.prisma` calls remain the same, but the underlying client is now tenant-scoped.

**Step 2: Update module imports**

Each module that injects TENANT_PRISMA must import PrismaModule (already global, so no change needed).

**Step 3: Handle $queryRaw in reports.service.ts and products.service.ts**

Replace direct `$queryRaw` calls with `TenantRawQueryHelper` usage. Add `WHERE tenant_id = $tenantId` to all raw SQL queries.

**Step 4: Handle $transaction in sales.service.ts**

The `$transaction` calls need special handling. Since `$extends` doesn't wrap `$transaction`, use the interactive transaction pattern:

```typescript
await this.prisma.$transaction(async (tx) => {
  // All operations inside tx are already tenant-scoped if using the extended client
  // But for safety, pass tenantId explicitly in transaction operations
});
```

**Step 5: Handle Sale.saleNumber auto-generation**

Since `@default(autoincrement())` was removed, add logic to generate sequential sale numbers per tenant:

```typescript
const lastSale = await tx.sale.findFirst({
  where: { tenantId },
  orderBy: { saleNumber: 'desc' },
  select: { saleNumber: true },
});
const nextSaleNumber = (lastSale?.saleNumber ?? 0) + 1;
```

**Step 6: Verify compilation after each service migration**

Run: `npm run build` in `backend/` after each service

**Step 7: Commit per service (or group small ones)**

```bash
git commit -m "refactor(products): migrate to tenant-scoped Prisma"
git commit -m "refactor(categories): migrate to tenant-scoped Prisma"
git commit -m "refactor(customers): migrate to tenant-scoped Prisma"
git commit -m "refactor(sales): migrate to tenant-scoped Prisma with sale number generation"
git commit -m "refactor(reports): migrate to tenant-scoped Prisma with raw query helper"
git commit -m "refactor(settings,exports,imports): migrate to tenant-scoped Prisma"
git commit -m "refactor(audit): add tenantId to audit log interceptor"
```

---

### Task 22: Apply TenantGuard Globally

**Files:**
- Modify: `backend/src/main.ts` or `backend/src/app.module.ts`

**Step 1: Register TenantGuard as global guard**

In `backend/src/app.module.ts`, add TenantGuard as a global guard provider:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { TenantGuard } from './common/guards/tenant.guard';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
```

**Step 2: Add @SkipTenantCheck() to public endpoints**

Add the decorator to:
- `AuthController.login()` (login must work without auth)
- `AuthController.activateAccount()` (public)
- `AuthController.resetPassword()` (public)
- Any other endpoints that run before authentication

NOTE: TenantGuard already bypasses if `!user` (no auth), but the decorator makes intent explicit.

**Step 3: Verify and commit**

```bash
git add backend/src/app.module.ts backend/src/auth/auth.controller.ts
git commit -m "feat: apply TenantGuard globally with SkipTenantCheck for public endpoints"
```

---

## Phase 6: Frontend

### Task 23: Create Platform Route Group and Layout

**Files:**
- Create: `frontend/src/app/(platform)/layout.tsx`
- Create: `frontend/src/app/(platform)/platform/tenants/page.tsx`
- Create: `frontend/src/app/(platform)/platform/tenants/new/page.tsx`
- Create: `frontend/src/app/(platform)/platform/tenants/[id]/page.tsx`
- Create: `frontend/src/app/(platform)/platform/profile/page.tsx`
- Create: `frontend/src/components/layout/PlatformLayout.tsx`
- Create: `frontend/src/components/layout/PlatformSidebar.tsx`

**Step 1: Create PlatformLayout component**

`frontend/src/components/layout/PlatformLayout.tsx`:
- Similar structure to DashboardLayout but for SUPER_ADMIN
- Only allows SUPER_ADMIN role
- Uses PlatformSidebar instead of regular Sidebar
- If not SUPER_ADMIN, redirect to `/login`

**Step 2: Create PlatformSidebar**

`frontend/src/components/layout/PlatformSidebar.tsx`:
- Brand: "Inventario Platform" or similar
- Nav items: Negocios (/platform/tenants), Mi Perfil (/platform/profile)
- User info section showing SUPER_ADMIN name
- Theme toggle and logout (same as existing Sidebar)

**Step 3: Create route group layout**

`frontend/src/app/(platform)/layout.tsx`:
```tsx
import PlatformLayout from '@/components/layout/PlatformLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PlatformLayout>{children}</PlatformLayout>;
}
```

**Step 4: Create tenant list page**

`frontend/src/app/(platform)/platform/tenants/page.tsx`:
- Table with columns: Nombre, Slug, Estado (Badge), Plan, Admin, Creado, Acciones
- Fetch from `GET /api/platform/tenants`
- Status badges: PENDING_SETUP (yellow), ACTIVE (green), SUSPENDED (red), TRIAL_EXPIRED (gray)
- Actions per row: Ver, Suspender/Reactivar, Reenviar invite, Impersonar

**Step 5: Create tenant creation page**

`frontend/src/app/(platform)/platform/tenants/new/page.tsx`:
- Form: Nombre del negocio, Slug (auto-generated from name, editable), Email admin, Nombre admin, Plan (Select)
- On submit: POST `/api/platform/tenants`
- On success: Show modal with activation link (copy button, "shown once" warning)

**Step 6: Create tenant detail page**

`frontend/src/app/(platform)/platform/tenants/[id]/page.tsx`:
- Tenant info card (name, slug, status, plan, created)
- Admin info card (name, email, status)
- Action buttons: Suspender/Reactivar, Reenviar invite, Reset contrasena, Impersonar
- Each action: ConfirmDialog with mandatory reason field

**Step 7: Create profile page**

`frontend/src/app/(platform)/platform/profile/page.tsx`:
- Reuse existing profile form logic from `/profile/page.tsx`

**Step 8: Commit**

```bash
git add frontend/src/app/\(platform\)/ frontend/src/components/layout/PlatformLayout.tsx frontend/src/components/layout/PlatformSidebar.tsx
git commit -m "feat(frontend): add platform route group and pages for SUPER_ADMIN"
```

---

### Task 24: Create Platform API Hooks

**Files:**
- Create: `frontend/src/hooks/useTenants.ts`
- Create: `frontend/src/hooks/usePlatform.ts`

**Step 1: Create useTenants hook**

```typescript
// Hooks for TanStack Query: useTenants, useTenant, useCreateTenant, 
// useUpdateTenantStatus, useResendInvite, useResetAdminPassword, useImpersonate
```

**Step 2: Create usePlatform hook**

```typescript
// Hooks for impersonation state management
// useImpersonation: start, end, isImpersonating, timeRemaining
```

**Step 3: Commit**

```bash
git add frontend/src/hooks/useTenants.ts frontend/src/hooks/usePlatform.ts
git commit -m "feat(hooks): add tenant management and platform hooks"
```

---

### Task 25: Update Login Page for Multi-Tenant

**Files:**
- Modify: `frontend/src/app/login/page.tsx` (271 lines)

**Step 1: Add tenantSlug field to login form**

Add a text input "Identificador del negocio" after email/password fields:
- Placeholder: "ej: comercial-andina"
- Helper text: "Si eres distribuidor, deja este campo vacio"
- Pass `tenantSlug` to the `login()` function in AuthContext

**Step 2: Update demo credentials section**

Add a SUPER_ADMIN credential button. Update existing buttons to include tenant slug.

**Step 3: Commit**

```bash
git add frontend/src/app/login/page.tsx
git commit -m "feat(login): add tenant slug field for multi-tenant login"
```

---

### Task 26: Update AuthContext for Multi-Tenant

**Files:**
- Modify: `frontend/src/contexts/AuthContext.tsx` (119 lines)

**Step 1: Update User interface (line 15-21)**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  tenantId: string | null;
  tenantName?: string;
  tenantSlug?: string;
  impersonatedBy?: string;
  impersonationExpiresAt?: string;
}
```

**Step 2: Update login() function (lines 65-87)**

Accept `tenantSlug` parameter. Pass it to POST `/auth/login`. After login, redirect based on role:
- SUPER_ADMIN → `/platform/tenants`
- ADMIN/INVENTORY_USER → `/dashboard`
- CASHIER → `/pos`

**Step 3: Add impersonation helpers**

```typescript
const startImpersonation = (impersonationToken: string, originalToken: string) => {
  localStorage.setItem('original_token', originalToken);
  localStorage.setItem('token', impersonationToken);
  queryClient.clear();
  // Re-fetch profile with new token
};

const endImpersonation = async () => {
  await api.post('/platform/impersonation/end');
  const originalToken = localStorage.getItem('original_token');
  localStorage.setItem('token', originalToken);
  localStorage.removeItem('original_token');
  queryClient.clear();
  router.push('/platform/tenants');
};
```

**Step 4: Commit**

```bash
git add frontend/src/contexts/AuthContext.tsx
git commit -m "feat(auth-context): multi-tenant support with impersonation"
```

---

### Task 27: Create Activation and Reset Password Pages

**Files:**
- Create: `frontend/src/app/activate/page.tsx`
- Create: `frontend/src/app/reset-password/page.tsx`

**Step 1: Create /activate page**

- Reads `token` from URL search params
- Shows form: new password + confirm password
- If user is already logged in: show "Close session to continue" message
- On submit: POST `/api/auth/activate` with `{ token, password }`
- Success: redirect to `/login` with success message
- Error: show actionable error message based on error code

**Step 2: Create /reset-password page**

Same pattern as /activate but for password reset.

**Step 3: Commit**

```bash
git add frontend/src/app/activate/ frontend/src/app/reset-password/
git commit -m "feat(frontend): add activation and reset password pages"
```

---

### Task 28: Create Impersonation Banner

**Files:**
- Create: `frontend/src/components/layout/ImpersonationBanner.tsx`
- Modify: `frontend/src/app/layout.tsx` (root layout)

**Step 1: Create ImpersonationBanner component**

```tsx
// Fixed top banner: "Estas viendo como [TenantName] | Tiempo restante: MM:SS | [Salir]"
// Uses impersonationExpiresAt from AuthContext for countdown
// "Salir" calls endImpersonation()
// Auto-exits when timer reaches 0
// Style: bg-amber-500 text-white, z-[9999], fixed top-0
```

**Step 2: Add banner to root layout**

Conditionally render `ImpersonationBanner` when `user.impersonatedBy` is present.

**Step 3: Commit**

```bash
git add frontend/src/components/layout/ImpersonationBanner.tsx frontend/src/app/layout.tsx
git commit -m "feat(frontend): add impersonation banner with countdown"
```

---

### Task 29: Update DashboardLayout and Sidebar for Tenant Context

**Files:**
- Modify: `frontend/src/components/layout/DashboardLayout.tsx` (76 lines)
- Modify: `frontend/src/components/layout/Sidebar.tsx` (260 lines)

**Step 1: Update DashboardLayout routeRoleMap**

- Add `/platform` prefix for SUPER_ADMIN (though platform has its own layout)
- Add SUPER_ADMIN to `/profile` route
- Use `pathname.startsWith(prefix)` instead of exact match

**Step 2: Update DashboardLayout redirect logic**

When SUPER_ADMIN (not impersonating) tries to access dashboard routes, redirect to `/platform/tenants`.

**Step 3: Update Sidebar**

- Show tenant name in the brand section (lines 122-128) instead of hardcoded "Inventario"
- If user is SUPER_ADMIN impersonating, show the tenant name being impersonated
- Add SUPER_ADMIN to role label map: `'SUPER_ADMIN': 'Distribuidor'`

**Step 4: Commit**

```bash
git add frontend/src/components/layout/DashboardLayout.tsx frontend/src/components/layout/Sidebar.tsx
git commit -m "feat(frontend): update layouts for multi-tenant context"
```

---

### Task 30: Update API Client for Tenant Error Handling

**Files:**
- Modify: `frontend/src/lib/api.ts` (167 lines)

**Step 1: Update response interceptor**

In the 401 handler (lines 71-81), also handle:
- `TENANT_SUSPENDED`: redirect to a suspended page or show specific message
- `USER_BLOCKED`: clear auth and redirect to login with message
- `IMPERSONATION_EXPIRED`: end impersonation and redirect to platform

**Step 2: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(api): handle multi-tenant error codes in response interceptor"
```

---

## Phase 7: Audit, Testing, and Cleanup

### Task 31: Update Audit Interceptor

**Files:**
- Modify: `backend/src/common/interceptors/audit.interceptor.ts` (113 lines)

**Step 1: Add tenantId, requestId, IP, and userAgent to audit logs**

Update the `prisma.auditLog.create()` call (around line 92) to include:
- `tenantId: user.tenantId`
- `actorUserId: user.sub`
- `actorRole: user.role`
- `targetTenantId: user.tenantId`
- `requestId: request.requestId`
- `ip: request.ip`
- `userAgent: request.headers['user-agent']`

**Step 2: Commit**

```bash
git add backend/src/common/interceptors/audit.interceptor.ts
git commit -m "feat(audit): add tenant context and request correlation to audit logs"
```

---

### Task 32: End-to-End Testing Checklist

These are manual verification tests to run after all implementation is complete.

**Test 1: SUPER_ADMIN Login**
- Login with empty tenantSlug → should redirect to /platform/tenants
- Verify JWT contains `tenantId: null`

**Test 2: Create Tenant**
- As SUPER_ADMIN, create a new tenant
- Verify tenant appears in list with PENDING_SETUP status
- Verify activation link is shown and copyable

**Test 3: Admin Activation**
- Open activation link in incognito browser
- Set password and submit
- Verify tenant status changes to ACTIVE
- Login as admin with tenantSlug → should work

**Test 4: Tenant Isolation**
- As admin of Tenant A, create a product
- Login as admin of Tenant B
- Verify Tenant B cannot see Tenant A's product

**Test 5: Suspension**
- As SUPER_ADMIN, suspend a tenant
- Verify tenant users can no longer login
- Verify active sessions are rejected with TENANT_SUSPENDED

**Test 6: Impersonation**
- As SUPER_ADMIN, impersonate a tenant
- Verify banner appears with countdown
- Verify can see tenant data
- Click "Salir" → verify returns to platform
- Verify audit log records impersonation

**Test 7: Password Reset**
- As SUPER_ADMIN, reset admin password
- Verify old tokens are invalidated
- Open new reset link → set new password
- Login with new password → should work

**Step 1: Document test results**

Run each test and document pass/fail.

**Step 2: Fix any issues found**

**Step 3: Final commit**

```bash
git add -A
git commit -m "test: verify multi-tenant end-to-end flows"
```

---

## Summary: File Change Map

### New files to CREATE (19):
| File | Purpose |
|------|---------|
| `backend/src/platform/platform.module.ts` | Platform module |
| `backend/src/platform/platform.controller.ts` | SUPER_ADMIN endpoints |
| `backend/src/platform/platform.service.ts` | Tenant management logic |
| `backend/src/platform/dto/create-tenant.dto.ts` | Create tenant DTO |
| `backend/src/platform/dto/update-tenant-status.dto.ts` | Status update DTO |
| `backend/src/platform/dto/impersonate.dto.ts` | Impersonation DTO |
| `backend/src/prisma/tenant-prisma.provider.ts` | Request-scoped tenant Prisma |
| `backend/src/common/guards/tenant.guard.ts` | Tenant/user status guard |
| `backend/src/common/decorators/skip-tenant-check.decorator.ts` | Skip tenant check |
| `backend/src/common/constants/error-codes.ts` | Stable error codes |
| `backend/src/common/middleware/request-id.middleware.ts` | Request correlation |
| `backend/src/common/utils/tenant-raw-query.helper.ts` | Safe raw SQL helper |
| `frontend/src/app/(platform)/layout.tsx` | Platform route layout |
| `frontend/src/app/(platform)/platform/tenants/page.tsx` | Tenant list |
| `frontend/src/app/(platform)/platform/tenants/new/page.tsx` | Create tenant |
| `frontend/src/app/(platform)/platform/tenants/[id]/page.tsx` | Tenant detail |
| `frontend/src/app/activate/page.tsx` | Account activation |
| `frontend/src/app/reset-password/page.tsx` | Password reset |
| `frontend/src/components/layout/ImpersonationBanner.tsx` | Impersonation UI |

### Existing files to MODIFY (20+):
| File | Key Change |
|------|------------|
| `backend/prisma/schema.prisma` | Tenant model, enums, tenantId on all models |
| `backend/prisma/seed.ts` | Multi-tenant seed |
| `backend/src/auth/auth.service.ts` | Login with slug, activate, reset |
| `backend/src/auth/auth.controller.ts` | New public endpoints |
| `backend/src/auth/dto/auth.dto.ts` | New DTOs |
| `backend/src/auth/jwt.strategy.ts` | tenantId in JWT |
| `backend/src/common/decorators/roles.decorator.ts` | SUPER_ADMIN role type |
| `backend/src/prisma/prisma.module.ts` | Export TENANT_PRISMA |
| `backend/src/app.module.ts` | PlatformModule + TenantGuard + middleware |
| `backend/eslint.config.mjs` | $queryRaw restriction |
| `backend/src/products/products.service.ts` | TENANT_PRISMA |
| `backend/src/categories/categories.service.ts` | TENANT_PRISMA |
| `backend/src/customers/customers.service.ts` | TENANT_PRISMA |
| `backend/src/sales/sales.service.ts` | TENANT_PRISMA + sale number |
| `backend/src/reports/reports.service.ts` | TENANT_PRISMA + raw helper |
| `backend/src/settings/settings.service.ts` | TENANT_PRISMA |
| `backend/src/exports/exports.service.ts` | TENANT_PRISMA |
| `backend/src/imports/imports.service.ts` | TENANT_PRISMA |
| `backend/src/common/interceptors/audit.interceptor.ts` | Tenant context |
| `frontend/src/contexts/AuthContext.tsx` | tenantId + impersonation |
| `frontend/src/components/layout/DashboardLayout.tsx` | Route roles |
| `frontend/src/components/layout/Sidebar.tsx` | Tenant name |
| `frontend/src/app/login/page.tsx` | Slug field |
| `frontend/src/lib/api.ts` | Error code handling |
