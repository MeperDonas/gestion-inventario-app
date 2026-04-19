# Correccion de bugs de proveedores y ordenes de compra Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir los bugs reales detectados en proveedores y ordenes de compra sin cambiar la regla de negocio confirmada: una OC en `PARTIAL_RECEIVED` no se puede cancelar y un proveedor si se puede desactivar aunque tenga ordenes historicas.

**Architecture:** El trabajo se divide en dos capas. Primero se blindan invariantes de backend para proteger integridad de stock, estados y filtros. Despues se alinea el frontend con esas reglas, se corrigen errores de manejo de estado y se agregan pruebas de regresion para que los mismos bugs no reaparezcan.

**Tech Stack:** NestJS 11, Prisma 6, PostgreSQL, Next.js 16 App Router, React 19, TanStack Query v5, Jest, Vitest.

---

## Regla de negocio confirmada

- Una OC en `PARTIAL_RECEIVED` NO se puede cancelar.
- Un proveedor SI se puede desactivar aunque tenga ordenes historicas.
- Un proveedor inactivo no debe poder entrar en nuevos flujos operativos.

---

### Task 1: Blindar recepcion para evitar sobre-recepcion y corrupcion de stock

**Files:**
- Modify: `backend/src/purchase-orders/purchase-orders.service.ts`
- Modify: `backend/src/purchase-orders/dto/receive-purchase-order.dto.ts`
- Test: `backend/src/purchase-orders/purchase-orders.service.spec.ts`

**Step 1: Write the failing tests**

- Agregar casos para:
  - payload con el mismo `itemId` repetido en `dto.items`
  - cantidad total recibida mayor a lo pendiente
  - fallo de validacion que no debe tocar stock ni `qtyReceived`

**Step 2: Run test to verify it fails**

Run: `npm run test -- --testPathPattern=purchase-orders.service.spec.ts`
Expected: FAIL en casos de recepcion duplicada/sobre-recibida.

**Step 3: Write minimal implementation**

- Rechazar `dto.items` vacio o con `itemId` duplicados antes de procesar la transaccion.
- Consolidar la validacion por `itemId` usando suma por item, no por fila individual.
- Revalidar dentro de la transaccion contra el estado actual del item antes del `update`.
- Mantener el comportamiento de concurrencia optimista ya existente sobre `Product.version`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- --testPathPattern=purchase-orders.service.spec.ts`
Expected: PASS en los casos nuevos y sin regresiones en recepcion valida.

**Step 5: Commit**

```bash
git add backend/src/purchase-orders/purchase-orders.service.ts backend/src/purchase-orders/dto/receive-purchase-order.dto.ts backend/src/purchase-orders/purchase-orders.service.spec.ts
git commit -m "fix: prevent over-receiving purchase order items"
```

---

### Task 2: Alinear cancelacion de OC con la regla oficial de estados

**Files:**
- Modify: `frontend/src/app/purchase-orders/[id]/page.tsx`
- Test: `frontend/src/app/purchase-orders/purchase-order-detail.test.tsx`

**Step 1: Write the failing test**

- Agregar caso donde una orden `PARTIAL_RECEIVED` renderiza el detalle y NO debe mostrar el CTA `Cancelar OC`.

**Step 2: Run test to verify it fails**

Run: `npm run test -- purchase-order-detail.test.tsx`
Expected: FAIL porque hoy el boton aparece.

**Step 3: Write minimal implementation**

- Cambiar `canCancel` para que solo sea verdadero en `DRAFT` o `PENDING`.
- Asegurar que `CancelPurchaseOrderModal` solo se monte cuando `canCancel` sea verdadero.
- No tocar backend: la API ya refleja la regla correcta.

**Step 4: Run test to verify it passes**

Run: `npm run test -- purchase-order-detail.test.tsx`
Expected: PASS y el boton desaparece en parcial.

**Step 5: Commit**

```bash
git add frontend/src/app/purchase-orders/[id]/page.tsx frontend/src/app/purchase-orders/purchase-order-detail.test.tsx
git commit -m "fix: hide cancel action for partially received orders"
```

---

### Task 3: Permitir desactivar proveedores con ordenes historicas sin romper el flujo operativo

**Files:**
- Modify: `backend/src/suppliers/suppliers.service.ts`
- Modify: `frontend/src/app/suppliers/page.tsx`
- Test: `backend/src/suppliers/suppliers.service.spec.ts`

**Step 1: Write the failing test**

- Agregar caso donde un proveedor con una OC historica puede pasar a `active=false`.
- Agregar caso donde el mensaje de error solo se usa si el proveedor no existe, no por historial.

**Step 2: Run test to verify it fails**

Run: `npm run test -- --testPathPattern=suppliers.service.spec.ts`
Expected: FAIL porque hoy `remove()` lanza `ConflictException` si existen OCs.

**Step 3: Write minimal implementation**

- Eliminar el bloqueo por `ordersCount > 0` en `remove()`.
- Mantener la operacion como soft-delete (`active=false`).
- Ajustar el texto en UI para hablar de desactivacion operativa y no de eliminacion logica que rompa historial.

**Step 4: Run test to verify it passes**

Run: `npm run test -- --testPathPattern=suppliers.service.spec.ts`
Expected: PASS y el proveedor queda inactivo preservando historial.

**Step 5: Commit**

```bash
git add backend/src/suppliers/suppliers.service.ts backend/src/suppliers/suppliers.service.spec.ts frontend/src/app/suppliers/page.tsx
git commit -m "fix: allow deactivating suppliers with historical orders"
```

---

### Task 4: Corregir filtro `dateTo` y busqueda por numero de OC

**Files:**
- Modify: `backend/src/purchase-orders/purchase-orders.service.ts`
- Test: `backend/src/purchase-orders/purchase-orders.service.spec.ts`

**Step 1: Write the failing tests**

- Caso `dateTo=today` incluye una OC creada hoy mas tarde.
- Caso de busqueda `OC-12` encuentra la misma orden que `12`.

**Step 2: Run test to verify it fails**

Run: `npm run test -- --testPathPattern=purchase-orders.service.spec.ts`
Expected: FAIL en filtro inclusivo y/o busqueda normalizada.

**Step 3: Write minimal implementation**

- Convertir `dateTo` a limite exclusivo del dia siguiente.
- Normalizar la query de busqueda quitando prefijo `OC-` antes de `parseInt`.
- Mantener la busqueda textual por proveedor/notas.

**Step 4: Run test to verify it passes**

Run: `npm run test -- --testPathPattern=purchase-orders.service.spec.ts`
Expected: PASS en ambos escenarios.

**Step 5: Commit**

```bash
git add backend/src/purchase-orders/purchase-orders.service.ts backend/src/purchase-orders/purchase-orders.service.spec.ts
git commit -m "fix: make purchase order filters inclusive and resilient"
```

---

### Task 5: Mostrar estado de error real en detalle de OC

**Files:**
- Modify: `frontend/src/app/purchase-orders/[id]/page.tsx`
- Test: `frontend/src/app/purchase-orders/purchase-order-detail.test.tsx`

**Step 1: Write the failing test**

- Simular una query con error o `order` ausente y verificar que la pantalla muestre mensaje de error y accion de volver/reintentar, no loading infinito.

**Step 2: Run test to verify it fails**

Run: `npm run test -- purchase-order-detail.test.tsx`
Expected: FAIL porque hoy sigue mostrando spinner.

**Step 3: Write minimal implementation**

- Consumir `isError` y `error` desde `usePurchaseOrder`.
- Separar ramas `isLoading`, `isError` y `!order`.
- Mostrar estado vacio claro para 404 y estado de error para fallos de red/API.

**Step 4: Run test to verify it passes**

Run: `npm run test -- purchase-order-detail.test.tsx`
Expected: PASS y no hay spinner eterno.

**Step 5: Commit**

```bash
git add frontend/src/app/purchase-orders/[id]/page.tsx frontend/src/app/purchase-orders/purchase-order-detail.test.tsx
git commit -m "fix: handle purchase order detail errors explicitly"
```

---

### Task 6: Dejar `usePurchaseOrders` y modales en verde con TypeScript y ESLint

**Files:**
- Modify: `frontend/src/hooks/usePurchaseOrders.ts`
- Modify: `frontend/src/components/purchase-orders/CancelPurchaseOrderModal.tsx`
- Modify: `frontend/src/components/purchase-orders/ReceiveItemsModal.tsx`
- Modify: `frontend/src/components/purchase-orders/EditDraftModal.tsx`
- Test: `frontend/src/components/purchase-orders/purchase-order-modals.test.tsx`

**Step 1: Write the failing test / reproduce static failures**

- Registrar la falla de `tsc` en `usePurchaseOrders.ts`.
- Registrar la falla de lint por `react-hooks/set-state-in-effect` en los tres modales.

**Step 2: Run checks to verify they fail**

Run: `npm run lint`
Expected: FAIL en los modales.

Run: `npx tsc --noEmit`
Expected: FAIL en `usePurchaseOrders.ts`.

**Step 3: Write minimal implementation**

- Ajustar el tipo de `params` pasado a `api.get` para que sea compatible con `Record<string, unknown>`.
- Refactorizar reseteos/inicializaciones de estado en modales para que no dependan de `setState` sincronico dentro de `useEffect`.
- Preferir inicializacion al abrir, `key` de remount o funciones puras de derivacion donde aplique.

**Step 4: Run checks to verify they pass**

Run: `npm run lint`
Expected: PASS para archivos del feature.

Run: `npx tsc --noEmit`
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/hooks/usePurchaseOrders.ts frontend/src/components/purchase-orders/CancelPurchaseOrderModal.tsx frontend/src/components/purchase-orders/ReceiveItemsModal.tsx frontend/src/components/purchase-orders/EditDraftModal.tsx frontend/src/components/purchase-orders/purchase-order-modals.test.tsx
git commit -m "fix: stabilize purchase order hooks and modals"
```

---

### Task 7: Ejecutar regresion minima del modulo

**Files:**
- Test: `backend/src/purchase-orders/purchase-orders.service.spec.ts`
- Test: `backend/src/suppliers/suppliers.service.spec.ts`
- Test: `frontend/src/app/purchase-orders/purchase-order-detail.test.tsx`
- Test: `frontend/src/components/purchase-orders/purchase-order-modals.test.tsx`

**Step 1: Run backend tests**

Run: `npm run test -- --testPathPattern=purchase-orders.service.spec.ts|suppliers.service.spec.ts`
Expected: PASS.

**Step 2: Run frontend tests**

Run: `npm run test -- purchase-order-detail.test.tsx purchase-order-modals.test.tsx`
Expected: PASS.

**Step 3: Run static checks**

Run: `npm run lint`
Expected: PASS en frontend.

Run: `npx tsc --noEmit`
Expected: PASS en frontend.

Run: `npx tsc --noEmit`
Expected: PASS en backend.

**Step 4: Manual smoke checklist**

- Crear proveedor nuevo.
- Crear OC borrador.
- Confirmar OC.
- Recibir parcialmente.
- Verificar que NO se muestra cancelar.
- Recibir saldo pendiente.
- Validar stock exacto y sin duplicados.
- Desactivar proveedor con historial.
- Verificar que ya no aparece en nuevas OCs.

**Step 5: Commit**

```bash
git add .
git commit -m "test: cover supplier and purchase order regressions"
```

---

## Orden recomendado de ejecucion

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7

## Criterios de cierre

- Ningun payload de recepcion puede dejar `qtyReceived > qtyOrdered`.
- `PARTIAL_RECEIVED` nunca ofrece ni acepta cancelacion.
- Un proveedor con historial se puede desactivar sin perder sus OCs anteriores.
- Un proveedor inactivo queda fuera de futuros flujos operativos.
- `dateTo` incluye el dia completo.
- La busqueda por `OC-<numero>` funciona.
- El detalle de una OC maneja 404/500 sin loading infinito.
- `frontend npm run lint`, `frontend npx tsc --noEmit` y `backend npx tsc --noEmit` terminan en verde.
