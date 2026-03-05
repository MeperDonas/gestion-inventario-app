# Diseño: Importación de Inventario desde Excel/CSV

**Fecha:** 2026-03-05  
**Estado:** Aprobado — pendiente de implementación  
**Alcance:** Solo productos (inventario). Clientes y ventas fuera del alcance por ahora.  
**Ubicación UI:** Card "Importar Datos" en `frontend/src/app/reports/page.tsx`, debajo de la card de exportación existente.

---

## Contexto

El sistema necesita permitir que negocios que migran desde un sistema POS antiguo puedan importar su catálogo de productos (con stock) desde archivos Excel o CSV. El sistema antiguo puede exportar datos con columnas de nombres variables o parciales (ej: solo "Precio" en lugar de "Precio Venta" y "Precio Costo" por separado).

---

## Arquitectura General — Flujo de Datos

```
Usuario sube archivo (.xlsx / .csv)
        |
        v
POST /api/imports/products   (multipart/form-data, JWT required)
        |
        +-- parsea archivo (ExcelJS / @fast-csv ya instalados)
        +-- detecta columnas con sistema de aliases
        +-- crea jobId (UUID)
        +-- inicia procesamiento async fila por fila
        |
        v
Retorna: { jobId, totalRows, detectedColumns, columnMapping }
        |
        v
Frontend: polling cada 1s
        |
        v
GET /api/imports/:jobId/status
        |
        v
Retorna: { status, progress, imported, skipped, errors[], recentEvents[] }

(Si hay errores editables por el usuario)
        |
        v
POST /api/imports/:jobId/retry-row
        |   Body: { rowIndex, correctedData }
        v
Backend: valida y reintenta insertar solo esa fila
```

**Decisiones de arquitectura:**

- Módulo separado `backend/src/imports/` (no reutilizar `exports/`). Responsabilidades distintas.
- Jobs en memoria (`Map<string, ImportJob>` en el servicio). Sin persistencia en DB — son operaciones puntuales de migración. Si el servidor se reinicia, el job se pierde (aceptable).
- Usar `ProductsService.create()` (no Prisma directo) para que se generen `InventoryMovement` de stock inicial por cada producto importado.
- Solo roles `ADMIN` e `INVENTORY_USER` pueden importar.
- Endpoint en `/api/imports/products` (no `/api/products/import`) para separación de concerns y extensibilidad futura (`/api/imports/customers`, etc.).

---

## Sistema de Detección Inteligente de Columnas

El backend normaliza los headers del archivo (`trim()`, `toLowerCase()`, quitar acentos, reemplazar espacios/guiones por `_`) y los compara contra un mapa de aliases por campo:

| Campo DB      | Aliases reconocidos                                                                |
|---------------|------------------------------------------------------------------------------------|
| `name`        | nombre, name, producto, product, descripcion_corta, articulo                       |
| `sku`         | sku, codigo, code, ref, referencia, codigo_interno                                 |
| `barcode`     | codigo_de_barras, barcode, ean, upc, codigo_barras, codigobarras                   |
| `category`    | categoria, category, cat, tipo, grupo, familia                                     |
| `salePrice`   | precio_venta, sale_price, pvp, precio_de_venta, **precio** (fallback)              |
| `costPrice`   | precio_costo, cost_price, costo, precio_de_costo, precio_compra                    |
| `stock`       | stock, cantidad, qty, quantity, existencia, inventario, unidades                   |
| `minStock`    | stock_minimo, min_stock, punto_reorden, minimo, stock_min                          |
| `taxRate`     | impuesto, iva, tax, tax_rate, tasa_impuesto, porcentaje_iva                        |
| `description` | descripcion, description, detalle, notas, observaciones, descripcion_larga         |

**Algoritmo de resolución de columnas:**
1. Leer headers de la primera fila del archivo.
2. Normalizar cada header.
3. Match contra aliases → producir `columnMapping: Record<string, string>`.
4. Si hay columna "precio" pero no "precio_venta" ni "precio_costo": mapear a `salePrice`, inferir `costPrice = salePrice`, marcar filas con warning `COST_INFERRED`.
5. Validar que al mínimo `name`, `salePrice` y `stock` estén presentes. Si falta alguno → rechazar el archivo con error descriptivo antes de crear el job.
6. Si no hay columna `sku`: auto-generar con prefijo `IMP-` + índice de 3 dígitos (ej: `IMP-001`).

---

## Reglas de Negocio por Fila

| Situación                                   | Acción                                         | Código           |
|---------------------------------------------|------------------------------------------------|------------------|
| Fila vacía o sin nombre de producto         | Omitir silenciosamente                         | `EMPTY_ROW`      |
| SKU ya existe en la DB                      | Omitir fila, reportar como error editable      | `DUPLICATE_SKU_DB` |
| Barcode ya existe en la DB                  | Omitir fila, reportar como error editable      | `DUPLICATE_BARCODE_DB` |
| SKU repetido dentro del mismo archivo       | Omitir 2da+ ocurrencia, reportar              | `DUPLICATE_SKU_FILE` |
| Barcode repetido dentro del mismo archivo   | Omitir 2da+ ocurrencia, reportar              | `DUPLICATE_BARCODE_FILE` |
| Precio <= 0 o no numérico                   | Omitir fila, reportar como error editable      | `INVALID_PRICE`  |
| Stock no numérico o negativo                | Omitir fila, reportar como error editable      | `INVALID_STOCK`  |
| Solo columna "Precio" (sin precio costo)    | Importar con `costPrice = salePrice`           | Warning: `COST_INFERRED` |
| Categoría no existe en DB                   | Crear categoría automáticamente, importar      | Info: `CATEGORY_CREATED` |
| "bebidas" vs "Bebidas" vs "  bebidas "      | Normalizar nombre antes de buscar/crear        | (sin error)      |
| Todos los campos válidos                    | Crear producto via `ProductsService.create()`  | `SUCCESS`        |

**Sobre `COST_INFERRED`:** Se elige `costPrice = salePrice` (margen 0%) sobre `costPrice = 0` (margen 100% ficticio) para no generar métricas engañosas. Se muestra un banner de aviso en el resultado final si hay productos con esta inferencia.

**Importación parcial:** La importación no se detiene por errores individuales. Se completa y muestra un resumen final con todos los resultados.

---

## Estructura del Job en Memoria (TypeScript)

```typescript
interface ImportJob {
  id: string;
  userId: string;
  status: 'PARSING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileName: string;
  totalRows: number;
  processedRows: number;
  importedCount: number;
  skippedCount: number;       // filas vacías omitidas sin error
  errorCount: number;
  warningCount: number;       // ej: COST_INFERRED
  columnMapping: Record<string, string>;
  errors: ImportRowError[];   // filas con error, editables por el usuario
  warnings: ImportWarning[];  // inferencias no bloqueantes
  recentEvents: ImportEvent[]; // últimos 10 eventos (feed compacto en UI)
  createdCategories: string[]; // nombres de categorías auto-creadas
  startedAt: Date;
  completedAt?: Date;
}

interface ImportRowError {
  rowIndex: number;
  rawData: Record<string, string>; // datos originales de la fila del archivo
  errorCode: string;               // DUPLICATE_SKU_DB, INVALID_PRICE, etc.
  message: string;                 // mensaje legible en español
  field?: string;                  // campo problemático (ej: "sku")
  retried: boolean;
  retriedSuccess?: boolean;
}

interface ImportWarning {
  rowIndex: number;
  warningCode: string;    // COST_INFERRED, CATEGORY_CREATED
  message: string;
}

interface ImportEvent {
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  rowIndex: number;
  timestamp: Date;
}
```

---

## UI — Card "Importar Datos" en reports/page.tsx

El componente se extrae como `frontend/src/components/reports/ImportSection.tsx` para no sobrecargar `reports/page.tsx`.

### Estado 1: Inicial — subir archivo

- Icono `Upload` + título "Importar Inventario"
- Zona de drag-and-drop / click para archivo (`.xlsx`, `.csv`)
- Botón "Descargar Plantilla" → descarga Excel con columnas esperadas y 2 filas de ejemplo
- Texto de ayuda: acepta formatos con columnas parciales

### Estado 2: Procesando (polling activo cada 1s)

- **Barra de progreso** con porcentaje (`processedRows / totalRows`)
- **4 contadores compactos en fila** (inline badges):
  - Procesados (neutro)
  - Importados (verde)
  - Omitidos (amarillo)
  - Errores (rojo)
- **Feed compacto** de eventos recientes: scroll interno limitado (~150px), últimos 10 eventos, cada uno con icono de color + texto + número de fila
- Tags pequeños con columnas detectadas (confirmación visual de que el archivo fue leído correctamente)
- Nombre del archivo

### Estado 3: Resultado final

- **Resumen** con los 4 contadores finales (igual que Estado 2 pero estático)
- **Banner warning** (amarillo): "X productos importados con precio de costo inferido. Revísalos en Inventario." — solo si `warningCount > 0`
- **Badge info**: "Categorías creadas automáticamente: Bebidas, Limpieza" — solo si `createdCategories.length > 0`
- **Tabla de errores** (si `errorCount > 0`):
  - Una fila por error
  - Badge de color según código: rojo (`DUPLICATE_*`), naranja (`INVALID_*`)
  - Número de fila original del archivo
  - Datos de la fila (compactos)
  - Botón "Editar" → abre mini-form inline con campos editables
  - Botón "Reintentar" → llama a `POST /api/imports/:jobId/retry-row`
  - Badge "Corregido" (verde) si el reintento fue exitoso
- **Botón "Nueva importación"** → vuelve al Estado 1

---

## Archivos a Crear y Modificar

### Backend — nuevo módulo `imports/`

| Archivo | Descripción |
|---------|-------------|
| `backend/src/imports/imports.module.ts` | Módulo NestJS; importa `ProductsModule` para usar `ProductsService` |
| `backend/src/imports/imports.controller.ts` | 3 endpoints: POST upload, GET status, POST retry-row |
| `backend/src/imports/imports.service.ts` | Lógica central: jobs Map, procesamiento async, polling state |
| `backend/src/imports/dto/import.dto.ts` | DTOs de request/response para los 3 endpoints |
| `backend/src/imports/helpers/column-detector.ts` | Mapa de aliases + algoritmo de matching y normalización |
| `backend/src/imports/helpers/row-validator.ts` | Validación por fila, conversor de tipos, detección de duplicados |
| `backend/src/app.module.ts` | Registrar `ImportsModule` |

### Frontend

| Archivo | Descripción |
|---------|-------------|
| `frontend/src/components/reports/ImportSection.tsx` | Componente principal con los 3 estados |
| `frontend/src/hooks/useImport.ts` | Hook: upload mutation, polling (status query), retry mutation |
| `frontend/src/app/reports/page.tsx` | Agregar `<ImportSection />` debajo de la card de exportación |

### Dependencias

- **Backend:** `multer` + `@types/multer` para manejo de archivos multipart. `exceljs` y `@fast-csv` ya están instalados. El decorador `@UploadedFile()` de `@nestjs/platform-express` ya es parte del proyecto.
- **Frontend:** Sin dependencias nuevas. El `ApiClient` existente tiene `postWithFormData` que sirve como base.

---

## Plantilla Descargable

El botón "Descargar Plantilla" debe generar un archivo Excel con:

**Hoja 1 — "Productos":**

| Nombre | SKU | Categoria | Precio Venta | Precio Costo | Stock | Stock Minimo | Codigo de Barras | Descripcion | Impuesto (%) |
|--------|-----|-----------|-------------|-------------|-------|-------------|-----------------|-------------|--------------|
| Ejemplo Producto 1 | PROD-001 | Bebidas | 5000 | 3500 | 50 | 5 | 7702011021005 | Descripción opcional | 19 |
| Ejemplo Producto 2 | PROD-002 | Limpieza | 8500 | 6000 | 30 | 3 | | | 0 |

**Hoja 2 — "Instrucciones"** (texto explicativo sobre columnas requeridas vs opcionales, formatos aceptados, reglas de SKU, etc.)

---

## Consideraciones de Seguridad

- Validar tipo MIME del archivo en el backend (solo `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y `text/csv`).
- Limitar tamaño máximo del archivo: 5MB (suficiente para ~10,000 productos).
- Limitar filas máximas a procesar: 5,000 filas por archivo (evitar abuse).
- Jobs en memoria con TTL de 30 minutos: limpiar jobs viejos con un intervalo (`setInterval` en el módulo).
- El jobId debe ser un UUID v4 opaco; no exponer información del job a usuarios que no lo iniciaron (validar `userId` en el GET status).
