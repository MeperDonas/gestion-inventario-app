# Patrones de Arquitectura Backend (NestJS)

Nuestro backend es una API robusta construida con **NestJS 11** y **Prisma 6**, operando sobre PostgreSQL. Este documento define los patrones arquitectónicos y las reglas inquebrantables de desarrollo en esta capa.

## 1. Modularización y Dominio

El proyecto sigue una estructura altamente modular, donde cada carpeta dentro de `src/` representa un dominio acotado de negocio.

### Módulos Principales:
- `auth/`: Autenticación, generación de tokens (JWT), Guards y estrategias.
- `products/`: Entidades de producto. Consta de dos controladores: `products.controller.ts` para CRUD estándar y `products-search.controller.ts` para búsquedas, alertas de bajo stock, etc.
- `sales/`: Orquestación de ventas y control de pagos divididos (Efectivo/Tarjeta/Transferencia).
- `categories/`, `customers/`, `reports/`, `settings/`, `exports/`: Soporte transversal a las operaciones de la tienda.
- `prisma/` y `cloudinary/`: Módulos de infraestructura transversales.

**Regla de dependencia:** Un módulo solo debe importar otro módulo si existe una dependencia real del negocio. Evita las importaciones circulares exponiendo únicamente los servicios necesarios a través de los arreglos `exports` del `@Module()`.

---

## 2. Inyección de Dependencias y Prisma

Utilizamos el patrón **Singleton** para el cliente de base de datos a través del módulo `PrismaModule`.

- **PrismaService**: Es la única puerta de entrada a la base de datos PostgreSQL. Este servicio debe inyectarse en los constructores de los distintos servicios de negocio.
- **Transacciones**: Operaciones complejas (como generar una venta que descuenta stock, crea el registro de venta y el movimiento de inventario) **DEBEN** ejecutarse utilizando transacciones interactivas de Prisma (`prisma.$transaction`).

---

## 3. Validación de Entrada (DTOs)

Nunca confiamos en los datos que provienen del cliente. Toda solicitud que modifique el estado (POST, PUT, PATCH) debe ser parseada y validada estrictamente.

- **Data Transfer Objects (DTOs)**: Definidos usando clases.
- **class-validator / class-transformer**: Utilizamos los decoradores de estas librerías (ej. `@IsString()`, `@IsOptional()`, `@IsPositive()`).
- **Global ValidationPipe**: Está activado globalmente en `main.ts`, con `whitelist: true` (remueve propiedades no declaradas) y `transform: true` (auto-casting de tipos).

---

## 4. Autenticación, Autorización y Roles

El sistema implementa seguridad basada en JSON Web Tokens (JWT).

- **Flujo JWT**: El token viaja en el header `Authorization: Bearer <token>`.
- **JwtStrategy**: Valida la firma del token en cada request.
- **JwtAuthGuard**: Aplicado globalmente o por ruta vía `@UseGuards(JwtAuthGuard)`. Todo endpoint es privado por defecto a menos que se indique lo contrario.
- **Roles de Usuario**: Existen 3 niveles estrictos:
  1. `ADMIN`: Acceso total (Configuración de sistema, borrado de datos sensibles).
  2. `CASHIER`: Centrado en el módulo POS, Ventas y consulta de inventario.
  3. `INVENTORY_USER`: Centrado en creación y mantenimiento de productos.
  *Se hace uso de decoradores personalizados (ej. `@Roles()`) combinados con Guards de roles para validar permisos en el nivel del controlador.*

---

## 5. Prevención de Condiciones de Carrera (Concurrency)

El inventario es el corazón del sistema, por ende las lecturas/escrituras deben ser atómicas y seguras frente a la concurrencia.

- **Optimistic Concurrency Control**: El modelo `Product` posee un campo `version`. En las transacciones de actualización crítica (ej. al restar stock tras una venta), validamos que la versión enviada coincida con la de la BD. Si falla, el sistema devuelve un error indicando que el registro ha sido modificado por otro proceso.

---

## 6. Estandarización de Endpoints y Errores

- **Global Prefix**: Todos los endpoints exponen la ruta bajo `/api` (configurado en `main.ts`).
- **Control de Excepciones**: Utiliza siempre las excepciones nativas de NestJS (`NotFoundException`, `BadRequestException`, `UnauthorizedException`). El framework se encarga de serializarlas con el status HTTP correspondiente. No devuelvas objetos de error genéricos; deja que el filtro de excepciones global actúe de manera uniforme.
