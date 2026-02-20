# 📚 Índice de Diagramas UML

Sistema de Gestión de Inventario y Punto de Venta

---

## 📂 Estructura de Diagramas

Los diagramas están organizados en tres categorías principales:

```
docs/diagramas-uml/
├── casos-de-uso/          # Diagramas de casos de uso por módulo
├── componentes/           # Diagramas de componentes del backend
└── secuencias/           # Diagramas de secuencia de flujos principales
```

---

## 🎯 Diagramas de Casos de Uso

**Ubicación:** `docs/diagramas-uml/casos-de-uso/`

| Archivo | Módulo | Descripción |
|---------|--------|-------------|
| [modulo-auth.puml](./casos-de-uso/modulo-auth.puml) | Autenticación | Login, registro, recuperación de contraseña |
| [modulo-productos.puml](./casos-de-uso/modulo-productos.puml) | Productos | CRUD de productos, gestión de stock |
| [modulo-categorias.puml](./casos-de-uso/modulo-categorias.puml) | Categorías | Organización de productos |
| [modulo-clientes.puml](./casos-de-uso/modulo-clientes.puml) | Clientes | Gestión de clientes y fidelización |
| [modulo-ventas.puml](./casos-de-uso/modulo-ventas.puml) | Ventas/POS | Procesamiento de ventas y pagos |
| [modulo-reportes.puml](./casos-de-uso/modulo-reportes.puml) | Reportes | Estadísticas y análisis |
| [modulo-configuracion.puml](./casos-de-uso/modulo-configuracion.puml) | Configuración | Ajustes del sistema |

**Documentación:** [README.md](./casos-de-uso/README.md)

### Actores del Sistema
- **👤 Administrador**: Acceso total (CRUD en todos los módulos)
- **💼 Cajero**: Procesamiento de ventas y atención al cliente
- **📦 Usuario de Inventario**: Gestión de productos y stock

---

## 🏗️ Diagramas de Componentes

**Ubicación:** `docs/diagramas-uml/componentes/`

| Archivo | Módulo | Descripción |
|---------|--------|-------------|
| [modulo-auth.puml](./componentes/modulo-auth.puml) | Autenticación | JWT, Guards, Estrategias |
| [modulo-productos.puml](./componentes/modulo-productos.puml) | Productos | Controllers, Services, Cloudinary |
| [modulo-categorias.puml](./componentes/modulo-categorias.puml) | Categorías | Gestión de categorías |
| [modulo-clientes.puml](./componentes/modulo-clientes.puml) | Clientes | CRUD de clientes |
| [modulo-ventas.puml](./componentes/modulo-ventas.puml) | Ventas/POS | Transacciones ACID, Auditoría |
| [modulo-reportes.puml](./componentes/modulo-reportes.puml) | Reportes | Agregaciones y estadísticas |
| [modulo-exportaciones.puml](./componentes/modulo-exportaciones.puml) | Exportaciones | PDF, Excel, CSV |
| [modulo-configuracion.puml](./componentes/modulo-configuracion.puml) | Configuración | Settings y usuarios |

**Documentación:** [README.md](./componentes/README.md)

### Arquitectura Backend (NestJS)
```
Módulos
├── Controllers (API REST)
├── Services (Lógica de negocio)
├── DTOs (Validación de datos)
├── Guards (Seguridad)
└── Interceptors (Auditoría)
```

---

## 🔄 Diagramas de Secuencia

**Ubicación:** `docs/diagramas-uml/secuencias/`

| Archivo | Flujo | Descripción |
|---------|-------|-------------|
| [flujo-venta.puml](./secuencias/flujo-venta.puml) | Venta POS | Proceso completo de venta con transacción ACID |
| [flujo-autenticacion.puml](./secuencias/flujo-autenticacion.puml) | Autenticación | Login, JWT, roles y permisos |
| [flujo-gestion-productos.puml](./secuencias/flujo-gestion-productos.puml) | Productos | CRUD y gestión de imágenes |
| [flujo-reporte-ventas.puml](./secuencias/flujo-reporte-ventas.puml) | Reportes | Dashboard y exportaciones |
| [flujo-gestion-usuarios.puml](./secuencias/flujo-gestion-usuarios.puml) | Usuarios | Gestión de usuarios y roles |

**Documentación:** [README.md](./secuencias/README.md)

---

## 🚀 Cómo Usar los Diagramas

### Visualización Online

#### Opción 1: PlantUML Server
1. Visita [www.plantuml.com/plantuml](http://www.plantuml.com/plantuml)
2. Copia el contenido del archivo `.puml`
3. Pega en el editor
4. El diagrama se genera automáticamente

#### Opción 2: PlantText
1. Visita [www.planttext.com](https://www.planttext.com/)
2. Pega el código PlantUML
3. Descarga como PNG, SVG o PDF

### Visualización Local

#### VS Code
1. Instala la extensión **"PlantUML"** (jebbs)
2. Abre cualquier archivo `.puml`
3. Presiona `Alt+D` (Windows/Linux) o `Option+D` (Mac)
4. La vista previa se muestra en tiempo real

#### Intellij IDEA / WebStorm
1. Instala el plugin **"PlantUML integration"**
2. Abre el archivo `.puml`
3. El diagrama se renderiza automáticamente

### Exportar Imágenes

Desde VS Code con PlantUML:
```bash
# Exportar a PNG
F1 → PlantUML: Export Current File Diagrams → png

# Exportar a SVG
F1 → PlantUML: Export Current File Diagrams → svg

# Exportar a PDF
F1 → PlantUML: Export Current File Diagrams → pdf
```

---

## 🎨 Convenciones UML Utilizadas

### Casos de Uso
- **Actores**: Representan usuarios del sistema
- **Caso de Uso**: Funcionalidad del sistema (óvalo)
- **Asociación**: Relación actor-caso de uso
- **<<include>>**: Relación obligatoria
- **<<extend>>**: Relación opcional

### Componentes
- **Rectángulos**: Componentes del sistema
- **Interfaces**: Puntos de conexión (círculos)
- **Dependencias**: Flechas entre componentes
- **Base de datos**: Cilindros

### Secuencias
- **Líneas de vida**: Participantes en el tiempo
- **Mensajes**: Llamadas entre participantes
- **Activaciones**: Período de procesamiento
- **Fragmentos**: Alt, opt, loop, par

---

## 📊 Módulos del Sistema

### Backend (NestJS)
```
src/
├── auth/              # Autenticación JWT
├── products/          # Gestión de productos
├── categories/        # Categorías
├── customers/         # Clientes
├── sales/            # Ventas y POS
├── reports/          # Reportes
├── exports/          # Exportaciones
├── settings/         # Configuración
├── cloudinary/       # Almacenamiento de imágenes
└── common/           # Guards, Interceptors, Decorators
```

### Frontend (Next.js)
```
src/
├── app/              # Páginas (App Router)
├── components/       # Componentes React
├── hooks/           # Custom hooks
├── contexts/        # React Contexts
├── lib/             # Utilidades
└── types/           # Tipos TypeScript
```

---

## 🔗 Relaciones entre Diagramas

```
Casos de Uso          Componentes           Secuencias
     │                      │                      │
     ├─ Autenticación ─────├─ AuthModule ────────├─ Login
     │                      │                      │
     ├─ Productos ─────────├─ ProductsModule ────├─ Gestión Productos
     │                      │                      │
     ├─ Ventas ────────────├─ SalesModule ───────├─ Procesar Venta
     │                      │                      │
     ├─ Reportes ──────────├─ ReportsModule ─────├─ Generar Reportes
     │                      │                      │
     └─ Configuración ─────├─ SettingsModule ────├─ Gestión Usuarios
```

---

## 📝 Glosario

| Término | Descripción |
|---------|-------------|
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **CRUD** | Create, Read, Update, Delete |
| **DTO** | Data Transfer Object |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping (Prisma) |
| **POS** | Point of Sale (Punto de Venta) |
| **REST** | Representational State Transfer |
| **UML** | Unified Modeling Language |

---

## 📞 Soporte

Para más información sobre el proyecto, consulta:
- [Guía Maestra del Proyecto](../guia-maestra-proyecto.md)
- [Diagrama de Casos de Uso General](../diagrama-casos-de-uso.md)
- [Diagrama de Componentes General](../diagrama-de-componentes.md)

---

*Documentación generada para el proyecto de Sistema de Gestión de Inventario y Punto de Venta*

**Versión:** 1.0  
**Fecha:** 2026-02-05  
**Tecnologías:** PlantUML, NestJS, Next.js, PostgreSQL
