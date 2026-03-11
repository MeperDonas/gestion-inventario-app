# Runbook de Despliegue y Operacion en Produccion

**Proyecto:** Sistema de Gestion de Inventario + POS  
**Stack:** Next.js (Vercel) + NestJS/Prisma (Railway) + Supabase Postgres  
**Ultima actualizacion:** 2026-03-11

---

## 1. Objetivo y Alcance

Este documento define el proceso oficial para:

- Desplegar el sistema en produccion.
- Operar de forma segura con cambios de frontend, backend y base de datos.
- Publicar nuevas features, fixes de bugs y hotfixes sin romper produccion.
- Resolver incidentes comunes de configuracion, conexion y autenticacion.

Este runbook aplica a todo el equipo tecnico (desarrollo y operacion).

---

## 2. Arquitectura de Produccion

- **Frontend (Vercel):** sirve la aplicacion Next.js.
- **Backend (Railway):** ejecuta NestJS, expone `/api`, `/api/health`, `/api/docs`.
- **Base de datos (Supabase):** Postgres administrado.
- **ORM y migraciones (Prisma):** `prebuild` ejecuta `prisma generate` + `prisma migrate deploy`.
- **Imagenes (Cloudinary):** almacenamiento externo para assets de producto.

### Flujo de trafico

1. Usuario entra a Vercel.
2. Frontend consume API en Railway (`NEXT_PUBLIC_API_URL`).
3. Backend se conecta a Supabase con:
   - `DATABASE_URL` (pooler session, runtime).
   - `DIRECT_URL` (conexion usada por Prisma para migraciones; en entornos con limitaciones de red puede usarse temporalmente pooler).

---

## 3. Variables de Entorno Obligatorias

### 3.1 Railway (backend)

| Variable | Requerida | Ejemplo / Notas |
|---|---|---|
| `DATABASE_URL` | Si | `postgresql://postgres.<project_ref>:<password>@aws-...pooler.supabase.com:5432/postgres` |
| `DIRECT_URL` | Si | Preferido: `db.<project_ref>.supabase.co:5432`. Workaround: mismo valor de `DATABASE_URL` |
| `JWT_SECRET` | Si | Generar con `openssl rand -hex 32` |
| `NODE_ENV` | Si | `production` |
| `CORS_ORIGIN` | Si | URL(s) frontend reales, separadas por coma, sin espacios |
| `CLOUDINARY_CLOUD_NAME` | Si (si hay imagenes) | Valor de cuenta Cloudinary |
| `CLOUDINARY_API_KEY` | Si (si hay imagenes) | Valor de cuenta Cloudinary |
| `CLOUDINARY_API_SECRET` | Si (si hay imagenes) | Valor de cuenta Cloudinary |

**Nota:** no definir `PORT` en Railway (Railway lo inyecta automaticamente).

### 3.2 Vercel (frontend)

| Variable | Requerida | Ejemplo / Notas |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Si | `https://<tu-backend>.up.railway.app/api` |

**Regla:** cualquier cambio en env vars de Vercel requiere nuevo deploy para reflejarse en build.

---

## 4. Despliegue Inicial (One-Time Setup)

### 4.1 Supabase

1. Crear proyecto Supabase.
2. Obtener connection strings:
   - Pooler session.
   - Direct connection.
3. Configurar variables en Railway (`DATABASE_URL`, `DIRECT_URL`).
4. Ejecutar migraciones y seed desde entorno conectado:

```bash
railway run npx prisma migrate deploy
railway run npm run seed
```

5. Verificar tablas en Supabase (`User`, `Product`, `Category`, `Settings`, `Sale`, etc.).

### 4.2 Railway

1. Root directory: `backend`.
2. Start command: `npm run start:prod`.
3. Health check path: `/api/health`.
4. Confirmar deploy sin errores.

### 4.3 Vercel

1. Root directory: `frontend`.
2. Configurar `NEXT_PUBLIC_API_URL`.
3. Deploy y validar carga de aplicacion.

### 4.4 Integracion final

1. Configurar `CORS_ORIGIN` en Railway con dominio de Vercel.
2. Redeploy backend.
3. Verificar flujo E2E.

---

## 5. Checklist de Go-Live

- [ ] `GET /api/health` responde `status: ok` y `database: connected`.
- [ ] `GET /api/docs` disponible.
- [ ] Frontend en Vercel carga sin errores JS.
- [ ] Login funciona con usuarios seed o usuarios reales.
- [ ] Inventario y POS operativos.
- [ ] `CORS_ORIGIN` sin localhost en produccion.
- [ ] Spend limit configurado en Railway.
- [ ] Secretos almacenados fuera de git.

---

## 6. Flujo Estandar para Subir Cambios a Produccion

### 6.1 Tipos de cambio

- **Frontend-only:** cambios en `frontend/` sin API ni DB.
- **Backend-only:** cambios en `backend/src/` sin schema Prisma.
- **Backend + DB:** cambios en `schema.prisma` con migracion.
- **Config-only:** variables o ajustes de infraestructura.

### 6.2 Rama y PR

1. Crear rama:

```bash
git checkout -b feature/<nombre>
```

2. Implementar y testear local.
3. Abrir PR con descripcion clara (que cambia, por que, impacto).
4. Merge a `main/master` solo con checks minimos en verde.

### 6.3 Pre-release local (minimo)

### Backend

```bash
npm run prebuild && npm run build
npm run start:prod
```

Validar:

- `GET http://localhost:3001/api`
- `GET http://localhost:3001/api/health`

### Frontend

```bash
npm run build
```

### 6.4 Release en produccion

- Push/merge dispara deploy automatico en Railway y Vercel.
- Prisma aplica migraciones en `prebuild` del backend.
- Ejecutar smoke test post-deploy (seccion 9).

---

## 7. Guia de Buenas Practicas para Features y Bugfixes

### 7.1 Features nuevas

- Definir alcance pequeno y entregable (MVP por iteracion).
- Documentar contrato API si se toca backend.
- Mantener compatibilidad hacia atras cuando sea posible.
- Si cambia DB, incluir migracion Prisma versionada.
- Agregar validaciones y manejo de errores de negocio.
- Verificar impacto en roles (`ADMIN`, `CASHIER`, `INVENTORY_USER`).

### 7.2 Bugfixes

- Reproducir bug con pasos concretos antes de corregir.
- Aplicar fix minimo y seguro (evitar refactors grandes en bugfix).
- Probar regression en flujo afectado y flujo vecino.
- Dejar evidencia en PR (causa raiz + validacion del fix).

### 7.3 Hotfixes de produccion

- Crear rama `hotfix/<descripcion>` desde `main/master`.
- Corregir solo lo critico.
- Deploy inmediato.
- Postmortem corto: causa raiz, prevencion, accion follow-up.

### 7.4 Convenciones de calidad

- Commits atomicos y con mensaje semantico (`feat`, `fix`, `chore`, `docs`).
- No mezclar cambios de infraestructura con cambios funcionales sin necesidad.
- Evitar secretos en codigo, commits o PR.
- Mantener `.env.example` actualizado cuando cambien variables.

---

## 8. Cambios con Base de Datos (Prisma + Supabase)

### 8.1 Flujo recomendado

1. Actualizar `backend/prisma/schema.prisma`.
2. Crear migracion local:

```bash
npx prisma migrate dev --name <descripcion>
```

3. Validar migracion en local y tests relacionados.
4. Commit de schema + carpeta de migracion.
5. En deploy, `prisma migrate deploy` aplica cambios en produccion.

### 8.2 Reglas importantes

- Nunca editar manualmente migraciones ya aplicadas en produccion.
- Evitar cambios destructivos sin plan de rollback.
- Si hay que renombrar o transformar datos, preferir migraciones graduales.
- Para incidentes de schema, preferir **forward-fix** (nueva migracion) sobre rollback manual agresivo.

---

## 9. Smoke Test Post-Deploy (Obligatorio)

### 9.1 Backend

- [ ] `GET /api/health` OK.
- [ ] `GET /api/docs` accesible.
- [ ] Logs sin errores repetitivos en Railway.

### 9.2 Frontend

- [ ] Login exitoso.
- [ ] Dashboard carga datos.
- [ ] Productos listan sin error.
- [ ] POS permite crear una venta.
- [ ] Reportes y clientes responden.

### 9.3 Integracion

- [ ] Sin errores CORS.
- [ ] Sin errores 401/500 inesperados.
- [ ] Datos se reflejan en Supabase.

---

## 10. Troubleshooting Rapido

### 10.1 `Configuration key "JWT_SECRET" does not exist`

**Causa:** falta variable en Railway.  
**Accion:** agregar `JWT_SECRET` en Railway y redeploy.

### 10.2 `P1000 Authentication failed`

**Causa:** credenciales invalidas en `DATABASE_URL`/`DIRECT_URL`.  
**Accion:**

- Validar usuario correcto en pooler (`postgres.<project_ref>`).
- Verificar password real y URL encoding de caracteres especiales.
- Reemplazar variables y redeploy.

### 10.3 `P1001 Can't reach database server`

**Causa:** conectividad al host de DB.  
**Accion:**

- Validar host/puerto de URL.
- Usar pooler session para destrabar despliegue si direct no es alcanzable.
- Reintentar migracion desde entorno con conectividad valida.

### 10.4 CORS bloqueando frontend

**Causa:** `CORS_ORIGIN` incorrecto o incompleto.  
**Accion:**

- Setear URL exacta de Vercel en Railway.
- Si hay varios dominios, separarlos por coma.
- Redeploy backend.

### 10.5 Backend inicia con `npm start` en vez de produccion

**Causa:** start command por defecto no ajustado.  
**Accion:** en Railway, definir `npm run start:prod`.

---

## 11. Rollback y Recuperacion

### 11.1 Rollback de aplicacion

- Revertir commit en GitHub.
- Trigger de nuevo deploy en Railway/Vercel.
- Verificar smoke test.

### 11.2 Rollback de base de datos

- Evitar rollback manual directo salvo emergencia critica.
- Preferir migracion correctiva (forward-fix).
- Si se requiere restauracion completa, usar backup/snapshot de Supabase.

---

## 12. Control de Costos y Operacion Continua

- Configurar spend limit en Railway (Workspace -> Billing).
- Evitar redeploys innecesarios en ramas de prueba.
- Mantener Supabase y Railway con monitoreo basico de estado.
- Revisar consumo y logs de error al menos semanalmente.

---

## 13. Referencias Internas

- `docs/plans/2026-03-05-deployment-design.md`
- `docs/plans/2026-03-06-deployment-implementation.md`
- `backend/.env.example`
- `frontend/.env.example`
