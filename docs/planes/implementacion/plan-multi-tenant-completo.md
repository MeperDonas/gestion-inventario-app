# Plan — Multi-Tenant Completo (SaaS)

**Proyecto:** Sistema de Gestión de Inventario  
**Modelo:** Single Database, Multi-Tenant (`organizationId`)  
**Onboarding:** Manual por SuperAdmin  
**Acceso:** Selector post-login  
**Pago:** Transferencia manual con seguimiento en panel  
**Planes:** Básico $40.000 COP / Pro $55.000 COP — Trial 15 días  
**Estimación total:** ~5–7 semanas (25–35 días hábiles)  

---

## Correcciones Post-Revisión (v1.1)

Después de un code review profundo del codebase existente, se identificaron los siguientes ajustes críticos que el borrador inicial no contemplaba:

1. **Unicidades globales rompen multi-tenant**: `Category.name`, `Product.sku`, `Product.barcode`, `Customer.documentNumber`, `Sale.saleNumber`, `Supplier.documentNumber`, y `PurchaseOrder.orderNumber` tenían `@unique` o `@@unique` globales. Se corrigieron a `@@unique([organizationId, campo])` para permitir que dos tenants tengan los mismos valores sin colisionar.

2. **`User.role` → `OrganizationUser.role` es un refactor transversal**: No solo es cambiar el schema. El JWT (`auth.service.ts`), el frontend (`AuthContext.tsx`), y el enrutamiento (`DashboardLayout.tsx`) dependen de un rol global único. Se requiere un refactor completo de autenticación y autorización en frontend y backend.

3. **Settings es un singleton global sin `organizationId`**: La tabla `Settings` actual no tiene `organizationId` y `settings.service.ts` la trata como singleton (`findFirst()` sin WHERE). Se unifica TODO en `Organization.settings` (campo JSON), deprecando la tabla `Settings` existente.

4. **Raw SQL (`$queryRaw`) sin aislamiento**: `products.service.ts` y `reports.service.ts` usan `$queryRaw` sin filtrar por `organizationId`. Esto es una fuga de datos crítica. Se establece una estrategia obligatoria para cualquier raw SQL.

5. **`Task` y `TaskEvent` faltaban en el plan**: Ambos modelos no tenían `organizationId`, lo cual generaría fuga de datos entre tenants.

6. **Checklist de seguridad tenía una trampa**: Proponía agregar `organizationId` al DTO de creación. Eso permite que un cliente malicioso cree recursos en otro tenant. El `organizationId` DEBE salir del JWT/request context, NUNCA del body del cliente.

7. **Tablas hijas (`SaleItem`, `Payment`, `PurchaseOrderItem`)**: No necesitan `organizationId` propio porque siempre pertenecen a un padre que ya lo tiene. Excepción: `InventoryMovement` SÍ necesita `organizationId` porque `saleId` es nullable (ajustes manuales).

## Hallazgos de Auditoría del Codebase (v1.2)

Una auditoría exhaustiva de TODO el código (backend + frontend + schema + seed + scripts) reveló ~50 problemas adicionales, ~29 críticos. Los más importantes:

### A. Patrón sistémico: `findUnique({ where: { id } })` sin `organizationId`
**Casi TODOS los services** usan `findUnique({ where: { id } })` para buscar recursos por ID. Esto NO garantiza aislamiento por tenant. Aunque los UUIDs no colisionan, es un riesgo de diseño y no protege contra acceso si alguien adivina un UUID.

**Fix:** Cambiar a `findFirst({ where: { id, organizationId } })` en TODOS los services.

### B. `findUnique` por campos que dejarán de ser @unique
Cuando `Product.sku` deje de ser `@unique` y pase a `@@unique([organizationId, sku])`, todos los `prisma.product.findUnique({ where: { sku } })` del código **ROMPERÁN** en tiempo de ejecución (Prisma no permite `findUnique` en campos no-@unique).

**Archivos afectados:** `products.service.ts`, `imports.service.ts`, `categories.service.ts`, `customers.service.ts`, `suppliers.service.ts`.

**Fix:** Migrar TODOS estos `findUnique` a `findFirst({ where: { sku, organizationId } })`.

### C. Exports y Reports: fuga de datos TOTAL
`ExportsService` (~145 líneas) y `ReportsService` (~560 líneas) **NO FILTRAN POR `organizationId` EN NINGUNA QUERY**.

- Exports: inventory movements, sales, products, customers — todos globales.
- Reports: dashboard KPIs, sales by payment method, sales by category, top selling products, customer statistics, user performance, daily sales — todos globales.

**Fix:** Inyectar `organizationId` en CADA método de ambos services.

### D. Cache de reports sin prefijo de tenant
`ReportsService` usa cache keys como `'dashboard:${startDate}:${endDate}'` **sin `organizationId`**. Org A ve cache de Org B.

**Fix:** `cacheKey = 'dashboard:${organizationId}:${startDate}:${endDate}'`.

### E. `autoincrement()` global: problema legal
`Sale.saleNumber` y `PurchaseOrder.orderNumber` usan `@default(autoincrement())`. En PostgreSQL, esto es **una secuencia global para TODA la tabla**. Si Org A vende #1, #2, #3 y Org B vende #4, Org A ve un gap en sus facturas.

En Colombia, la numeración de facturas/ventas debe ser **consecutiva por emisor**. Si no lo es, hay problemas legales con la DIAN.

**Fix:** Eliminar `autoincrement()`. Calcular `MAX(saleNumber) WHERE organizationId = X + 1` dentro de una transacción serializable. O usar una tabla `OrganizationSequence` con bloqueo pesimista.

### F. Frontend: ~10+ páginas usan `user?.role === 'ADMIN'`
Además de `DashboardLayout` y `Sidebar`, las páginas de `sales`, `purchase-orders`, `suppliers`, `customers`, `inventory`, `reports`, `users`, y `profile` usan comparaciones directas de rol global.

**Fix:** Crear hook `useOrganizationRole()` y reemplazar TODAS las comparaciones.

### G. Users controller permite resetear contraseñas cross-tenant
`UsersController` permite a un ADMIN de Org A resetear la contraseña de un usuario que solo pertenece a Org B (si conoce su ID).

**Fix:** Validar que el `userId` objetivo tenga relación `OrganizationUser` con la `organizationId` del requester, salvo SuperAdmin.

### H. Scripts de bootstrap y validación asumen datos globales
`backend/scripts/phase2-bootstrap.sql` inserta datos sin `organizationId`. `backend/scripts/validate-phase2.mjs` asume IDs hardcodeados globales.

**Fix:** Actualizar o eliminar estos scripts. El seed nuevo debe crear una org primero.

---

## Principios Rectores

1. **Nunca dejamos la app rota**: cada fase debe deployarse sola y funcionar.
2. **Datos existentes = descartables**: no nos atamos con backfills complejos.
3. **Soft limits > Hard limits**: mejor UX, menos frustración, más conversiones.
4. **Seguridad por defecto**: si olvidamos el `organizationId`, la query NO debe devolver datos de otro tenant.
5. **El SuperAdmin NO es un dios omnisciente**: ve métricas agregadas, no entra a cuentas ajenas (sin login-as).
6. **OrganizationId nunca viene del cliente**: siempre del JWT o request context. Solo `/admin/*` puede recibirlo explícito.

---

## Índice de Fases

| Fase | Nombre | Estimación |
|------|--------|------------|
| **Fase 0** | Fundamentos del Tenant | 4–5 días |
| **Fase 1** | Aislamiento de Datos | 5–6 días |
| **Fase 2** | SuperAdmin & Onboarding | 5–6 días |
| **Fase 3** | Límites por Plan & Billing | 3–4 días |
| **Fase 4** | Personalización por Tenant | 2–3 días |
| **Fase 5** | Cloudinary & Assets | 1–2 días |
| **Fase 6** | Data Migration & Cleanup | 1 día |
| **Fase 7** | Testing, Hardening & Documentación | 4–5 días |

---

## Dependencias

```
Fase 0 (Schema + Auth refactor)
  └─► Fase 1 (Aislamiento de datos + raw SQL audit)
        ├─► Fase 2 (SuperAdmin & Onboarding)
        ├─► Fase 3 (Límites & Billing)
        ├─► Fase 4 (Personalización)
        └─► Fase 5 (Cloudinary)
              └─► Fase 6 (Data Migration)
                    └─► Fase 7 (Testing & Docs)
```

---

## FASE 0 — Fundamentos del Tenant

**Objetivo:** Crear el modelo de `Organization`, refactorizar `User` para soportar múltiples organizaciones, y reestructurar autenticación. El sistema todavía funciona como antes (un solo tenant implícito), pero la estructura ya está.

### 0.1 Schema Prisma — Nuevos modelos

```prisma
model Organization {
  id            String             @id @default(uuid())
  name          String
  slug          String             @unique
  logoUrl       String?
  status        OrgStatus          @default(TRIAL)
  plan          PlanType           @default(BASIC)
  trialEndsAt   DateTime?
  billingStatus BillingStatus      @default(PENDING)
  settings      Json?              // { companyName, currency, taxRate, receiptPrefix, printHeader, printFooter, logoUrl }

  users              OrganizationUser[]
  products           Product[]
  categories         Category[]
  customers          Customer[]
  sales              Sale[]
  cashRegisters      CashRegister[]
  shifts             Shift[]
  inventoryMovements InventoryMovement[]
  suppliers          Supplier[]
  purchaseOrders     PurchaseOrder[]
  auditLogs          AuditLog[]
  tasks              Task[]
  taskEvents         TaskEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([plan])
}

model OrganizationUser {
  id             String       @id @default(uuid())
  organizationId String
  userId         String
  role           OrgRole      // ADMIN, CASHIER, INVENTORY_USER
  invitedById    String?
  isPrimaryOwner Boolean      @default(false)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([organizationId, userId])
  @@index([organizationId, role])
}

enum OrgStatus {
  TRIAL
  ACTIVE
  PAST_DUE      // Venció, en solo lectura
  SUSPENDED     // No paga, soft delete
}

enum PlanType {
  BASIC
  PRO
}

enum BillingStatus {
  PENDING
  PAID
  OVERDUE
}

enum OrgRole {
  ADMIN
  CASHIER
  INVENTORY_USER
}

// Modificaciones a User
model User {
  id              String             @id @default(uuid())
  email           String             @unique
  password        String
  name            String
  isSuperAdmin    Boolean            @default(false)
  active          Boolean            @default(true)
  organizations   OrganizationUser[]
  sales           Sale[]
  inventoryMovements InventoryMovement[]
  auditLogs       AuditLog[]
  tasksCreated    Task[]             @relation("TaskCreatedBy")
  tasksAssigned   Task[]             @relation("TaskAssignedTo")
  taskEvents      TaskEvent[]        @relation("TaskEventCreatedBy")
  purchaseOrders  PurchaseOrder[]
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  // NOTA: User.role se elimina. El rol ahora vive en OrganizationUser.role.
}
```

### 0.2 Modificaciones a modelos existentes

**TODOS estos modelos necesitan `organizationId` + `@@index([organizationId])`:**

- `Product`, `Category`, `Customer`, `Sale`, `Supplier`
- `CashRegister`, `Shift`, `CashMovement`
- `InventoryMovement`, `PurchaseOrder`, `AuditLog`
- `Task`, `TaskEvent`

**Tablas hijas que NO necesitan `organizationId` propio** (se deriva del padre):
- `SaleItem` (siempre pertenece a un `Sale`)
- `Payment` (siempre pertenece a un `Sale`)
- `PurchaseOrderItem` (siempre pertenece a un `PurchaseOrder`)

**Excepción — `InventoryMovement` SÍ necesita `organizationId`:**
Porque `saleId` es nullable. Si es un ajuste manual (no venta), no tiene padre con `organizationId`.

**Correcciones de unicidad (por tenant):**

```prisma
model Category {
  id             String    @id @default(uuid())
  name           String
  description    String?
  defaultTaxRate Decimal?  @db.Decimal(5, 2)
  active         Boolean   @default(true)
  products       Product[]
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([organizationId, name])
  @@index([organizationId])
  @@index([organizationId, active])
}

model Product {
  id          String              @id @default(uuid())
  name        String
  sku         String
  barcode     String?
  description String?
  costPrice   Decimal             @db.Decimal(10, 2)
  salePrice   Decimal             @db.Decimal(10, 2)
  taxRate     Decimal             @default(0) @db.Decimal(5, 2)
  stock       Int                 @default(0)
  minStock    Int                 @default(0)
  imageUrl    String?
  categoryId  String
  category    Category            @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  active      Boolean             @default(true)
  version     Int                 @default(0)
  movements   InventoryMovement[]
  saleItems   SaleItem[]
  preferredSupplierId String?
  preferredSupplier   Supplier?           @relation("PreferredSupplier", fields: [preferredSupplierId], references: [id])
  purchaseItems       PurchaseOrderItem[]
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@unique([organizationId, sku])
  @@unique([organizationId, barcode])
  @@index([organizationId])
  @@index([organizationId, active])
}

model Customer {
  id             String          @id @default(uuid())
  name           String
  documentType   String
  documentNumber String
  email          String?
  phone          String?
  address        String?
  segment        CustomerSegment @default(OCCASIONAL)
  active         Boolean         @default(true)
  sales          Sale[]
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@unique([organizationId, documentNumber])
  @@index([organizationId])
  @@index([organizationId, active])
}

model Sale {
  id                 String              @id @default(uuid())
  saleNumber         Int                 @default(autoincrement())
  customerId         String?
  customer           Customer?           @relation(fields: [customerId], references: [id])
  subtotal           Decimal             @db.Decimal(10, 2)
  taxAmount          Decimal             @db.Decimal(10, 2)
  discountAmount     Decimal             @default(0) @db.Decimal(10, 2)
  total              Decimal             @db.Decimal(10, 2)
  amountPaid         Decimal             @db.Decimal(10, 2)
  change             Decimal?            @db.Decimal(10, 2)
  status             SaleStatus          @default(COMPLETED)
  userId             String
  user               User                @relation(fields: [userId], references: [id])
  items              SaleItem[]
  payments           Payment[]
  inventoryMovements InventoryMovement[]
  organizationId     String
  organization       Organization        @relation(fields: [organizationId], references: [id])
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@unique([organizationId, saleNumber])
  @@index([organizationId])
  @@index([organizationId, createdAt, status])
}

model Supplier {
  id             String   @id @default(uuid())
  name           String
  documentNumber String
  email          String?
  phone          String?
  address        String?
  contactName    String?
  active         Boolean  @default(true)
  purchaseOrders PurchaseOrder[]
  preferredBy    Product[]       @relation("PreferredSupplier")
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([organizationId, documentNumber])
  @@index([organizationId])
  @@index([organizationId, active])
  @@index([organizationId, name])
}

model PurchaseOrder {
  id           String              @id @default(uuid())
  orderNumber  Int                 @default(autoincrement())
  supplierId   String
  createdById  String
  status       PurchaseOrderStatus @default(DRAFT)
  subtotal     Decimal             @default(0) @db.Decimal(12, 2)
  taxAmount    Decimal             @default(0) @db.Decimal(12, 2)
  total        Decimal             @default(0) @db.Decimal(12, 2)
  notes        String?
  confirmedAt  DateTime?
  receivedAt   DateTime?
  cancelledAt  DateTime?
  cancelReason String?
  supplier     Supplier            @relation(fields: [supplierId], references: [id])
  createdBy    User                @relation(fields: [createdById], references: [id])
  items        PurchaseOrderItem[]
  organizationId String
  organization   Organization        @relation(fields: [organizationId], references: [id])
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt

  @@unique([organizationId, orderNumber])
  @@index([organizationId])
  @@index([organizationId, status])
  @@index([organizationId, createdAt])
}

model InventoryMovement {
  id             String       @id @default(uuid())
  productId      String
  product        Product      @relation(fields: [productId], references: [id])
  type           MovementType
  quantity       Int
  previousStock  Int
  newStock       Int
  reason         String
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  saleId         String?
  sale           Sale?        @relation(fields: [saleId], references: [id])
  organizationId String       // Necesario porque saleId es nullable
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime     @default(now())

  @@index([organizationId, productId, createdAt])
}

model Task {
  id             String      @id @default(uuid())
  title          String
  description    String?
  status         TaskStatus  @default(PENDING)
  createdById    String
  createdBy      User        @relation("TaskCreatedBy", fields: [createdById], references: [id])
  assignedToId   String?
  assignedTo     User?       @relation("TaskAssignedTo", fields: [assignedToId], references: [id], onDelete: SetNull)
  dueDate        DateTime?
  deletedAt      DateTime?
  events         TaskEvent[]
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([organizationId, status, createdAt])
  @@index([organizationId, assignedToId, status])
  @@index([organizationId, deletedAt])
}

model TaskEvent {
  id             String        @id @default(uuid())
  taskId         String
  task           Task          @relation(fields: [taskId], references: [id], onDelete: Cascade)
  type           TaskEventType
  fromStatus     TaskStatus?
  toStatus       TaskStatus
  note           String?
  createdById    String
  createdBy      User          @relation("TaskEventCreatedBy", fields: [createdById], references: [id])
  organizationId String        // Para aislamiento directo sin JOIN a Task
  organization   Organization  @relation(fields: [organizationId], references: [id])
  createdAt      DateTime      @default(now())

  @@index([organizationId, taskId, createdAt])
  @@index([organizationId, createdById, createdAt])
}

model AuditLog {
  id             String   @id @default(uuid())
  userId         String?
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action         String
  resource       String
  resourceId     String?
  metadata       Json?
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())

  @@index([organizationId, createdAt])
  @@index([organizationId, resource])
}

// NOTA: La tabla Settings existente se DEPRECA.
// Sus campos se migran a Organization.settings (Json).
// Se elimina en una migración futura una vez confirmado que nadie la usa.
```

### 0.3 Deprecación de la tabla `Settings`

La tabla `Settings` actual no tiene `organizationId` y se accede como singleton global (`settings.service.ts:81-98` usa `findFirst()` sin WHERE).

**Decisión:** Deprecar `Settings` y unificar en `Organization.settings` (campo JSON).

**Migración:**
1. Agregar campo `settings Json?` a `Organization`.
2. Copiar los valores de la fila `Settings` existente al `Organization` default.
3. Actualizar `settings.service.ts` para leer/escribir de `Organization.settings`.
4. Marcar `Settings` como deprecated en el schema (no eliminar todavía, por si acaso).

### 0.4 Refactor de Autenticación

**Problema:** Hoy el JWT firma `role` global (`auth.service.ts:68-71`). El frontend usa `user.role` para enrutamiento (`DashboardLayout.tsx:35`). Con multi-tenancy, el rol es por organización.

**Nuevo JWT payload:**
```typescript
interface JwtPayload {
  sub: string;           // userId
  email: string;
  isSuperAdmin: boolean; // true = acceso a /admin/*
  // NO incluimos role global
}
```

**Flujo de selección de organización:**
1. Usuario loguea → backend devuelve JWT con `sub`, `email`, `isSuperAdmin`.
2. Frontend llama `GET /auth/organizations` → devuelve:
   ```typescript
   [{ orgId: string, name: string, role: 'ADMIN' | 'CASHIER' | 'INVENTORY_USER' }]
   ```
3. Si `isSuperAdmin === true` y no hay orgs, redirige a `/admin`.
4. Si hay una sola org, se selecciona automáticamente.
5. Si hay múltiples orgs, muestra selector.
6. Usuario selecciona org → `POST /auth/select-organization` con `organizationId`.
7. Backend emite **nuevo JWT** con:
   ```typescript
   { sub, email, isSuperAdmin, orgId, orgRole }
   ```
8. Todos los requests subsiguientes llevan este JWT.

**Frontend — Refactor de Auth + Organization:**

- `AuthContext`: guarda el usuario base (`id`, `email`, `name`, `isSuperAdmin`, `active`). **NO guarda `role`.**
- `OrganizationContext` (nuevo): guarda la org activa (`orgId`, `name`, `role`, `logoUrl`, `settings`).
- `DashboardLayout`: lee `role` del `OrganizationContext`, no del `AuthContext`.
- `Sidebar`: muestra items según `orgRole` del `OrganizationContext`.
- Si el usuario cambia de org (dropdown), se emite nuevo JWT y se refresca la app.

### 0.5 Middleware de Tenant (Backend)

Crear `TenantGuard` que:
1. Extraiga `orgId` del JWT.
2. Valide que el usuario pertenezca a esa organización (`OrganizationUser` existe).
3. Inyecte `organizationId` en `req.user`.
4. Si `isSuperAdmin = true` y NO hay `orgId`, permita rutas de `/admin/*`.
5. Si no hay `orgId` y no es SuperAdmin → `403 Forbidden`.
6. Si `org.status === PAST_DUE` y el request es mutación → `403` con mensaje "Tu trial expiró".

### 0.6 Helper de Queries (Backend)

Crear `TenantAwareService` base o helper `withOrganization()`:

```typescript
// TODOS los services DEBEN usar esto
protected getOrgWhere(user: AuthenticatedUser) {
  return { organizationId: user.organizationId };
}
```

**Regla de oro:** Si un service hace una query sin `organizationId`, es un bug de seguridad.

### 0.7 Estrategia obligatoria para Raw SQL

Cualquier uso de `prisma.$queryRaw` DEBE incluir `organizationId` en el WHERE:

```typescript
// ANTES (INSEGURO):
return this.prisma.$queryRaw`
  SELECT * FROM "Product" WHERE active = true
`;

// DESPUÉS (SEGURO):
return this.prisma.$queryRaw`
  SELECT * FROM "Product" 
  WHERE active = true AND "organizationId" = ${organizationId}
`;
```

**Regla de equipo:** Si usás `$queryRaw` sin `organizationId`, el PR se rechaza.

### Archivos Fase 0

| Acción | Ruta |
|--------|------|
| [MODIFY] | `backend/prisma/schema.prisma` |
| [CREATE] | `backend/prisma/migrations/...` (migración masiva) |
| [CREATE] | `backend/src/organizations/organizations.module.ts` |
| [CREATE] | `backend/src/organizations/organizations.service.ts` |
| [CREATE] | `backend/src/organizations/organizations.controller.ts` |
| [CREATE] | `backend/src/common/guards/tenant.guard.ts` |
| [CREATE] | `backend/src/common/interfaces/authenticated-user.interface.ts` |
| [MODIFY] | `backend/src/auth/auth.service.ts` (refactor JWT, login, register) |
| [MODIFY] | `backend/src/auth/auth.controller.ts` (nuevos endpoints org) |
| [MODIFY] | `backend/src/auth/jwt.strategy.ts` (extraer orgId) |
| [MODIFY] | `backend/src/settings/settings.service.ts` (usar Organization.settings) |
| [CREATE] | `frontend/src/contexts/OrganizationContext.tsx` |
| [MODIFY] | `frontend/src/contexts/AuthContext.tsx` (quitar role) |
| [CREATE] | `frontend/src/hooks/useOrganizations.ts` |
| [MODIFY] | `frontend/src/lib/api.ts` |
| [MODIFY] | `frontend/src/app/layout.tsx` |
| [MODIFY] | `frontend/src/components/layout/DashboardLayout.tsx` (usar orgRole) |
| [MODIFY] | `frontend/src/components/layout/Sidebar.tsx` (usar orgRole) |

---

## FASE 1 — Aislamiento de Datos

**Objetivo:** TODOS los endpoints existentes filtran por `organizationId`. Ningún raw SQL queda sin aislamiento.

### 1.1 Migración masiva

```bash
npx prisma migrate dev --name add_multi_tenant_organization_id
```

### 1.2 Actualización de TODOS los services — `findUnique` → `findFirst`

**CRÍTICO:** Casi todos los services usan `findUnique({ where: { id } })`. Esto NO garantiza aislamiento. Además, cuando migremos campos como `sku` de `@unique` a `@@unique([organizationId, sku])`, los `findUnique` por esos campos **ROMPERÁN** en runtime.

**Regla de oro:**
- `findUnique({ where: { id } })` → `findFirst({ where: { id, organizationId } })`
- `findUnique({ where: { sku } })` → `findFirst({ where: { sku, organizationId } })`
- `findUnique({ where: { email } })` → `findUnique({ where: { email } })` (User.email sigue siendo global `@unique`)

Cada service debe:
1. Recibir `organizationId` del `AuthenticatedUser`.
2. Agregar `organizationId` al `where` de cada query.
3. Agregar `organizationId` al `data` de cada `create`.
4. **NUNCA** leer `organizationId` del DTO del cliente.

**Services a modificar (todos):**
- `ProductsService`, `CategoriesService`, `SalesService`, `CustomersService`
- `InventoryMovementService`, `ReportsService`, `ExportsService`
- `CloudinaryService`, `AuthService`, `SuppliersService`, `PurchaseOrdersService`
- `CashRegistersService`, `ShiftsService`, `TasksService`, `UsersService`

**Ejemplo de patrón:**
```typescript
// ANTES (inseguro):
return this.prisma.product.findUnique({ where: { id } });

// DESPUÉS (seguro):
return this.prisma.product.findFirst({
  where: { id, organizationId: user.organizationId }
});

// ANTES (romperá al quitar @unique de sku):
return this.prisma.product.findUnique({ where: { sku } });

// DESPUÉS:
return this.prisma.product.findFirst({
  where: { sku, organizationId: user.organizationId }
});
```

### 1.3 Raw SQL auditado

Buscar TODOS los `$queryRaw` en el proyecto y asegurar que filtran por `organizationId`:

- `backend/src/products/products.service.ts:270` (`getLowStockProducts`)
- `backend/src/reports/reports.service.ts:268` (dashboard count de low stock)
- Cualquier otro `$queryRaw` que encuentre el auditor

**Si no puede filtrarse por `organizationId` (raro), convertir a Prisma ORM.**

### 1.4 Exports y Reports — fuga de datos total

`ExportsService` y `ReportsService` **NO FILTRAN POR `organizationId` EN NINGUNA QUERY**.

**Exports a corregir:**
- `getInventoryMovements`
- `exportSales` / `getSalesData`
- `exportProducts` / `getProductsData`
- `exportCustomers` / `getCustomersData`
- `exportInventory` / `getInventoryData`

**Reports a corregir:**
- `getDashboardKPIs`
- `getSalesByPaymentMethod`
- `getSalesByCategory`
- `getTopSellingProducts`
- `getCustomerStatistics`
- `getUserPerformance`
- `getDailySales`

**Cache de reports:**
- `cacheKey = 'dashboard:${startDate}:${endDate}'` → `cacheKey = 'dashboard:${organizationId}:${startDate}:${endDate}'`

### 1.5 Secuencias por tenant (`autoincrement()`)

`Sale.saleNumber` y `PurchaseOrder.orderNumber` usan `@default(autoincrement())` que es **global** en PostgreSQL.

**Opciones:**

**Opción A (recomendada):** Tabla de secuencias por tenant
```prisma
model OrganizationSequence {
  id             String @id @default(uuid())
  organizationId String @unique
  saleNumber     Int    @default(0)
  orderNumber    Int    @default(0)
}

// Al crear venta:
const seq = await tx.organizationSequence.update({
  where: { organizationId },
  data: { saleNumber: { increment: 1 } },
});
const saleNumber = seq.saleNumber;
```

**Opción B:** Calcular `MAX()` en transacción serializable
```typescript
const max = await tx.sale.aggregate({
  where: { organizationId },
  _max: { saleNumber: true },
});
const saleNumber = (max._max.saleNumber ?? 0) + 1;
```

**Decisión:** Usar Opción A (`OrganizationSequence`) porque es más segura concurrentemente y mantiene la consecutividad legal.

### 1.6 Users controller — validar cross-tenant

`UsersController` permite resetear contraseñas, toggle active, y eliminar usuarios por ID sin validar que el usuario objetivo pertenezca a la misma organización.

**Fix:** En cada operación sobre otro usuario, validar:
```typescript
const targetOrgUser = await prisma.organizationUser.findFirst({
  where: { userId: targetUserId, organizationId: requesterOrgId }
});
if (!targetOrgUser) throw new NotFoundException();
```

### 1.4 Seed de tenant default

Como los datos actuales son de prueba:
1. Borrar base de datos (opcional, recomendado).
2. Correr migraciones limpias.
3. Seed que cree:
   - SuperAdmin (`isSuperAdmin: true`).
   - Nada más. Todo se crea desde el panel admin.

### 1.5 Validación de aislamiento

Test E2E que:
1. Cree dos organizaciones.
2. Cree un producto en cada una.
3. Verifique que el cajero de Org A NO puede ver el producto de Org B (404).
4. Verifique que no puede modificar, eliminar, ni listar recursos de Org B.

### Archivos Fase 1

| Acción | Ruta |
|--------|------|
| [MODIFY] | `backend/src/*/*.service.ts` (TODOS — findUnique → findFirst) |
| [MODIFY] | `backend/src/*/*.controller.ts` |
| [MODIFY] | `backend/src/products/products.service.ts` (raw SQL + findFirst) |
| [MODIFY] | `backend/src/reports/reports.service.ts` (raw SQL + org filter + cache key) |
| [MODIFY] | `backend/src/exports/exports.service.ts` (org filter en TODOS los métodos) |
| [MODIFY] | `backend/src/users/users.controller.ts` (validar cross-tenant) |
| [MODIFY] | `backend/src/users/users.service.ts` (validar cross-tenant) |
| [MODIFY] | `backend/src/sales/sales.service.ts` (secuencia por tenant) |
| [MODIFY] | `backend/src/purchase-orders/purchase-orders.service.ts` (secuencia por tenant) |
| [CREATE] | `backend/src/common/sequences/sequence.service.ts` (helper para saleNumber/orderNumber) |
| [CREATE] | `backend/prisma/migrations/...` |
| [CREATE] | `backend/test/e2e/tenant-isolation.e2e-spec.ts` |

---

## FASE 2 — SuperAdmin & Onboarding

**Objetivo:** El SuperAdmin puede crear organizaciones, asignarles un admin inicial, ver métricas globales, y gestionar el estado de cada tenant.

### 2.1 Panel SuperAdmin — Backend

**Nuevos endpoints (solo `isSuperAdmin`):**

```
POST   /admin/organizations              → Crear org + admin
GET    /admin/organizations              → Listar todas las orgs
GET    /admin/organizations/:id          → Detalle de org
PATCH  /admin/organizations/:id/status   → Cambiar status
PATCH  /admin/organizations/:id/plan     → Cambiar plan
GET    /admin/metrics                    → Dashboard métricas
GET    /admin/billing/:orgId/history     → Historial de pagos
POST   /admin/billing/:orgId/payment     → Registrar pago manual
```

### 2.2 Panel SuperAdmin — Frontend

**Nueva página:** `/admin` (solo accesible si `isSuperAdmin`)

**Secciones:**
1. **Dashboard**: negocios activos, en trial, suspendidos, MRR, trials expirando.
2. **Lista de Organizaciones**: tabla con filtros, acciones de editar/suspender.
3. **Detalle de Organización**: info, usuarios, historial de pagos, registrar pago.
4. **Crear Organización**: form con nombre, plan, datos del admin.

### 2.3 Flujo de creación manual

```typescript
// SuperAdmin crea:
POST /admin/organizations
{
  "name": "Cafetería Juan",
  "plan": "BASIC",
  "admin": {
    "name": "Juan Pérez",
    "email": "juan@cafeteria.com"
  }
}

// Backend:
// 1. Crea Organization (genera slug automáticamente)
// 2. Genera contraseña temporal segura
// 3. Crea User con email + hash(pass)
// 4. Crea OrganizationUser (role: ADMIN, isPrimaryOwner: true)
// 5. Crea CashRegister default "Caja Principal" para la org
// 6. Retorna: org + admin creds (contraseña en texto plano UNA sola vez)
```

### 2.4 Métricas del Dashboard

```typescript
{
  "totalOrganizations": 45,
  "activeTrials": 8,
  "activePaid": 32,
  "suspended": 5,
  "mrr": 1760000,
  "trialsExpiringSoon": 3,
  "newThisMonth": 6
}
```

### Archivos Fase 2

| Acción | Ruta |
|--------|------|
| [CREATE] | `backend/src/admin/admin.module.ts` |
| [CREATE] | `backend/src/admin/admin.controller.ts` |
| [CREATE] | `backend/src/admin/admin.service.ts` |
| [CREATE] | `backend/src/admin/dto/create-organization.dto.ts` |
| [CREATE] | `backend/src/admin/dto/register-payment.dto.ts` |
| [CREATE] | `backend/src/admin/dto/update-organization-status.dto.ts` |
| [MODIFY] | `backend/src/app.module.ts` |
| [CREATE] | `frontend/src/app/admin/page.tsx` |
| [CREATE] | `frontend/src/app/admin/organizations/page.tsx` |
| [CREATE] | `frontend/src/app/admin/organizations/[id]/page.tsx` |
| [CREATE] | `frontend/src/components/admin/CreateOrganizationModal.tsx` |
| [CREATE] | `frontend/src/components/admin/RegisterPaymentModal.tsx` |
| [CREATE] | `frontend/src/components/admin/MetricsCards.tsx` |
| [CREATE] | `frontend/src/components/admin/OrganizationsTable.tsx` |
| [CREATE] | `frontend/src/hooks/useAdmin.ts` |

---

## FASE 3 — Límites por Plan & Billing

**Objetivo:** Cada plan tiene límites. Si te pasás, ves un banner, no un error 403.

### 3.1 Límites por plan

```typescript
const PLAN_LIMITS = {
  BASIC: {
    maxCashRegisters: 1,
    maxUsers: 3,
    maxProducts: 500,
    hasAdvancedReports: false,
    hasForceClose: false,
  },
  PRO: {
    maxCashRegisters: 3,
    maxUsers: 10,
    maxProducts: 5000,
    hasAdvancedReports: true,
    hasForceClose: true,
  },
};
```

### 3.2 Soft limits (no bloqueo duro)

**Backend:**
```typescript
// Dentro de CashRegistersService.create()
const count = await this.prisma.cashRegister.count({
  where: { organizationId }
});
if (count >= PLAN_LIMITS[org.plan].maxCashRegisters) {
  return {
    success: true,
    warning: 'PLAN_LIMIT_REACHED',
    limit: PLAN_LIMITS[org.plan].maxCashRegisters
  };
}
```

**Frontend:** muestra banner "Pásate al Pro" con link a `/settings/billing`.

### 3.3 Gestión de Trial

- Verificación periódica de `trialEndsAt`.
- Si expira → `PAST_DUE` (solo lectura permitida).
- Si `PAST_DUE` > 15 días → `SUSPENDED`.
- En `TenantGuard`: si `PAST_DUE` + mutación → `403` con mensaje "Tu trial expiró. Contacta al administrador."

### 3.4 Seguimiento de pagos manuales

```prisma
model PaymentRecord {
  id             String   @id @default(uuid())
  organizationId String
  amount         Decimal  @db.Decimal(12, 2)
  periodStart    DateTime
  periodEnd      DateTime
  notes          String?
  registeredById String
  createdAt      DateTime @default(now())

  @@index([organizationId])
}
```

### Archivos Fase 3

| Acción | Ruta |
|--------|------|
| [CREATE] | `backend/src/common/constants/plan-limits.ts` |
| [CREATE] | `backend/src/common/guards/plan-limit.guard.ts` |
| [CREATE] | `backend/src/billing/billing.module.ts` |
| [CREATE] | `backend/src/billing/billing.service.ts` |
| [MODIFY] | `backend/prisma/schema.prisma` (PaymentRecord) |
| [CREATE] | `frontend/src/components/ui/PlanLimitBanner.tsx` |
| [CREATE] | `frontend/src/app/settings/billing/page.tsx` |
| [CREATE] | `frontend/src/hooks/useBilling.ts` |

---

## FASE 4 — Personalización por Tenant

**Objetivo:** Logo del negocio e impuestos configurables.

### 4.1 Logo del negocio

- Campo `logoUrl` en `Organization` (ya existe).
- Subida vía Cloudinary a `/organizations/{orgId}/logo.png`.
- Se muestra en Sidebar (arriba del menú), POS header, y factura.

### 4.2 Impuestos configurables

**Fuente única de verdad:** `Organization.settings.taxRate` (JSON).

**Lógica de cálculo:**
```typescript
function getTaxRate(product, category, orgSettings): number {
  return category.defaultTaxRate ?? orgSettings.taxRate ?? 0;
}
```

**Configuración en UI:**
- Settings del negocio: input "Impuesto por defecto (%)" (modifica `Organization.settings.taxRate`).
- En categorías: input "Impuesto específico" (modifica `Category.defaultTaxRate`). Placeholder dice "Usar global".

### Archivos Fase 4

| Acción | Ruta |
|--------|------|
| [MODIFY] | `backend/src/settings/settings.service.ts` (leer Organization.settings) |
| [MODIFY] | `backend/src/categories/categories.service.ts` |
| [MODIFY] | `backend/src/products/products.service.ts` (calcular tax) |
| [MODIFY] | `frontend/src/app/settings/page.tsx` |
| [MODIFY] | `frontend/src/components/categories/CategoryForm.tsx` |
| [MODIFY] | `frontend/src/components/layout/Sidebar.tsx` |

---

## FASE 5 — Cloudinary & Assets

**Objetivo:** Todas las imágenes viven en carpetas por tenant.

### 5.1 Estructura de carpetas

```
/organizations/
  {orgId}/
    products/
    users/
    logo/
```

### 5.2 Refactor de subida

```typescript
async upload(file: Buffer, folder: string, organizationId: string) {
  const path = `organizations/${organizationId}/${folder}`;
  return cloudinary.uploader.upload(file, { folder: path });
}
```

### 5.3 Migración de imágenes existentes

Como datos de prueba: borrar y regenerar con nuevo path. Si se preservan: descargar, re-subir, actualizar URLs.

### Archivos Fase 5

| Acción | Ruta |
|--------|------|
| [MODIFY] | `backend/src/cloudinary/cloudinary.service.ts` |
| [MODIFY] | `backend/src/products/products.service.ts` |
| [MODIFY] | `backend/src/auth/users.service.ts` |

---

## FASE 6 — Data Migration & Cleanup

**Objetivo:** Limpiar datos de prueba y dejar el sistema listo para negocios reales.

### 6.1 Opción recomendada: Reset completo

1. Borrar base de datos.
2. Correr migraciones limpias.
3. Seed que cree solo el SuperAdmin.

### 6.2 Seed nuevo

```typescript
async function main() {
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@sistema.com',
      password: await hash('temporal123'),
      name: 'Super Admin',
      isSuperAdmin: true,
    },
  });
  console.log('SuperAdmin creado:', superAdmin.email);
  console.log('Contraseña temporal: temporal123');
  console.log('CAMBIAR ESTA CONTRASEÑA EN EL PRIMER LOGIN.');
}
```

### Archivos Fase 6

| Acción | Ruta |
|--------|------|
| [MODIFY] | `backend/prisma/seed.ts` (crear org + SuperAdmin) |
| [MODIFY] | `backend/scripts/phase2-bootstrap.sql` (agregar orgId o eliminar) |
| [MODIFY] | `backend/scripts/validate-phase2.mjs` (parametrizar org o eliminar) |
| [CREATE] | `backend/scripts/reset-tenant-data.ts` (opcional) |

---

## FASE 7 — Testing, Hardening & Documentación

**Objetivo:** Que esto no se rompa nunca. Que un bug de aislamiento sea imposible.

### 7.1 Tests E2E de aislamiento

```typescript
describe('Multi-tenant isolation', () => {
  it('userA cannot read products of orgB', async () => {
    const productB = await createProduct(orgB.id);
    const res = await request(app)
      .get(`/products/${productB.id}`)
      .set('Authorization', `Bearer ${jwtA}`);
    expect(res.status).toBe(404);
  });

  it('userA cannot list products of orgB', async () => {
    await createProduct(orgB.id);
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${jwtA}`);
    expect(res.body.data).toHaveLength(0); // o no incluir el producto de orgB
  });

  it('userA cannot modify a customer of orgB', async () => {
    const customerB = await createCustomer(orgB.id);
    const res = await request(app)
      .patch(`/customers/${customerB.id}`)
      .set('Authorization', `Bearer ${jwtA}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(404);
  });
});
```

**Regla de oro:** Si no existe para ese tenant → **404**, no 403. El 403 revela que el recurso existe.

### 7.2 Tests de límites de plan

```typescript
it('BASIC plan shows warning when creating more than 1 cash register', async () => {
  await createCashRegister(orgBasic.id); // 1ra
  const res = await createCashRegister(orgBasic.id); // 2da
  expect(res.body.warning).toBe('PLAN_LIMIT_REACHED');
  expect(res.status).toBe(200); // No es error, es soft limit
});
```

### 7.3 Tests de trial expirado

```typescript
it('past due organization cannot create sales', async () => {
  const res = await request(app)
    .post('/sales')
    .set('Authorization', `Bearer ${jwtPastDue}`)
    .send({...});
  expect(res.status).toBe(403);
  expect(res.body.message).toContain('trial expiró');
});

it('past due organization CAN read existing sales', async () => {
  const res = await request(app)
    .get('/sales')
    .set('Authorization', `Bearer ${jwtPastDue}`);
  expect(res.status).toBe(200); // Solo lectura permitida
});
```

### 7.4 Tests de seguridad — OrganizationId en DTO

```typescript
it('ignores organizationId sent by client in POST body', async () => {
  const res = await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${jwtOrgA}`)
    .send({ name: 'Hacked', organizationId: orgB.id });
  
  const product = await prisma.product.findUnique({ where: { id: res.body.id } });
  expect(product.organizationId).toBe(orgA.id); // Usa la del JWT, no la del body
});
```

### 7.5 Documentación

Crear:
- `docs/architecture/MULTI_TENANT.md` — decisiones, modelo de datos, cómo agregar recursos.
- `docs/runbooks/crear-tenant-manual.md` — paso a paso para crear un negocio nuevo.
- `docs/security/CHECKLIST_NUEVO_RECURSO.md` — checklist para cada nuevo modelo.

### 7.6 Checklist de seguridad para cada nuevo recurso

Cuando agregues un nuevo modelo en el futuro, DEBES:

1. [ ] Agregar `organizationId String` al modelo
2. [ ] Agregar `organization Organization @relation(...)`
3. [ ] Agregar `@@index([organizationId])`
4. [ ] **NUNCA** agregar `organizationId` al DTO de creación del cliente
5. [ ] En el controller: extraer `organizationId` del JWT/request context
6. [ ] En el service: recibir `organizationId` como parámetro separado del DTO
7. [ ] Filtrar por `organizationId` en el `service.findAll()`
8. [ ] Validar pertenencia en el `service.findOne()` usando `findFirst({ where: { id, organizationId } })` — **NO** `findUnique({ where: { id } })`
9. [ ] En `service.create()`: usar `organizationId` del contexto, NUNCA del DTO
10. [ ] Si usás `$queryRaw`, incluir `organizationId` en el WHERE
11. [ ] Si el campo tenía `@unique` y ahora es `@@unique([organizationId, campo])`, migrar TODOS los `findUnique` por ese campo a `findFirst`
12. [ ] Probar que usuario de Org A no ve el recurso de Org B

**Si falta UNO, tenés un bug de seguridad.**

### Archivos Fase 7

| Acción | Ruta |
|--------|------|
| [CREATE] | `backend/test/e2e/tenant-isolation.e2e-spec.ts` |
| [CREATE] | `backend/test/e2e/plan-limits.e2e-spec.ts` |
| [CREATE] | `backend/test/e2e/trial-management.e2e-spec.ts` |
| [CREATE] | `backend/test/e2e/dto-security.e2e-spec.ts` |
| [CREATE] | `docs/architecture/MULTI_TENANT.md` |
| [CREATE] | `docs/runbooks/crear-tenant-manual.md` |
| [CREATE] | `docs/security/CHECKLIST_NUEVO_RECURSO.md` |

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Olvidar `organizationId` en un endpoint | **CRÍTICO** — fuga de datos | Checklist obligatorio en PR. Test E2E de aislamiento. |
| Query sin índice en `organizationId` | Alto — performance | Agregar `@@index([organizationId])` en TODOS los modelos. |
| Usuario sin org seleccionada | Medio — 403 constantes | Frontend obliga a seleccionar org antes de mostrar dashboard. |
| Trial expira y usuario no entiende por qué | Medio — churn | Banner claro en UI: "Tu trial expiró. Contacta a tu proveedor." |
| SuperAdmin crea org con email existente | Medio — conflicto | Validar: si el email ya existe, asignar ese usuario a la nueva org. |
| Raw SQL sin `organizationId` | **CRÍTICO** — fuga de datos | Linter/regla de equipo: `$queryRaw` SIN orgId = PR rechazado. |
| Cliente envía `organizationId` en body | **CRÍTICO** — creación en otro tenant | NUNCA leer orgId del DTO. Siempre del JWT. Test E2E específico. |
| `User.role` todavía se usa en algún lado | Medio — comportamiento inconsistente | Buscar TODOS los usos de `user.role` y migrar a `OrganizationUser.role`. |
| `findUnique` por ID sin org | **CRÍTICO** — acceso cross-tenant | Cambiar TODOS a `findFirst({ where: { id, organizationId } })`. |
| Exports/Reports sin filtro de org | **CRÍTICO** — fuga total de datos | Auditar ExportsService y ReportsService línea por línea. |
| Cache de reports cross-tenant | Alto — datos mezclados | Prefijar cache keys con `organizationId`. |
| `autoincrement()` global | Alto — problema legal | Usar `OrganizationSequence` para numeración consecutiva por tenant. |
| Scripts de bootstrap/validación | Medio — CI/CD roto | Actualizar `phase2-bootstrap.sql` y `validate-phase2.mjs`. |

---

## Resumen de Archivos (estimado)

- **Nuevos archivos backend:** ~32
- **Nuevos archivos frontend:** ~20
- **Archivos modificados:** ~45+ (services, controllers, schema, seed, contexts, scripts)
- **Tests nuevos:** 4 suites E2E
- **Documentación:** 3 archivos

**Total: ~25–35 días hábiles (~5–7 semanas)**

---

*Documento generado el 2026-04-21.*  
*Última actualización: v1.2 — Correcciones post-revisión de codebase + auditoría exhaustiva (findUnique→findFirst, autoincrement global, exports/reports cross-tenant, cache keys, scripts de bootstrap).*

## Apéndice A — Lista de archivos del codebase auditados

El siguiente listado representa los archivos que fueron efectivamente leídos y auditados para producir este plan:

**Backend:**
- `backend/prisma/schema.prisma`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/common/guards/roles.guard.ts`
- `backend/src/common/guards/jwt-auth.guard.ts`
- `backend/src/products/products.service.ts`
- `backend/src/products/products.controller.ts`
- `backend/src/sales/sales.service.ts`
- `backend/src/sales/sales.controller.ts`
- `backend/src/customers/customers.service.ts`
- `backend/src/customers/customers.controller.ts`
- `backend/src/categories/categories.service.ts`
- `backend/src/categories/categories.controller.ts`
- `backend/src/suppliers/suppliers.service.ts`
- `backend/src/suppliers/suppliers.controller.ts`
- `backend/src/purchase-orders/purchase-orders.service.ts`
- `backend/src/purchase-orders/purchase-orders.controller.ts`
- `backend/src/settings/settings.service.ts`
- `backend/src/settings/settings.controller.ts`
- `backend/src/exports/exports.service.ts`
- `backend/src/reports/reports.service.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/users.controller.ts`
- `backend/src/tasks/tasks.service.ts`
- `backend/src/tasks/tasks.controller.ts`
- `backend/src/cloudinary/cloudinary.service.ts`
- `backend/src/main.ts`
- `backend/src/app.controller.ts`
- `backend/prisma/seed.ts`
- `backend/scripts/phase2-bootstrap.sql`
- `backend/scripts/validate-phase2.mjs`

**Frontend:**
- `frontend/src/lib/api.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/components/layout/DashboardLayout.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/app/users/page.tsx`
- `frontend/src/app/sales/page.tsx`
- `frontend/src/app/purchase-orders/page.tsx`
- `frontend/src/app/purchase-orders/[id]/page.tsx`
- `frontend/src/app/suppliers/page.tsx`
- `frontend/src/app/customers/page.tsx`
- `frontend/src/app/inventory/page.tsx`
- `frontend/src/app/profile/page.tsx`
- `frontend/src/app/reports/page.tsx`
- `frontend/src/app/settings/page.tsx`
