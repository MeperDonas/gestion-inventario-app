# Plan de Construcción de la Aplicación Web de Gestión Integrada

## Resumen Ejecutivo

Este documento presenta el plan detallado para la construcción de una aplicación web que permita a pequeños negocios gestionar de manera integrada sus procesos de inventario, ventas, clientes y reportes. La aplicación se desarrollará siguiendo una arquitectura modular por capas, implementando 24 requerimientos funcionales (RF01-RF24) y 10 requerimientos no funcionales (RNF01-RNF10) especificados en el documento de tesis.

### Objetivos del Proyecto

- **Objetivo General**: Desarrollar una aplicación web que integre la gestión de inventario, ventas, clientes y reportes, demostrando la aplicación de arquitectura modular por capas, patrones de diseño y tecnologías modernas de desarrollo full-stack.

- **Objetivos Específicos**:
  1. Definir la estructura del sistema mediante capas (presentación, lógica de negocio, acceso a datos)
  2. Desarrollar la capa de servidor con arquitectura RESTful
  3. Construir la capa de presentación con componentes reutilizables
  4. Verificar el funcionamiento mediante pruebas de integración y validación con usuarios

---

## Stack Tecnológico

### Backend

- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación API**: Swagger/OpenAPI
- **Validación**: class-validator, class-transformer

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI Components**: shadcn/ui (Tailwind CSS + Radix UI)
- **State Management**: TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod
- **Gráficas**: Recharts

### DevOps & Infraestructura

- **Control de Versiones**: Git + GitHub
- **Gestión de Imágenes**: Cloudinary
- **Despliegue Frontend**: Vercel
- **Despliegue Backend**: Railway / Render
- **Containerización**: Docker (desarrollo local)

---

## Arquitectura del Sistema

### Arquitectura por Capas

```
┌─────────────────────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN (Frontend)               │
│            Next.js + React + TypeScript                 │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │Dashboard │Inventario│  Ventas  │ Clientes │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
                         │
                    API REST (HTTPS)
                         │
┌─────────────────────────────────────────────────────────┐
│        CAPA DE LÓGICA DE NEGOCIO (Backend)              │
│              NestJS + TypeScript                        │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  Auth    │Inventory │  Sales   │Customers │         │
│  │  Module  │  Module  │  Module  │  Module  │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
                         │
                    Prisma ORM
                         │
┌─────────────────────────────────────────────────────────┐
│         CAPA DE ACCESO A DATOS (Base de Datos)          │
│                  PostgreSQL                             │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ Users    │Products  │  Sales   │Customers │         │
│  │Categories│Movements │SaleItems │          │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Módulos Funcionales

#### 1. Módulo de Autenticación y Seguridad

- **Requerimientos**: RF01, RNF01, RNF02
- **Funcionalidades**:
  - Login con correo y contraseña
  - Generación y validación de tokens JWT
  - Control de acceso basado en roles (Admin, Cajero)
  - Gestión de sesiones
  - Protección de rutas

#### 2. Módulo de Gestión de Inventario

- **Requerimientos**: RF02, RF03, RF04, RF13, RF14, RF15
- **Funcionalidades**:
  - CRUD de productos (crear, leer, actualizar, desactivar)
  - Gestión de categorías
  - Registro de movimientos de inventario (entradas/salidas)
  - Control de stock en tiempo real
  - Alertas de stock bajo
  - Gestión de imágenes de productos (Cloudinary)
  - Búsqueda y filtrado avanzado

#### 3. Módulo de Punto de Venta (POS)

- **Requerimientos**: RF05, RF06, RF07, RF08, RF09, RF16, RF17
- **Funcionalidades**:
  - Búsqueda rápida de productos (nombre, SKU, código de barras)
  - Gestión de carrito de compras temporal
  - Cálculo automático de subtotales, impuestos y totales
  - Aplicación de descuentos (porcentuales o fijos)
  - Gestión de métodos de pago (efectivo, tarjeta, transferencia)
  - Cálculo de cambio
  - Generación de comprobantes de venta
  - Actualización automática de stock
  - Gestión de anulaciones y devoluciones

#### 4. Módulo de Gestión de Clientes

- **Requerimientos**: RF10, RF11, RF19, RF20
- **Funcionalidades**:
  - CRUD de clientes
  - Validación de unicidad de documentos
  - Registro de múltiples contactos por cliente
  - Consulta de historial de compras por cliente
  - Segmentación de clientes (VIP, frecuente, ocasional, inactivo)
  - Cálculo de métricas de comportamiento

#### 5. Módulo de Reportes y Analítica

- **Requerimientos**: RF12, RF18, RF21, RF22, RF23, RF24
- **Funcionalidades**:
  - Dashboard con KPIs principales
  - Reporte de ventas por rango de fechas
  - Reporte de productos más vendidos
  - Análisis de rentabilidad por producto
  - Reporte de ventas por método de pago
  - Reporte de movimientos de inventario
  - Gráficas y visualizaciones

---

## Modelo de Datos (Base de Datos)

### Entidades Principales

```prisma
// Usuarios y autenticación
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hasheado con bcrypt
  name      String
  role      Role     @default(CASHIER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  CASHIER
  INVENTORY_USER
}

// Categorías de productos
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  active      Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Productos
model Product {
  id            String              @id @default(uuid())
  name          String
  sku           String              @unique
  barcode       String?             @unique
  description   String?
  costPrice     Decimal             @db.Decimal(10, 2)
  salePrice     Decimal             @db.Decimal(10, 2)
  taxRate       Decimal             @db.Decimal(5, 2) @default(0)
  stock         Int                 @default(0)
  minStock      Int                 @default(0)
  imageUrl      String?
  categoryId    String
  category      Category            @relation(fields: [categoryId], references: [id])
  active        Boolean             @default(true)
  movements     InventoryMovement[]
  saleItems     SaleItem[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

// Movimientos de inventario
model InventoryMovement {
  id            String       @id @default(uuid())
  productId     String
  product       Product      @relation(fields: [productId], references: [id])
  type          MovementType
  quantity      Int
  previousStock Int
  newStock      Int
  reason        String
  userId        String
  saleId        String?      // Referencia si es una salida por venta
  createdAt     DateTime     @default(now())
}

enum MovementType {
  PURCHASE        // Compra
  SALE            // Salida por venta
  ADJUSTMENT_IN   // Ajuste de entrada
  ADJUSTMENT_OUT  // Ajuste de salida
  DAMAGE          // Daño/Pérdida
  RETURN          // Devolución
}

// Clientes
model Customer {
  id             String    @id @default(uuid())
  name           String
  documentType   String    // CC, NIT, CE, etc.
  documentNumber String    @unique
  email          String?
  phone          String?
  address        String?
  segment        CustomerSegment @default(OCCASIONAL)
  active         Boolean   @default(true)
  sales          Sale[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

enum CustomerSegment {
  VIP
  FREQUENT
  OCCASIONAL
  INACTIVE
}

// Ventas
model Sale {
  id             String       @id @default(uuid())
  saleNumber     Int          @unique // Consecutivo
  customerId     String?
  customer       Customer?    @relation(fields: [customerId], references: [id])
  subtotal       Decimal      @db.Decimal(10, 2)
  taxAmount      Decimal      @db.Decimal(10, 2)
  discountAmount Decimal      @db.Decimal(10, 2) @default(0)
  total          Decimal      @db.Decimal(10, 2)
  paymentMethod  PaymentMethod
  amountPaid     Decimal?     @db.Decimal(10, 2)
  change         Decimal?     @db.Decimal(10, 2)
  status         SaleStatus   @default(COMPLETED)
  userId         String
  items          SaleItem[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
}

enum SaleStatus {
  COMPLETED
  CANCELLED
  RETURNED_PARTIAL
}

// Items de venta
model SaleItem {
  id             String  @id @default(uuid())
  saleId         String
  sale           Sale    @relation(fields: [saleId], references: [id])
  productId      String
  product        Product @relation(fields: [productId], references: [id])
  quantity       Int
  unitPrice      Decimal @db.Decimal(10, 2)
  taxRate        Decimal @db.Decimal(5, 2)
  discountAmount Decimal @db.Decimal(10, 2) @default(0)
  subtotal       Decimal @db.Decimal(10, 2)
  total          Decimal @db.Decimal(10, 2)
}

// Logs de auditoría
model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String   // LOGIN_SUCCESS, LOGIN_FAILED, PRICE_CHANGE, etc.
  resource   String   // Product, Sale, Customer, etc.
  resourceId String?
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

---

## Fases de Desarrollo

El proyecto se divide en 6 fases principales siguiendo el cronograma del documento de tesis (12 semanas, 248 horas):

### FASE 1: Análisis, Diseño y Configuración Inicial

**Duración**: Semanas 1-2 (40 horas)

#### Actividades:

1. **Revisión Bibliográfica y Marco Teórico**

   - Revisar documentación oficial de tecnologías
   - Estudiar patrones de arquitectura por capas
   - Investigar mejores prácticas de desarrollo full-stack

2. **Definición Detallada de Requerimientos**

   - Consolidar requerimientos funcionales (RF01-RF24)
   - Consolidar requerimientos no funcionales (RNF01-RNF10)
   - Priorizar funcionalidades (Alta, Media, Baja)

3. **Diseño de Arquitectura**

   - Crear diagramas de arquitectura por capas
   - Definir estructura de módulos
   - Diseñar flujo de comunicación Frontend-Backend

4. **Diseño de Base de Datos**

   - Crear diagrama entidad-relación (ERD)
   - Definir schema de Prisma
   - Normalizar tablas (3FN)
   - Establecer relaciones e índices

5. **Especificación de API REST**

   - Diseñar endpoints por módulo
   - Definir DTOs (Data Transfer Objects)
   - Especificar códigos de respuesta HTTP
   - Documentar parámetros y payloads

6. **Diseño de UI/UX**

   - Crear wireframes en Figma
   - Diseñar prototipos de pantallas principales
   - Definir sistema de diseño (colores, tipografía, componentes)
   - Diseñar flujo de navegación

7. **Configuración de Proyectos**
   - Inicializar proyecto NestJS (backend)
   - Inicializar proyecto Next.js (frontend)
   - Configurar TypeScript en ambos proyectos
   - Configurar ESLint y Prettier
   - Configurar Docker Compose (PostgreSQL)
   - Configurar repositorio Git con convenciones

#### Entregables:

- ✅ Documento de requerimientos consolidado
- ✅ Diagramas de arquitectura y base de datos
- ✅ Especificaciones de API documentadas
- ✅ Wireframes y prototipos en Figma
- ✅ Proyectos configurados y ejecutándose localmente
- ✅ Repositorio Git inicializado

---

### FASE 2: Desarrollo del Backend Core

**Duración**: Semanas 3-5 (64 horas)

#### Módulos a Implementar:

#### 2.1 Módulo de Autenticación (RF01)

**Archivos a crear**:

- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/dto/*.dto.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`
- `backend/src/auth/strategies/jwt.strategy.ts`

**Funcionalidades**:

- Endpoint POST `/auth/login` → Login con credenciales
- Generación de tokens JWT con expiración
- Validación de tokens en peticiones protegidas
- Guards para proteger rutas por rol
- Hash de contraseñas con bcrypt

**Tests**: Pruebas unitarias de AuthService

---

#### 2.2 Módulo de Inventario (RF02, RF03, RF04, RF13, RF14, RF15)

**Archivos a crear**:

- `backend/src/inventory/inventory.module.ts`
- `backend/src/products/products.controller.ts`
- `backend/src/products/products.service.ts`
- `backend/src/categories/categories.controller.ts`
- `backend/src/categories/categories.service.ts`
- `backend/src/movements/movements.controller.ts`
- `backend/src/movements/movements.service.ts`

**Endpoints**:

**Productos**:

- `GET /products` → Listar productos con paginación y filtros
- `GET /products/:id` → Obtener producto por ID
- `POST /products` → Crear producto
- `PATCH /products/:id` → Actualizar producto
- `DELETE /products/:id` → Desactivar producto (soft delete)
- `POST /products/:id/image` → Subir imagen a Cloudinary

**Categorías**:

- `GET /categories` → Listar categorías
- `POST /categories` → Crear categoría
- `PATCH /categories/:id` → Actualizar categoría
- `DELETE /categories/:id` → Desactivar categoría

**Movimientos**:

- `GET /inventory/movements` → Listar movimientos con filtros
- `POST /inventory/movements` → Registrar movimiento
- `GET /inventory/alerts` → Productos con stock bajo

**Funcionalidades**:

- Validación de unicidad de SKU y código de barras
- Actualización automática de stock
- Cálculo de alertas de stock bajo
- Integración con Cloudinary para imágenes
- Búsqueda avanzada con filtros combinados

**Tests**: Pruebas unitarias de ProductsService, MovementsService

---

#### 2.3 Módulo de Ventas (RF05, RF06, RF07, RF08, RF09, RF16, RF17)

**Archivos a crear**:

- `backend/src/sales/sales.module.ts`
- `backend/src/sales/sales.controller.ts`
- `backend/src/sales/sales.service.ts`
- `backend/src/sale-items/sale-items.service.ts`

**Endpoints**:

- `GET /sales` → Listar ventas con filtros
- `GET /sales/:id` → Obtener venta por ID
- `POST /sales` → Crear venta (procesamiento completo)
- `PATCH /sales/:id/cancel` → Anular venta
- `PATCH /sales/:id/return` → Registrar devolución

**Funcionalidades**:

- Validación de stock antes de confirmar venta
- Cálculo automático de subtotales, impuestos y totales
- Aplicación de descuentos (porcentuales o fijos)
- Gestión de métodos de pago y cálculo de cambio
- Actualización atómica de stock (transacción)
- Generación de número de venta consecutivo
- Registro de movimientos de inventario por venta

**Tests**: Pruebas de integración de flujo de venta completo

---

#### 2.4 Módulo de Clientes (RF10, RF11, RF19, RF20)

**Archivos a crear**:

- `backend/src/customers/customers.module.ts`
- `backend/src/customers/customers.controller.ts`
- `backend/src/customers/customers.service.ts`

**Endpoints**:

- `GET /customers` → Listar clientes con filtros
- `GET /customers/:id` → Obtener cliente por ID
- `GET /customers/:id/purchases` → Historial de compras
- `POST /customers` → Crear cliente
- `PATCH /customers/:id` → Actualizar cliente
- `DELETE /customers/:id` → Desactivar cliente (soft delete)

**Funcionalidades**:

- Validación de unicidad de documento
- Cálculo de métricas de comportamiento (total gastado, # compras)
- Segmentación automática de clientes
- Filtrado por nombre, documento, email

**Tests**: Pruebas unitarias de CustomersService

---

#### 2.5 Módulo de Reportes (RF12, RF18, RF21, RF22, RF23, RF24)

**Archivos a crear**:

- `backend/src/reports/reports.module.ts`
- `backend/src/reports/reports.controller.ts`
- `backend/src/reports/reports.service.ts`

**Endpoints**:

- `GET /reports/dashboard` → KPIs del dashboard
- `GET /reports/sales` → Reporte de ventas por fechas
- `GET /reports/top-products` → Productos más vendidos
- `GET /reports/profitability` → Análisis de rentabilidad
- `GET /reports/payment-methods` → Ventas por método de pago
- `GET /reports/inventory-movements` → Movimientos de inventario

**Funcionalidades**:

- Consultas optimizadas con agregaciones SQL
- Filtros por rango de fechas, categoría, método de pago
- Cálculos de totales, promedios, conteos
- Formateo de datos para gráficas

**Tests**: Pruebas de cálculos de métricas

---

#### 2.6 Configuración de Infraestructura Backend

- Configurar Prisma ORM y migraciones
- Configurar Swagger/OpenAPI para documentación
- Implementar manejo global de errores
- Implementar interceptores de logging
- Configurar validación global de DTOs
- Configurar CORS

#### Entregables Fase 2:

- ✅ API REST completamente funcional
- ✅ Documentación Swagger accesible en `/api/docs`
- ✅ Base de datos PostgreSQL con schema aplicado
- ✅ Suite de pruebas unitarias ejecutable

---

### FASE 3: Desarrollo del Frontend Core

**Duración**: Semanas 6-8 (64 horas)

#### 3.1 Configuración Base del Frontend

**Estructura de carpetas**:

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── inventory/
│   │   │   ├── sales/
│   │   │   ├── customers/
│   │   │   └── reports/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   ├── layout/
│   │   ├── forms/
│   │   └── charts/
│   ├── lib/
│   │   ├── api.ts      # API client
│   │   ├── utils.ts
│   │   └── schemas/    # Zod schemas
│   ├── hooks/
│   └── types/
```

**Configuraciones**:

- Instalar y configurar shadcn/ui
- Configurar TanStack Query
- Configurar React Hook Form + Zod
- Configurar cliente API (fetch/axios)
- Configurar variables de entorno

---

#### 3.2 Layout y Navegación Global

**Componentes a crear**:

- `components/layout/sidebar.tsx` → Menú lateral con iconos
- `components/layout/header.tsx` → Barra superior
- `components/layout/dashboard-layout.tsx` → Layout principal
- `app/(dashboard)/layout.tsx` → Layout del dashboard

**Funcionalidades**:

- Menú lateral colapsable
- Navegación entre secciones
- Indicador de usuario logueado
- Botón de logout
- Responsive (menú hamburguesa en móvil)

---

#### 3.3 Módulo de Autenticación (Frontend)

**Páginas a crear**:

- `app/(auth)/login/page.tsx` → Pantalla de login

**Componentes**:

- `components/auth/login-form.tsx` → Formulario de login

**Funcionalidades**:

- Formulario con validación (email, password)
- Manejo de errores de autenticación
- Almacenamiento de token en localStorage/cookies
- Redirección automática a dashboard
- Protección de rutas privadas (middleware)

---

#### 3.4 Módulo de Inventario (Frontend)

**Páginas**:

- `app/(dashboard)/inventory/page.tsx` → Listado de productos
- `app/(dashboard)/inventory/[id]/page.tsx` → Detalle de producto
- `app/(dashboard)/inventory/categories/page.tsx` → Gestión de categorías

**Componentes**:

- `components/inventory/product-table.tsx` → Tabla de productos
- `components/inventory/product-form.tsx` → Formulario de producto
- `components/inventory/product-filters.tsx` → Filtros de búsqueda
- `components/inventory/category-manager.tsx` → Gestión de categorías
- `components/inventory/stock-badge.tsx` → Indicador de stock
- `components/inventory/image-upload.tsx` → Subida de imágenes

**Funcionalidades**:

- Listado con paginación
- Búsqueda por nombre, SKU, código de barras
- Filtros por categoría, rango de precios, stock
- Crear/Editar productos (modal)
- Subir imagen a Cloudinary
- Vista de detalle con historial de movimientos
- Indicadores visuales de stock bajo

---

#### 3.5 Módulo de Punto de Venta (Frontend)

**Páginas**:

- `app/(dashboard)/sales/pos/page.tsx` → Interfaz POS
- `app/(dashboard)/sales/page.tsx` → Historial de ventas
- `app/(dashboard)/sales/[id]/page.tsx` → Detalle de venta

**Componentes**:

- `components/pos/product-search.tsx` → Búsqueda de productos
- `components/pos/cart.tsx` → Carrito de compras
- `components/pos/cart-item.tsx` → Item del carrito
- `components/pos/payment-modal.tsx` → Modal de pago
- `components/pos/receipt.tsx` → Comprobante de venta (imprimible)
- `components/sales/sales-table.tsx` → Tabla de ventas

**Funcionalidades**:

- Búsqueda incremental de productos
- Agregar productos al carrito
- Modificar cantidades en carrito
- Aplicar descuentos a items o total
- Validación de stock disponible
- Selección de método de pago
- Cálculo automático de cambio
- Generación de comprobante (vista de impresión)
- Limitar cantidad al stock disponible

---

#### 3.6 Módulo de Clientes (Frontend)

**Páginas**:

- `app/(dashboard)/customers/page.tsx` → Listado de clientes
- `app/(dashboard)/customers/[id]/page.tsx` → Detalle y historial

**Componentes**:

- `components/customers/customer-table.tsx` → Tabla de clientes
- `components/customers/customer-form.tsx` → Formulario de cliente
- `components/customers/customer-purchases.tsx` → Historial de compras
- `components/customers/customer-badge.tsx` → Badge de segmento

**Funcionalidades**:

- Listado con búsqueda
- Crear/Editar clientes
- Vista de detalle con métricas
- Historial de compras del cliente
- Indicador de segmento (VIP, Frecuente, etc.)

---

#### 3.7 Módulo de Dashboard y Reportes (Frontend)

**Páginas**:

- `app/(dashboard)/page.tsx` → Dashboard principal
- `app/(dashboard)/reports/page.tsx` → Reportes detallados

**Componentes**:

- `components/dashboard/kpi-card.tsx` → Tarjeta de KPI
- `components/dashboard/sales-chart.tsx` → Gráfica de ventas
- `components/charts/bar-chart.tsx` → Gráfica de barras (Recharts)
- `components/charts/line-chart.tsx` → Gráfica de líneas
- `components/charts/pie-chart.tsx` → Gráfica circular
- `components/reports/date-range-picker.tsx` → Selector de fechas
- `components/reports/export-button.tsx` → Botón de exportación

**Funcionalidades**:

- KPIs destacados (ventas del día, del mes, # transacciones)
- Gráfica de ventas últimos 7/30 días
- Productos con stock bajo
- Reportes filtrables por fechas
- Visualización de datos en tablas y gráficas
- Exportación a PDF/Excel (opcional)

---

#### 3.8 Biblioteca de Componentes Reutilizables

**Componentes base (shadcn/ui)**:

- Button, Input, Label, Select
- Dialog (Modal), Alert, Badge
- Card, Table, Tabs
- Form, Checkbox, Radio Group

**Componentes custom**:

- Loading spinners
- Empty states
- Error boundaries
- Toast notifications
- Confirmación de acciones

---

#### Entregables Fase 3:

- ✅ Interfaz web responsive
- ✅ Todos los módulos funcionales integrados con backend
- ✅ Biblioteca de componentes UI documentada
- ✅ Sistema de navegación intuitivo

---

### FASE 4: Integración, Pruebas y Refinamiento

**Duración**: Semanas 9-10 (40 horas)

#### 4.1 Pruebas de Integración

**Flujos end-to-end a verificar**:

1. **Flujo de Venta Completa**:

   - Login → Dashboard → POS
   - Buscar productos → Agregar al carrito
   - Modificar cantidades → Aplicar descuento
   - Seleccionar método de pago → Confirmar venta
   - Verificar actualización de stock
   - Generar comprobante

2. **Flujo de Gestión de Inventario**:

   - Crear producto con imagen
   - Registrar movimiento de entrada
   - Verificar actualización de stock
   - Consultar historial de movimientos

3. **Flujo de Gestión de Clientes**:

   - Crear cliente
   - Realizar venta asociada a cliente
   - Consultar historial de compras del cliente

4. **Flujo de Reportes**:
   - Consultar dashboard con datos actuales
   - Filtrar ventas por rango de fechas
   - Visualizar productos más vendidos

#### 4.2 Corrección de Bugs

- Identificar y documentar bugs
- Priorizar bugs (críticos, mayores, menores)
- Corregir bugs críticos y mayoría de bugs menores
- Validar correcciones

#### 4.3 Refinamiento UX

- Mejorar mensajes de error
- Agregar indicadores de carga
- Optimizar flujos de interacción
- Mejorar accesibilidad (contraste, tamaños)
- Pulir animaciones y transiciones

#### 4.4 Generación de Comprobantes

- Diseñar plantilla HTML de comprobante
- Implementar función de impresión desde navegador
- Incluir logo, datos de venta, items, totales
- Vista previa antes de imprimir
- Opción para guardar como PDF

#### 4.5 Optimización de Rendimiento

- Agregar índices en base de datos
- Implementar paginación en listados
- Optimizar consultas con agregaciones
- Implementar caché con TanStack Query
- Lazy loading de imágenes
- Code splitting en frontend

#### Entregables Fase 4:

- ✅ Sistema completamente integrado sin errores críticos
- ✅ Reporte de pruebas documentado
- ✅ Bugs críticos corregidos
- ✅ Comprobantes de venta funcionales

---

### FASE 5: Validación y Despliegue

**Duración**: Semana 11 (20 horas)

#### 5.1 Despliegue en Producción

**Backend (Railway/Render)**:

1. Crear cuenta en Railway/Render
2. Crear servicio PostgreSQL
3. Aplicar migraciones en producción
4. Desplegar API de NestJS
5. Configurar variables de entorno
6. Configurar CORS para dominio de frontend
7. Verificar funcionamiento

**Frontend (Vercel)**:

1. Conectar repositorio GitHub con Vercel
2. Configurar variables de entorno (API URL)
3. Desplegar aplicación Next.js
4. Configurar dominio personalizado (opcional)
5. Verificar funcionamiento
6. Configurar redirecciones y headers

**Cloudinary**:

1. Configurar cuenta y API keys
2. Verificar subida de imágenes desde producción

#### 5.2 Validación con Usuarios

**Selección de usuarios de prueba**:

- 2-3 personas representativas de pequeños negocios
- Perfiles: dueño de negocio, cajero

**Escenarios de validación**:

1. Registrar 5 productos con imágenes
2. Crear 3 categorías
3. Realizar 10 ventas de prueba
4. Consultar reportes
5. Buscar productos en POS
6. Gestionar clientes

**Recopilación de feedback**:

- Observaciones de usabilidad
- Tiempos de respuesta percibidos
- Dificultades encontradas
- Sugerencias de mejora

#### 5.3 Ajustes Críticos

- Implementar mejoras urgentes basadas en feedback
- Corregir problemas de usabilidad evidentes
- Optimizar flujos problemáticos

#### Entregables Fase 5:

- ✅ Sistema desplegado en producción (URLs accesibles)
- ✅ Resultados de validación con usuarios
- ✅ Reporte de feedback
- ✅ Ajustes implementados

---

### FASE 6: Documentación Final

**Duración**: Semana 12 (20 horas)

#### 6.1 Manual de Usuario

**Contenido**:

- Introducción al sistema
- Cómo iniciar sesión
- Gestión de productos paso a paso
- Cómo realizar una venta
- Gestión de clientes
- Consulta de reportes
- Capturas de pantalla numeradas
- Resolución de problemas comunes

**Formato**: PDF, mínimo 15 páginas

#### 6.2 Documentación Técnica

**Contenido**:

- Arquitectura del sistema
- Decisiones de diseño
- Estructura de código
- Esquema de base de datos
- Endpoints de API (Swagger)
- Proceso de despliegue
- Variables de entorno necesarias
- Guía de contribución

**Formato**: PDF, mínimo 20 páginas

#### 6.3 Documento de Tesis

- Finalizar secciones pendientes
- Integrar resultados de pruebas
- Agregar capturas de pantalla
- Documentar hallazgos de validación
- Redactar conclusiones
- Revisar gramática y ortografía

#### 6.4 Presentación Final

**Contenido**:

- Problemática y motivación
- Objetivos del proyecto
- Arquitectura implementada
- Tecnologías utilizadas
- Funcionalidades principales (demos)
- Resultados de validación
- Conclusiones y trabajo futuro

**Formato**: PowerPoint/Google Slides, ~20 diapositivas

#### Entregables Fase 6:

- ✅ Manual de usuario (PDF)
- ✅ Documentación técnica (PDF)
- ✅ Documento de tesis definitivo
- ✅ Presentación preparada

---

## Matriz de Trazabilidad: Requerimientos → Implementación

### Requerimientos Funcionales Prioritarios (Alta)

| Código | Nombre                                | Módulo     | Fase      | Componentes Clave                          |
| ------ | ------------------------------------- | ---------- | --------- | ------------------------------------------ |
| RF01   | Autenticación y control de sesión     | Auth       | Fase 2    | AuthService, JWT Guard, Login Page         |
| RF02   | Gestión del catálogo de productos     | Inventario | Fase 2, 3 | ProductsService, ProductForm, ProductTable |
| RF03   | Registro de movimientos de inventario | Inventario | Fase 2, 3 | MovementsService, MovementForm             |
| RF05   | Procesamiento de venta en tiempo real | Ventas     | Fase 2, 3 | SalesService, POS Component, Cart          |
| RF06   | Gestión de métodos de pago            | Ventas     | Fase 2, 3 | PaymentModal, Sale calculation             |
| RF07   | Actualización automática de stock     | Ventas     | Fase 2    | SalesService (transaction)                 |
| RF15   | Búsqueda y filtrado avanzado          | Inventario | Fase 2, 3 | ProductSearch, Filters                     |
| RF16   | Aplicación de descuentos              | Ventas     | Fase 2, 3 | Cart discount logic                        |
| RF17   | Gestión del carrito de compras        | Ventas     | Fase 3    | Cart Component, state management           |

### Requerimientos Funcionales de Prioridad Media

| Código | Nombre                           | Módulo     | Fase      |
| ------ | -------------------------------- | ---------- | --------- |
| RF04   | Alertas de stock bajo            | Inventario | Fase 2, 3 |
| RF08   | Emisión de comprobantes          | Ventas     | Fase 4    |
| RF09   | Anulaciones y devoluciones       | Ventas     | Fase 2, 3 |
| RF10   | Gestión de clientes              | Clientes   | Fase 2, 3 |
| RF11   | Historial de compras por cliente | Clientes   | Fase 2, 3 |
| RF12   | Dashboard de indicadores         | Reportes   | Fase 2, 3 |
| RF13   | Gestión de categorías            | Inventario | Fase 2, 3 |
| RF14   | Gestión de imágenes              | Inventario | Fase 2, 3 |
| RF18   | Consulta de ventas por fechas    | Reportes   | Fase 2, 3 |
| RF21   | Productos más vendidos           | Reportes   | Fase 2, 3 |
| RF22   | Análisis de rentabilidad         | Reportes   | Fase 2, 3 |
| RF24   | Reporte de movimientos           | Reportes   | Fase 2, 3 |

### Requerimientos Funcionales de Prioridad Baja (Opcionales)

| Código | Nombre                          | Nota                      |
| ------ | ------------------------------- | ------------------------- |
| RF19   | Múltiples contactos por cliente | Implementar si hay tiempo |
| RF20   | Segmentación de clientes        | Implementar si hay tiempo |
| RF23   | Reporte por método de pago      | Implementar si hay tiempo |

### Requerimientos No Funcionales

| Código | Nombre                        | Implementación                 | Verificación              |
| ------ | ----------------------------- | ------------------------------ | ------------------------- |
| RNF01  | Protección de credenciales    | HTTPS, bcrypt, validación      | Pruebas de seguridad      |
| RNF02  | Control de acceso y sesiones  | JWT, Guards, roles             | Pruebas de autorización   |
| RNF03  | Rendimiento                   | Índices DB, paginación, caché  | Pruebas de carga          |
| RNF04  | Interfaz intuitiva            | Diseño UX, mensajes claros     | Validación con usuarios   |
| RNF05  | Adaptabilidad responsive      | Tailwind CSS responsive        | Pruebas en dispositivos   |
| RNF06  | Escalabilidad y modularidad   | Arquitectura por capas         | Pruebas de extensibilidad |
| RNF07  | Integridad transaccional      | Transacciones ACID, Prisma     | Pruebas de concurrencia   |
| RNF08  | Disponibilidad y recuperación | Plataforma PaaS, health checks | Pruebas de disponibilidad |
| RNF09  | Mantenibilidad                | Tests, documentación, Git      | Cobertura de pruebas      |
| RNF10  | Auditoría                     | AuditLog model, interceptors   | Pruebas de logging        |

---

## Plan de Verificación

### Verificación Automática

#### Pruebas Unitarias (Backend)

**Framework**: Jest

**Servicios a probar**:

- `AuthService`: login, validación de tokens
- `ProductsService`: CRUD, validaciones de unicidad
- `SalesService`: cálculos de totales, descuentos, impuestos
- `MovementsService`: actualización de stock
- `CustomersService`: validaciones de unicidad

**Comandos**:

```bash
cd backend
npm run test           # Ejecutar todas las pruebas
npm run test:cov       # Con cobertura
```

**Criterio de éxito**: ≥60% de cobertura en lógica de negocio

---

#### Pruebas de Integración (Backend)

**Framework**: Jest + Supertest

**Flujos a probar**:

- POST `/auth/login` → Login exitoso y fallido
- POST `/products` → Crear producto con validaciones
- POST `/sales` → Venta completa con actualización de stock
- GET `/reports/dashboard` → KPIs correctos

**Comandos**:

```bash
cd backend
npm run test:e2e
```

---

#### Pruebas End-to-End (Opcional)

**Framework**: Playwright

**Flujos a automatizar**:

- Login → Dashboard
- Crear producto → Verificar en listado
- Realizar venta → Verificar stock actualizado

**Comandos**:

```bash
cd frontend
npm run test:e2e
```

---

### Verificación Manual

#### Lista de Comprobación UX

**Autenticación**:

- [ ] Login con credenciales válidas redirige a dashboard
- [ ] Login con credenciales inválidas muestra error claro
- [ ] Sesión expira después de inactividad
- [ ] Logout cierra sesión correctamente

**Inventario**:

- [ ] Crear producto con todos los campos requeridos
- [ ] Subir imagen de producto (JPG, PNG)
- [ ] Editar producto actualiza datos inmediatamente
- [ ] Búsqueda incremental funciona mientras se escribe
- [ ] Filtros por categoría y precio funcionan correctamente
- [ ] Stock bajo se resalta visualmente
- [ ] Producto con ventas no se puede eliminar físicamente

**Punto de Venta**:

- [ ] Búsqueda de productos en POS es rápida (<2s)
- [ ] Agregar producto al carrito actualiza total
- [ ] Modificar cantidad valida stock disponible
- [ ] Aplicar descuento recalcula totales correctamente
- [ ] Pago en efectivo calcula cambio correcto
- [ ] Venta confirmada genera comprobante imprimible
- [ ] Stock se actualiza inmediatamente después de venta

**Clientes**:

- [ ] Crear cliente con documento único
- [ ] Documento duplicado muestra error
- [ ] Historial de compras muestra ventas del cliente
- [ ] Búsqueda de clientes funciona por nombre y documento

**Reportes**:

- [ ] Dashboard muestra KPIs actualizados
- [ ] Filtro por rango de fechas funciona correctamente
- [ ] Gráficas se renderizan sin errores
- [ ] Exportación a PDF/Excel funciona (si implementado)

**Responsive**:

- [ ] Dashboard se visualiza correctamente en 1280×720
- [ ] Dashboard se visualiza correctamente en 1920×1080
- [ ] Menú se colapsa en pantallas pequeñas
- [ ] Tablas tienen scroll horizontal cuando es necesario

**Rendimiento**:

- [ ] Login responde en <2 segundos
- [ ] Búsqueda de productos responde en <2 segundos
- [ ] Confirmar venta responde en <3 segundos
- [ ] Dashboard carga en <3 segundos

---

### Validación con Usuarios Reales

**Perfil de usuarios**: 2-3 dueños de pequeños negocios o cajeros

**Tareas a realizar**:

1. Registrar 5 productos con categorías e imágenes
2. Realizar 10 ventas de prueba con diferentes métodos de pago
3. Consultar el dashboard y reportes
4. Gestionar 5 clientes con sus datos
5. Buscar productos en el POS

**Métricas a capturar**:

- Tiempo para completar cada tarea
- Número de errores cometidos
- Satisfacción (escala 1-5)
- Comentarios y sugerencias

**Criterio de éxito**:

- Usuario completa venta en ≤5 pasos
- Usuario aprende el sistema en ≤30 minutos
- Satisfacción promedio ≥4/5

---

## Criterios de Éxito del Proyecto

### Criterios Técnicos

✅ **Arquitectura**:

- Sistema organizado en 3 capas (presentación, negocio, datos)
- Módulos claramente separados (auth, inventory, sales, customers, reports)
- Comunicación Frontend-Backend mediante API REST documentada

✅ **Funcionalidades**:

- [ implementados 24 requerimientos funcionales prioritarios (Alta y Media)
- Cumplimiento de 10 requerimientos no funcionales
- Sistema desplegado en producción accesible públicamente

✅ **Calidad de Código**:

- Cobertura de pruebas ≥60% en lógica de negocio
- Documentación de API completa en Swagger
- Código versionado en Git con commits descriptivos
- Convenciones de código (ESLint, Prettier) aplicadas

✅ **Rendimiento**:

- Login <2 segundos (95% de peticiones)
- Búsquedas <2 segundos (95% de peticiones)
- Reportes de 1 mes <5 segundos
- Disponibilidad ≥99%

✅ **Usabilidad**:

- Usuario nuevo aprende el sistema en ≤30 minutos
- Venta completa en ≤5 pasos interactivos
- Satisfacción de usuarios ≥4/5
- Interfaz responsive (1280×720 a 1920×1080)

### Criterios Académicos

✅ **Demostración de Competencias**:

- Diseño de arquitectura modular por capas
- Desarrollo full-stack (Frontend + Backend + Base de Datos)
- Implementación de API RESTful
- Gestión de proyectos (metodología iterativa)
- Testing automatizado
- Despliegue en producción

✅ **Documentación**:

- Documento de tesis completo
- Manual de usuario (≥15 páginas)
- Documentación técnica (≥20 páginas)
- Presentación final (~20 diapositivas)

---

## Riesgos y Mitigaciones

| Riesgo                                              | Probabilidad | Impacto | Mitigación                                           |
| --------------------------------------------------- | ------------ | ------- | ---------------------------------------------------- |
| Retrasos en desarrollo por complejidad técnica      | Media        | Alto    | Priorizar funcionalidades esenciales, MVP first      |
| Problemas de integración Frontend-Backend           | Media        | Medio   | Testing temprano desde semana 3                      |
| Dificultades con despliegue en producción           | Baja         | Alto    | Usar plataformas PaaS (Vercel, Railway)              |
| Usuarios de validación no disponibles               | Media        | Medio   | Preparar plan B con colegas o familiares             |
| Pérdida de datos durante desarrollo                 | Baja         | Alto    | Backups diarios, Git frecuente                       |
| Scope creep (agregar funcionalidades no esenciales) | Alta         | Medio   | Adherirse estrictamente al MVP, lista de prioridades |

---

## Próximos Pasos Inmediatos

1. **Revisar y aprobar este plan** con el director de tesis
2. **Iniciar Fase 1**: Configuración de proyectos y diseño
3. **Crear repositorio Git** con estructura base
4. **Diseñar wireframes** en Figma
5. **Definir schema de Prisma** detallado
6. **Comenzar desarrollo del backend** (Fase 2)

---

## Recursos y Referencias

### Documentación Oficial

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

### Tutoriales y Guías

- Arquitectura por capas en NestJS
- Autenticación JWT en NestJS
- Server Components en Next.js
- Optimización de consultas con Prisma
- Despliegue en Vercel y Railway

---

## Contacto y Soporte

- **Desarrollador**: Santiago Enrique Villabona Aponte
- **Director de Tesis**: Ing. Danith Patricia Solorzano Escobar
- **Institución**: Universidad Pontificia Bolivariana - Bucaramanga
- **Programa**: Ingeniería de Sistemas e Informática
