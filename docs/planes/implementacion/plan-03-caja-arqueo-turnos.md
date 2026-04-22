# Plan 03 — Caja / Arqueo / Turnos

_Duración estimada: ~3 semanas · 29 archivos (22 nuevos + 7 modificados) · 2 migraciones_

> [!IMPORTANT]
> **Principio rector:** Cada fase debe dejar la aplicación funcional al terminar.
> La Fase A puede desplegarse sin tocar el flujo de ventas. La Fase B modifica POS y es el cambio de mayor riesgo — se despliega primero en un entorno de staging.

---

## 1. Contexto y motivación

El sistema actual permite que cualquier cajero registre ventas en cualquier momento, sin declarar cuánto dinero tenía la caja al abrir ni cuánto debe tener al cerrar. Esto produce tres problemas auditables concretos:

1. **Sin accountability por turno**: si hay un faltante al final del día, no hay forma de saber qué cajero lo generó ni en qué momento ocurrió.
2. **Sin control de movimientos manuales**: ingresos de efectivo que no son ventas (ej. préstamos, fondos de cambio) y retiros (ej. pago de servicios desde la caja) quedan completamente fuera del sistema.
3. **Discrepancias sin evidencia**: el arqueo se hace en papel o de memoria. No queda trazabilidad de cuándo se abrió la caja, cuánto había, qué se vendió en efectivo y qué quedó al cerrar.

La solución es el módulo **Caja / Arqueo / Turnos**: un conjunto de modelos y endpoints que formalizan el ciclo de vida de cada jornada de caja, obligan a los cajeros a declarar un turno antes de vender, y dan al administrador visibilidad completa de discrepancias históricas.

---

## 2. Decisiones de arquitectura

### 2.1 Un turno activo por (caja, cajero)

**Decisión**: un cajero puede tener solo un turno `OPEN` por caja física a la vez. La restricción se implementa con un índice parcial en PostgreSQL:

```sql
CREATE UNIQUE INDEX shift_one_open_per_user
  ON "Shift" ("userId")
  WHERE status = 'OPEN';
```

**Alternativa descartada**: "un turno por caja independientemente del usuario" — en negocios pequeños un cajero puede rotar entre cajas. Restringir por `(userId)` es más natural; si se requiere por caja se agrega `(cashRegisterId, status=OPEN)` como índice adicional en una fase futura.

### 2.2 FK Sale.shiftId — nullable primero

**Decisión**: `Sale.shiftId` se agrega como nullable en la Fase A. Se puede hacer `NOT NULL` en la Fase C una vez que todos los clientes han migrado y no quedan ventas históricas sin turno. Intentar hacer `NOT NULL` desde el inicio bloquea el despliegue porque la tabla `Sale` ya tiene filas.

### 2.3 Bloqueo de ventas sin turno abierto — en backend

**Decisión**: `SalesService.create()` lanza `ConflictException` (409) si el cajero no tiene un turno `OPEN`. El frontend también pregunta al montar el POS, pero el backend es la fuente de verdad. No se confía únicamente en la validación de cliente.

### 2.4 Movimientos de caja en tabla separada

**Decisión**: `CashMovement` es su propia tabla, no se reutiliza `Payment` ni `InventoryMovement`. Razones:
- Semántica diferente: un `CashMovement` puede no estar ligado a una venta.
- El tipo `CHANGE_GIVEN` (vuelto) es negativo y no encaja en el modelo de `Payment`.
- La tabla propia permite timeline limpio para el arqueo sin JOINs complejos.

### 2.5 Cálculo del efectivo esperado

`expectedCash = openingCash + SUM(amount WHERE type IN (SALE_IN, CASH_IN)) - SUM(amount WHERE type IN (CASH_OUT, CHANGE_GIVEN))`

El `discrepancy = closingCash - expectedCash`. Positivo = sobrante, negativo = faltante.

### 2.6 Numeración consecutiva de turnos

`Shift.shiftNumber` usa `@default(autoincrement())` — igual que `Sale.saleNumber` y `PurchaseOrder.orderNumber` en el proyecto. Es global (no por caja), lo que simplifica las referencias en soporte ("turno #47").

---

## 3. Modelo de datos (Prisma)

Agregar al final de `backend/prisma/schema.prisma`:

```prisma
// ─── Módulo Caja / Arqueo / Turnos ───────────────────────────────────────────

model CashRegister {
  id        String   @id @default(uuid())
  name      String   @unique
  location  String?
  active    Boolean  @default(true)
  shifts    Shift[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([active])
}

enum ShiftStatus {
  OPEN
  CLOSED
  FORCE_CLOSED
}

model Shift {
  id                String        @id @default(uuid())
  shiftNumber       Int           @unique @default(autoincrement())
  cashRegisterId    String
  cashRegister      CashRegister  @relation(fields: [cashRegisterId], references: [id])
  userId            String
  user              User          @relation("ShiftsOpened", fields: [userId], references: [id])
  openingCash       Decimal       @db.Decimal(12, 2)
  closingCash       Decimal?      @db.Decimal(12, 2)
  expectedCash      Decimal?      @db.Decimal(12, 2)
  discrepancy       Decimal?      @db.Decimal(12, 2)
  discrepancyReason String?
  status            ShiftStatus   @default(OPEN)
  openedAt          DateTime      @default(now())
  closedAt          DateTime?
  closedById        String?
  closedBy          User?         @relation("ShiftsClosed", fields: [closedById], references: [id])
  notes             String?
  sales             Sale[]
  movements         CashMovement[]

  @@index([status])
  @@index([cashRegisterId, status])
  @@index([userId, status])
  @@index([openedAt])
}

enum CashMovementType {
  SALE_IN       // Efectivo recibido por venta en cash
  CASH_IN       // Ingreso manual (fondo de cambio, préstamo, etc.)
  CASH_OUT      // Retiro manual (pago de servicio, depósito, etc.)
  CHANGE_GIVEN  // Vuelto entregado al cliente
}

model CashMovement {
  id          String           @id @default(uuid())
  shiftId     String
  shift       Shift            @relation(fields: [shiftId], references: [id])
  type        CashMovementType
  amount      Decimal          @db.Decimal(12, 2)  // siempre positivo; el signo lo da el tipo
  reference   String?          // "Venta #142", "Retiro operativo", etc.
  saleId      String?
  sale        Sale?            @relation(fields: [saleId], references: [id])
  notes       String?
  createdById String
  createdBy   User             @relation("CashMovementsCreated", fields: [createdById], references: [id])
  createdAt   DateTime         @default(now())

  @@index([shiftId, createdAt])
  @@index([saleId])
}
```

### Modificaciones a modelos existentes

```prisma
// model User — agregar relaciones
shiftsOpened      Shift[]        @relation("ShiftsOpened")
shiftsClosed      Shift[]        @relation("ShiftsClosed")
cashMovements     CashMovement[] @relation("CashMovementsCreated")

// model Sale — agregar FK nullable
shiftId           String?
shift             Shift?         @relation(fields: [shiftId], references: [id])
cashMovements     CashMovement[]
```

### Índice parcial (SQL puro en migración)

```sql
-- En la migración generada, agregar manualmente:
CREATE UNIQUE INDEX "shift_one_open_per_user"
  ON "Shift" ("userId")
  WHERE status = 'OPEN';
```

---

## 4. Backend — módulos nuevos

### 4.1 Módulo `cash-registers`

#### [CREATE] `backend/src/cash-registers/cash-registers.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CashRegistersController } from './cash-registers.controller';
import { CashRegistersService } from './cash-registers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CashRegistersController],
  providers: [CashRegistersService],
  exports: [CashRegistersService],
})
export class CashRegistersModule {}
```

#### [CREATE] `backend/src/cash-registers/cash-registers.controller.ts`

Rutas CRUD — solo `ADMIN`. Patron idéntico a `purchase-orders.controller.ts`:

```typescript
@ApiTags('CashRegisters')
@Controller('cash-registers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CashRegistersController {
  // POST   /cash-registers          @Roles('ADMIN')  → create(dto)
  // GET    /cash-registers          @Roles('ADMIN', 'CASHIER')  → findAll(query)
  // GET    /cash-registers/:id      @Roles('ADMIN', 'CASHIER')  → findOne(id)
  // PATCH  /cash-registers/:id      @Roles('ADMIN')  → update(id, dto)
  // DELETE /cash-registers/:id      @Roles('ADMIN')  → deactivate(id)
}
```

#### [CREATE] `backend/src/cash-registers/cash-registers.service.ts`

Operaciones: `create`, `findAll`, `findOne`, `update`, `deactivate` (soft delete: `active = false`). No se eliminan físicamente — el histórico de turnos depende de la FK.

#### [CREATE] `backend/src/cash-registers/dto/create-cash-register.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCashRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
```

#### [CREATE] `backend/src/cash-registers/dto/query-cash-registers.dto.ts`

```typescript
export class QueryCashRegistersDto {
  @IsOptional() @Transform(({ value }) => value === 'true') active?: boolean;
  @IsOptional() @IsString() q?: string;
}
```

---

### 4.2 Módulo `shifts`

#### [CREATE] `backend/src/shifts/shifts.module.ts`

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
```

#### [CREATE] `backend/src/shifts/shifts.controller.ts`

```typescript
@ApiTags('Shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ShiftsController {
  // POST   /shifts/open                  @Roles('ADMIN','CASHIER') → open(dto, req)
  // POST   /shifts/:id/close             @Roles('ADMIN','CASHIER') → close(id, dto, req)
  // POST   /shifts/:id/force-close       @Roles('ADMIN')           → forceClose(id, dto, req)
  // POST   /shifts/:id/movements         @Roles('ADMIN','CASHIER') → addMovement(id, dto, req)
  // GET    /shifts                       @Roles('ADMIN','CASHIER') → findAll(query, req)
  // GET    /shifts/current               @Roles('ADMIN','CASHIER') → getCurrent(req)
  // GET    /shifts/:id                   @Roles('ADMIN','CASHIER') → findOne(id, req)
  // GET    /shifts/:id/summary           @Roles('ADMIN','CASHIER') → getSummary(id, req)
}
```

#### [CREATE] `backend/src/shifts/shifts.service.ts`

Firmas clave:

```typescript
@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  /** Abre un turno para el cajero. Lanza ConflictException si ya tiene uno OPEN. */
  async open(dto: OpenShiftDto, userId: string): Promise<Shift>

  /** Cierra el turno. Calcula expectedCash y discrepancy dentro de la transacción. */
  async close(shiftId: string, dto: CloseShiftDto, userId: string): Promise<Shift>

  /** Cierre forzado por ADMIN. El turno pasa a FORCE_CLOSED, closedById = adminId. */
  async forceClose(shiftId: string, dto: ForceCloseShiftDto, userId: string): Promise<Shift>

  /** Agrega un CashMovement manual (CASH_IN o CASH_OUT). */
  async addMovement(shiftId: string, dto: CreateCashMovementDto, userId: string): Promise<CashMovement>

  /** Turno activo del usuario. Retorna null si no hay ninguno. */
  async getCurrentShift(userId: string): Promise<Shift | null>

  /** Lista con filtros y paginación. ADMIN ve todo; CASHIER ve solo los suyos. */
  async findAll(query: QueryShiftsDto, userId: string, role: string): Promise<PaginatedResult<Shift>>

  async findOne(shiftId: string, userId: string, role: string): Promise<Shift>

  /** Resumen de arqueo: openingCash, movements[], expectedCash, closingCash, discrepancy. */
  async getSummary(shiftId: string, userId: string, role: string): Promise<ShiftSummary>

  /** Llamado internamente desde SalesService. NO expuesto como endpoint. */
  async recordSaleMovements(
    tx: Prisma.TransactionClient,
    shiftId: string,
    saleId: string,
    cashReceived: number,
    changeGiven: number,
    userId: string,
  ): Promise<void>
}
```

**Lógica de cierre** (dentro de `this.prisma.$transaction`):

```typescript
// Patrón idéntico al bloque transaccional de purchase-orders.service.ts receive()
const movements = await tx.cashMovement.findMany({ where: { shiftId } });
const expectedCash = movements.reduce((acc, m) => {
  if (m.type === 'SALE_IN' || m.type === 'CASH_IN') return acc + Number(m.amount);
  if (m.type === 'CASH_OUT' || m.type === 'CHANGE_GIVEN') return acc - Number(m.amount);
  return acc;
}, Number(shift.openingCash));
const discrepancy = Number(dto.closingCash) - expectedCash;
```

#### [CREATE] DTOs del módulo `shifts`

```typescript
// open-shift.dto.ts
export class OpenShiftDto {
  @IsUUID() cashRegisterId: string;
  @IsNumber() @Min(0) openingCash: number;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

// close-shift.dto.ts
export class CloseShiftDto {
  @IsNumber() @Min(0) closingCash: number;
  @IsOptional() @IsString() @MaxLength(500) discrepancyReason?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

// force-close-shift.dto.ts
export class ForceCloseShiftDto {
  @IsString() @IsNotEmpty() reason: string;
}

// create-cash-movement.dto.ts
export class CreateCashMovementDto {
  @IsEnum(['CASH_IN', 'CASH_OUT']) type: 'CASH_IN' | 'CASH_OUT';
  @IsNumber() @Min(0.01) amount: number;
  @IsOptional() @IsString() @MaxLength(200) reference?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

// query-shifts.dto.ts
export class QueryShiftsDto {
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsUUID() cashRegisterId?: string;
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEnum(ShiftStatus) status?: ShiftStatus;
  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;
}
```

---

### 4.3 Integración con `SalesService`

#### [MODIFY] `backend/src/sales/sales.service.ts`

Inyectar `ShiftsService` via constructor. Al inicio de `create()`, antes de la transacción:

```typescript
// Verificar turno abierto
const openShift = await this.shiftsService.getCurrentShift(userId);
if (!openShift) {
  throw new ConflictException(
    'No hay turno abierto. Abra un turno antes de registrar ventas.',
  );
}
const shiftId = openShift.id;
```

Dentro del bloque `this.prisma.$transaction`, al crear la venta:

```typescript
const createdSale = await tx.sale.create({
  data: {
    // ... campos existentes ...
    shiftId,  // ← nuevo campo
  } as never,
});
```

Después de crear los `Payment`, aún dentro de la transacción:

```typescript
// Registrar movimientos de caja en el turno
await this.shiftsService.recordSaleMovements(
  tx,
  shiftId,
  createdSale.id,
  cashPaid,
  change ?? 0,
  userId,
);
```

#### [MODIFY] `backend/src/sales/sales.module.ts`

Agregar `ShiftsModule` a `imports` y asegurarse de exportar `ShiftsService`.

#### [MODIFY] `backend/src/app.module.ts`

Importar `CashRegistersModule` y `ShiftsModule`.

---

## 5. Frontend — páginas y componentes

### 5.1 Tipos

#### [CREATE] `frontend/src/types/shift.ts`

```typescript
export type ShiftStatus = 'OPEN' | 'CLOSED' | 'FORCE_CLOSED';
export type CashMovementType = 'SALE_IN' | 'CASH_IN' | 'CASH_OUT' | 'CHANGE_GIVEN';

export interface CashRegister {
  id: string;
  name: string;
  location?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  shiftNumber: number;
  cashRegisterId: string;
  cashRegister: CashRegister;
  userId: string;
  user: { id: string; name: string; email: string };
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  discrepancy?: number;
  discrepancyReason?: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt?: string;
  closedById?: string;
  closedBy?: { id: string; name: string };
  notes?: string;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  type: CashMovementType;
  amount: number;
  reference?: string;
  saleId?: string;
  notes?: string;
  createdById: string;
  createdBy: { id: string; name: string };
  createdAt: string;
}

export interface ShiftSummary extends Shift {
  movements: CashMovement[];
}
```

### 5.2 Hooks

#### [CREATE] `frontend/src/hooks/useCashRegisters.ts`

Patrón idéntico a `useSuppliers.ts`:

```typescript
export function useCashRegisters(params?: CashRegisterFilters) { /* useQuery */ }
export function useCreateCashRegister() { /* useMutation → invalidate ['cash-registers'] */ }
export function useUpdateCashRegister() { /* useMutation */ }
export function useDeactivateCashRegister() { /* useMutation */ }
```

#### [CREATE] `frontend/src/hooks/useShifts.ts`

```typescript
// Queries
export function useShifts(params?: ShiftFilters) { /* GET /shifts */ }
export function useCurrentShift() {
  return useQuery({
    queryKey: ['shifts', 'current'],
    queryFn: () => api.get<Shift | null>('/shifts/current').then(r => r.data),
    staleTime: 30_000,
  });
}
export function useShift(id: string) { /* GET /shifts/:id */ }
export function useShiftSummary(id: string) { /* GET /shifts/:id/summary */ }

// Mutations
export function useOpenShift() { /* POST /shifts/open → invalidate ['shifts','current'] */ }
export function useCloseShift() { /* POST /shifts/:id/close → invalidate ['shifts'] */ }
export function useForceCloseShift() { /* POST /shifts/:id/force-close */ }
export function useAddCashMovement() { /* POST /shifts/:id/movements */ }
```

### 5.3 Páginas

#### [CREATE] `frontend/src/app/cash-registers/page.tsx`

CRUD de cajas físicas. Solo `ADMIN`. Tabla con columnas: Nombre, Ubicación, Estado (activo/inactivo), Acciones. Botón "Nueva caja" abre modal inline con `CreateCashRegisterForm`.

#### [CREATE] `frontend/src/app/shifts/page.tsx`

Lista de turnos con filtros (caja, cajero, fecha desde/hasta, estado). `ADMIN` ve todos; `CASHIER` ve los propios (el backend filtra). Columnas: #Turno, Caja, Cajero, Apertura, Cierre, Efectivo inicial, Discrepancia, Estado. Paginación con `Pagination` (patrón de purchase-orders).

#### [CREATE] `frontend/src/app/shifts/[id]/page.tsx`

Detalle del turno con `ShiftSummary`: header con datos del turno, tabla de movimientos con timeline, resumen de arqueo al pie.

### 5.4 Componentes de turno

#### [CREATE] `frontend/src/components/shifts/ShiftStatusBadge.tsx`

```typescript
const BADGE_MAP: Record<ShiftStatus, { label: string; variant: string }> = {
  OPEN:        { label: 'Abierto',        variant: 'success' },
  CLOSED:      { label: 'Cerrado',        variant: 'secondary' },
  FORCE_CLOSED:{ label: 'Cierre forzado', variant: 'destructive' },
};
```

#### [CREATE] `frontend/src/components/shifts/OpenShiftModal.tsx`

Modal que se dispara en POS cuando `currentShift === null`. Campos: selector de `CashRegister` (dropdown), monto inicial en efectivo (input numérico), notas opcionales. Al confirmar: `useOpenShift()` → `invalidate(['shifts','current'])` → cierra modal.

#### [CREATE] `frontend/src/components/shifts/CloseShiftModal.tsx`

Modal con:
- Input "Efectivo contado" (closingCash).
- Live computation: `discrepancyPreview = closingCash - shift.expectedCash` — mostrar en verde si >= 0, rojo si < 0.
- Textarea "Motivo de discrepancia" (visible solo si `|discrepancyPreview| > threshold`, configurable, default 0).
- Textarea "Notas".

#### [CREATE] `frontend/src/components/shifts/CashMovementForm.tsx`

Formulario embebido en el detalle del turno para agregar `CASH_IN` / `CASH_OUT` manual. Selector de tipo, monto, referencia, notas.

#### [CREATE] `frontend/src/components/shifts/ShiftSummary.tsx`

Componente de presentación que recibe `ShiftSummary` y renderiza:
- Cabecera con datos del turno.
- Tabla de `CashMovement[]` ordenados por `createdAt` con ícono por tipo.
- Pie: `openingCash`, `+SALE_IN`, `+CASH_IN`, `-CASH_OUT`, `-CHANGE_GIVEN`, `= expectedCash`, `closingCash declarado`, `discrepancy`.

#### [CREATE] `frontend/src/components/shifts/ForceCloseModal.tsx`

Modal solo visible para `ADMIN`. Textarea de razón obligatoria.

### 5.5 Integración en POS

#### [MODIFY] `frontend/src/app/pos/page.tsx`

Al montar la página:
1. `const { data: currentShift, isLoading } = useCurrentShift()`.
2. Si `isLoading` → spinner.
3. Si `!currentShift` → mostrar `<OpenShiftModal onSuccess={() => refetch()} />` (no bloqueante de UI completa; el cajero puede ver el catálogo pero el botón "Cobrar" permanece deshabilitado con tooltip "Abrí tu turno primero").
4. Header del POS: chip con turno actual `#shiftNumber` + botón "Cerrar turno" → `<CloseShiftModal>`.

**Bloqueo del botón cobrar:**

```typescript
const canSell = !!currentShift;
// En el botón:
<Button
  disabled={!canSell || cart.length === 0}
  title={!canSell ? 'Abrí tu turno primero' : undefined}
  onClick={handleCheckout}
>
  Cobrar
</Button>
```

### 5.6 Sidebar y routeRoleMap

#### [MODIFY] `frontend/src/components/layout/Sidebar.tsx`

Agregar items (después de "Ventas"):

```typescript
{
  label: 'Caja',
  href: '/shifts',
  icon: <Landmark className="w-4 h-4" />,
  roles: ['ADMIN', 'CASHIER'],
},
{
  label: 'Cajas físicas',
  href: '/cash-registers',
  icon: <MonitorCheck className="w-4 h-4" />,
  roles: ['ADMIN'],
},
```

Iconos de `lucide-react`: `Landmark` (turnos/caja), `MonitorCheck` (cajas físicas).

#### [MODIFY] `frontend/src/components/layout/DashboardLayout.tsx`

```typescript
{ prefix: '/shifts',         roles: ['ADMIN', 'CASHIER'] },
{ prefix: '/cash-registers', roles: ['ADMIN'] },
```

---

## 6. Migraciones y backfill

### Fase 1 — Crear tablas + Sale.shiftId nullable

```bash
# En backend/
npx prisma migrate dev --name add_cash_registers_shifts_movements
```

La migración auto-generada crea `CashRegister`, `Shift`, `CashMovement` y agrega la columna nullable `shiftId` a `Sale`. **Agregar manualmente** al final del SQL generado:

```sql
CREATE UNIQUE INDEX "shift_one_open_per_user"
  ON "Shift" ("userId")
  WHERE status = 'OPEN';
```

### Fase 2 — Seed caja por defecto

En `backend/prisma/seed.ts` agregar:

```typescript
await prisma.cashRegister.upsert({
  where: { name: 'Caja Principal' },
  update: {},
  create: { name: 'Caja Principal', location: 'Mostrador', active: true },
});
```

### Fase 3 (diferida) — Hacer Sale.shiftId NOT NULL

Solo ejecutar una vez que:
a. Todos los clientes tienen el sistema actualizado con Fase B activa.
b. No existen ventas con `shiftId IS NULL` (verificar con `SELECT COUNT(*) FROM "Sale" WHERE "shiftId" IS NULL`).

```bash
npx prisma migrate dev --name enforce_sale_shift_not_null
```

---

## 7. Plan de testing

### Unit — `ShiftsService`

| Test | Assertion |
|------|-----------|
| `open()` — sin turno previo | Retorna turno con `status: OPEN` |
| `open()` — turno ya abierto | Lanza `ConflictException` |
| `close()` — cálculo exacto | `expectedCash = openingCash + SALE_IN + CASH_IN - CASH_OUT - CHANGE_GIVEN` |
| `close()` — discrepancy positiva | `discrepancy > 0` cuando `closingCash > expectedCash` |
| `close()` — discrepancy negativa | `discrepancy < 0` cuando `closingCash < expectedCash` |
| `forceClose()` — por no-admin | Lanza `ForbiddenException` |
| `recordSaleMovements()` | Crea `SALE_IN` + `CHANGE_GIVEN` en la misma tx |

### Unit — `SalesService`

| Test | Assertion |
|------|-----------|
| `create()` — sin turno abierto | Lanza `ConflictException` con mensaje específico |
| `create()` — con turno abierto | `Sale.shiftId` = id del turno abierto |

### E2E — flujo completo

```
POST /shifts/open             → 201, status: OPEN
POST /sales (con turno)       → 201, sale.shiftId definido
GET  /shifts/current/summary  → movements incluye SALE_IN
POST /shifts/:id/movements    → 201, type: CASH_IN
POST /shifts/:id/close        → 201, expectedCash y discrepancy calculados
GET  /shifts/:id/summary      → resumen completo
```

---

## 8. Rollout — fases

### Fase A — Backend: modelo + endpoints (sin tocar ventas)
- Migración Fase 1.
- Módulos `cash-registers` y `shifts` funcionando (sin integración en `SalesService`).
- Seed caja por defecto.
- `ShiftsService.getCurrentShift()` implementado.

### Fase B — Integración POS + frontend UI
- `SalesService.create()` verifica turno + registra `CashMovement`.
- POS bloquea cobro sin turno.
- Páginas `/shifts` y `/cash-registers`.
- Componentes modales de apertura y cierre.

### Fase C — Arqueo, reportes y force-close admin
- Endpoint y UI de `ShiftSummary` con timeline de movimientos.
- `ForceCloseModal` para admin.
- Filtros avanzados en lista de turnos.
- (Opcional) Migración Fase 3: `NOT NULL` en `Sale.shiftId`.

---

## 9. Riesgos y gotchas

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Crash durante venta después de insertar `CashMovement` | Inconsistencia: movimiento sin venta | Todo ocurre en `prisma.$transaction` — rollback automático |
| Cajero deja turno abierto indefinidamente | Admin no puede abrir otro turno para ese usuario | Admin usa `force-close`; considerar alerta por turno > 24h |
| Dos requests de apertura simultáneos del mismo usuario | Dos turnos OPEN | Índice único parcial `(userId, status=OPEN)` — el segundo request recibe error de BD |
| Ventas históricas sin shiftId | Reportes inconsistentes si se hace NOT NULL antes de tiempo | Respetar secuencia: nullable → verificar → NOT NULL |
| Cajero sin caja asignada | No puede abrir turno | El dropdown de cajas en `OpenShiftModal` filtra `active=true`; sin cajas activas → el admin debe crear una |
| Discrepancia calculada en frontend | Valor incorrecto si hay lag | El frontend calcula solo el preview; el valor canónico lo calcula el backend al cerrar |

---

## 10. Archivos a crear / modificar

| Acción | Ruta |
|--------|------|
| [CREATE] | `backend/src/cash-registers/cash-registers.module.ts` |
| [CREATE] | `backend/src/cash-registers/cash-registers.controller.ts` |
| [CREATE] | `backend/src/cash-registers/cash-registers.service.ts` |
| [CREATE] | `backend/src/cash-registers/dto/create-cash-register.dto.ts` |
| [CREATE] | `backend/src/cash-registers/dto/update-cash-register.dto.ts` |
| [CREATE] | `backend/src/cash-registers/dto/query-cash-registers.dto.ts` |
| [CREATE] | `backend/src/shifts/shifts.module.ts` |
| [CREATE] | `backend/src/shifts/shifts.controller.ts` |
| [CREATE] | `backend/src/shifts/shifts.service.ts` |
| [CREATE] | `backend/src/shifts/dto/open-shift.dto.ts` |
| [CREATE] | `backend/src/shifts/dto/close-shift.dto.ts` |
| [CREATE] | `backend/src/shifts/dto/force-close-shift.dto.ts` |
| [CREATE] | `backend/src/shifts/dto/create-cash-movement.dto.ts` |
| [CREATE] | `backend/src/shifts/dto/query-shifts.dto.ts` |
| [MODIFY] | `backend/src/sales/sales.service.ts` |
| [MODIFY] | `backend/src/sales/sales.module.ts` |
| [MODIFY] | `backend/src/app.module.ts` |
| [MODIFY] | `backend/prisma/schema.prisma` |
| [MODIFY] | `backend/prisma/seed.ts` |
| [CREATE] | `frontend/src/types/shift.ts` |
| [CREATE] | `frontend/src/hooks/useCashRegisters.ts` |
| [CREATE] | `frontend/src/hooks/useShifts.ts` |
| [CREATE] | `frontend/src/app/cash-registers/page.tsx` |
| [CREATE] | `frontend/src/app/shifts/page.tsx` |
| [CREATE] | `frontend/src/app/shifts/[id]/page.tsx` |
| [CREATE] | `frontend/src/components/shifts/ShiftStatusBadge.tsx` |
| [CREATE] | `frontend/src/components/shifts/OpenShiftModal.tsx` |
| [CREATE] | `frontend/src/components/shifts/CloseShiftModal.tsx` |
| [CREATE] | `frontend/src/components/shifts/CashMovementForm.tsx` |
| [CREATE] | `frontend/src/components/shifts/ShiftSummary.tsx` |
| [CREATE] | `frontend/src/components/shifts/ForceCloseModal.tsx` |
| [MODIFY] | `frontend/src/app/pos/page.tsx` |
| [MODIFY] | `frontend/src/components/layout/Sidebar.tsx` |
| [MODIFY] | `frontend/src/components/layout/DashboardLayout.tsx` |

**Total: 22 archivos nuevos + 7 modificados = 29 archivos.**

---

## 11. Dependencias entre tareas

```
Migración (Fase 1)
  └─► CashRegistersModule (CRUD)
  └─► ShiftsModule (open/close/movements/summary)
        └─► SalesService integration (Fase B)
              └─► POS frontend (OpenShiftModal, CloseShiftModal)
              └─► /shifts page + /shifts/[id] page
        └─► ForceClose admin endpoint (Fase C)
              └─► ForceCloseModal (Fase C)

Seed caja "Principal" (Fase 2 — puede ejecutarse en paralelo con módulos)
```

No se puede desplegar la integración en `SalesService` (Fase B) sin que el módulo `shifts` esté operativo (Fase A).

---

## 12. Estimación

| Fase | Contenido | Estimación |
|------|-----------|------------|
| A — Backend modelo + endpoints | Migración, módulos `cash-registers` y `shifts`, seed | 4–5 días |
| B — Integración POS + frontend UI | `SalesService`, hooks, páginas, modales POS | 6–8 días |
| C — Arqueo reports + force-close | `ShiftSummary` timeline, filtros avanzados, admin tools | 3–4 días |
| Testing (unit + E2E) | Transversal a todas las fases | 2–3 días |
| **Total** | | **~3 semanas (15–20 días hábiles)** |

La mayor complejidad está en **Fase B**: la integración transaccional en `SalesService` y la UX del POS con el estado del turno deben testearse exhaustivamente antes de ir a producción.
