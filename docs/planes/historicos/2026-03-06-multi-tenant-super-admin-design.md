# Multi-Tenant + SUPER_ADMIN Design

**Fecha**: 2026-03-06
**Estado**: Aprobado
**Enfoque**: Prisma Client Extensions (Enfoque B) con endurecimiento de seguridad

## Resumen

Transformar el sistema single-tenant actual en una plataforma multi-tenant donde un SUPER_ADMIN (distribuidor del software) puede crear y gestionar negocios (tenants), cada uno con su propio admin que crea cajeros e inventaristas internamente.

## Decisiones Clave

| Decision | Eleccion |
|----------|----------|
| Modelo de despliegue | Multi-tenant centralizado (una BD, multiples negocios) |
| Aislamiento de datos | Columna `tenantId` en cada tabla + Prisma Extensions |
| Panel del distribuidor | Dentro de la misma app (rol SUPER_ADMIN) |
| Filtrado de queries | Prisma Client `$extends()` request-scoped (Enfoque B) |
| Creacion del SUPER_ADMIN | Seed script con env vars obligatorias |
| Entrega de invitaciones | Link copiable manualmente (sin servicio de email) |
| Login multi-tenant | Email + contrasena + slug del negocio |
| Planes de negocio | Campo informativo sin logica funcional |
| Nombre de usuario | Se mantiene campo unico `name` |

---

## Seccion 1: Modelo de Datos (Prisma Schema)

### Cambios al enum Role

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  CASHIER
  INVENTORY_USER
}
```

### Nuevos enums

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

### Nuevo modelo Tenant

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

### Nuevo modelo InviteToken

```prisma
model InviteToken {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id])
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

### Nuevo modelo ImpersonationSession

```prisma
model ImpersonationSession {
  id              String    @id @default(uuid())
  superAdminId    String
  targetTenantId  String
  targetUserId    String
  reason          String
  revokedAt       DateTime?
  expiresAt       DateTime
  createdAt       DateTime  @default(now())

  @@index([id, revokedAt])
}
```

### Cambios al modelo User

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

  tenantId           String?
  tenant             Tenant?    @relation(fields: [tenantId], references: [id])

  inviteTokens       InviteToken[]
  // ... demas relaciones existentes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, email])
}
```

Unicidad de email para SUPER_ADMIN (indice parcial en migracion SQL manual):

```sql
CREATE UNIQUE INDEX "User_email_superadmin_unique"
ON "User" (email) WHERE "tenantId" IS NULL;
```

### Cambios a modelos de negocio

Se agrega a Product, Category, Customer, Sale, SaleItem, InventoryMovement, Settings:

```prisma
tenantId  String
tenant    Tenant @relation(fields: [tenantId], references: [id])
@@index([tenantId])
```

### AuditLog ampliado

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
  createdAt      DateTime @default(now())

  @@index([requestId])
  @@index([actorUserId])
  @@index([targetTenantId])
  @@index([action])
}
```

---

## Seccion 2: Arquitectura Backend (NestJS)

### Nuevo modulo `platform/` (solo SUPER_ADMIN)

```
backend/src/platform/
  platform.module.ts
  platform.controller.ts
  platform.service.ts
  dto/
    create-tenant.dto.ts
    update-tenant-status.dto.ts
    impersonate.dto.ts
```

### Endpoints del modulo platform

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/api/platform/tenants` | Crear tenant + admin inicial |
| `GET` | `/api/platform/tenants` | Listar todos los tenants |
| `GET` | `/api/platform/tenants/:id` | Detalle de un tenant |
| `PATCH` | `/api/platform/tenants/:id/status` | Suspender/reactivar tenant |
| `POST` | `/api/platform/tenants/:id/resend-invite` | Reenviar link de activacion |
| `POST` | `/api/platform/admins/:userId/reset-password` | Forzar reset contrasena del admin |
| `POST` | `/api/platform/tenants/:id/impersonate` | Impersonar (JWT temporal) |
| `POST` | `/api/platform/impersonation/end` | Salir de impersonacion |

Todos protegidos con `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(Role.SUPER_ADMIN)`.

### Endpoints auth publicos nuevos

| Metodo | Endpoint | Descripcion | Proteccion |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/activate` | Activar cuenta con token + nueva contrasena | Publico |
| `POST` | `/api/auth/reset-password` | Resetear contrasena con token | Publico |

### Endurecimiento 1: tenantId desde request.user

El JwtStrategy ya popula req.user con `{ sub, email, role, tenantId }`. No se parsea el JWT dos veces.

### Endurecimiento 2: Provider request-scoped TENANT_PRISMA

Services de negocio NUNCA importan PrismaService directamente. Consumen TENANT_PRISMA que ya viene filtrado. SUPER_ADMIN bypassa el filtro.

### Endurecimiento 3: Cobertura completa en $extends

Operaciones cubiertas: findFirst, findMany, findUnique, count, aggregate, groupBy, create, createMany, update, updateMany, delete, deleteMany, upsert.

### Endurecimiento 4: findUnique con compound unique

Usar compound unique con tenantId o convertir a findFirst controlado.

### Endurecimiento 5: TenantGuard ampliado

Valida Tenant.status + User.status. Soporta @SkipTenantCheck() para endpoints exentos.

### Endurecimiento 6: Bloqueo de $queryRaw por ESLint + CI

### Endurecimiento 7: Roles como enum, no strings

### Endurecimiento 8: Codigos de error estables (ErrorCode enum)

### Endurecimiento 9: JWT de impersonacion con jti + ImpersonationSession

### Endurecimiento 10: Auditoria con requestId/correlationId

---

## Seccion 3: Frontend (Next.js)

### Estructura de rutas

```
frontend/src/app/
  (auth)/
    login/page.tsx
    activate/page.tsx
    reset-password/page.tsx
  (platform)/
    layout.tsx
    platform/
      tenants/
        page.tsx
        new/page.tsx
        [id]/page.tsx
      profile/page.tsx
  (dashboard)/
    layout.tsx
    dashboard/page.tsx
    pos/page.tsx
    # ... resto sin cambios
```

### Login multi-tenant

Email + Contrasena + Slug del negocio. SUPER_ADMIN deja slug vacio.

### AuthContext

impersonationExpiresAt como ISO string. queryClient.clear() al impersonar/salir.

### Link de activacion como secreto

Mostrar UNA sola vez en modal. Boton copiar. No persistir.

### Confirmacion + motivo en acciones criticas

### Banner de impersonacion con countdown real

### Errores de dominio con mensajes accionables

---

## Seccion 4: Seed, Migracion y Flujos

### Seed produccion

Env vars obligatorias: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD. findFirst + create (no upsert).

### Migracion expand/backfill/contract

3 pasos para evitar locks en tablas grandes.

### Flujos end-to-end

- Onboarding: SUPER_ADMIN crea tenant -> link copiable -> admin activa -> login normal
- Reset: SUPER_ADMIN dispara reset -> link -> admin define nueva contrasena
- Impersonacion: JWT con jti + 15min + motivo + auditoria + revocacion real
- Suspension: Tenant.status = SUSPENDED -> bloqueo inmediato

---

## Seccion 5: Criterios de Aceptacion

### Seguridad
- Tokens SHA-256, one-time, TTL (24h/30min)
- Activacion atomica (race condition protection)
- $queryRaw bloqueado por ESLint
- Impersonacion con jti + revocacion

### Funcionalidad
- Login con slug
- CRUD de tenants por SUPER_ADMIN
- Activacion por link
- Suspension bloquea login + operaciones

### Aislamiento
- TENANT_PRISMA request-scoped
- findUnique con compound unique
- Cache cleanup al cambiar contexto

### Auditoria
- requestId en cada request
- Acciones criticas auditadas con actor, tenant, IP, razon
