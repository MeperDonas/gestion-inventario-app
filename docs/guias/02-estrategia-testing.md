# Estrategia de Testing

Este documento define los lineamientos y expectativas para el aseguramiento de la calidad del código mediante pruebas automatizadas en nuestro ecosistema.

## 1. Filosofía de Testing

Nuestro enfoque prioriza la confianza en el sistema y la refactorización segura. Nos adherimos a la pirámide de pruebas, concentrando el mayor volumen en pruebas unitarias rápidas y confiables, seguidas por pruebas de integración y E2E críticas.

---

## 2. Backend (NestJS + Jest)

El backend es el motor transaccional del sistema. Su estabilidad es innegociable.

### Herramientas
- **Jest**: Framework principal de testing.
- **Supertest**: Utilizado para pruebas de integración y End-to-End (E2E) sobre los controladores de HTTP.

### ¿Qué se debe testear?

1. **Casos de Uso (Services):**
   - **Enfoque:** Pruebas unitarias exhaustivas aislando las dependencias.
   - **Mocks:** El `PrismaService` y otros servicios externos (como Cloudinary) **deben** ser mockeados.
   - **Qué validar:** Lógica de negocio (ej. validación de roles, cálculo de totales de venta, optimismo de concurrencia en productos usando el campo `version`).

2. **Controladores:**
   - **Enfoque:** Validar que el ruteo, los DTOs, la serialización y el manejo de excepciones (HTTP Status Codes) funcionan correctamente.
   - **Nota:** Las pruebas de validación con `class-validator` suelen requerir montar un contexto de prueba de NestJS (Test.createTestingModule).

3. **Guards y Estrategias (Auth):**
   - **Enfoque:** Verificar que el `JwtAuthGuard` y el sistema de roles (`ADMIN`, `CASHIER`, `INVENTORY_USER`) bloqueen los accesos indebidos de manera estricta.

### Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas unitarias
npm run test

# Ejecutar pruebas para un archivo específico
npm run test -- --testPathPattern=products.service.spec.ts

# Ejecutar pruebas End-to-End
npm run test:e2e
```

---

## 3. Frontend (Next.js + React)

El frontend requiere un balance entre la experiencia de usuario interactiva y la gestión correcta del estado del servidor.

### ¿Qué se debe testear?

1. **Hooks Personalizados (Ej. `hooks/api/*`):**
   - **Enfoque:** Al abstraer `React Query`, los hooks contienen la lógica de mutación, invalidación de caché y llamadas a la API (`lib/api.ts`).
   - **Mocks:** Interceptar las peticiones de red usando herramientas como `MSW` (Mock Service Worker) o realizando mocks del cliente Axios.

2. **Componentes UI (Design System):**
   - **Enfoque:** Componentes puros (`Button`, `Input`, `Modal`) deben contar con pruebas de snapshot y pruebas de comportamiento usando `React Testing Library`.
   - **Qué validar:** Renderizado correcto de propiedades condicionales (ej. clases de Tailwind unidas con `cn()`), estados de deshabilitado y callbacks de eventos de usuario (`onClick`, `onChange`).

3. **Módulo POS (Punto de Venta):**
   - Es el componente más crítico del cliente. Se debe testear la persistencia del carrito en estado local, cálculos en el cliente y validación de cobro múltiple (CASH/CARD/TRANSFER) antes de enviar el payload al backend.

---

## 4. Integración Continua (CI)

En el pipeline de CI/CD (GitHub Actions/GitLab CI), se espera el siguiente comportamiento innegociable:
- **Build Pass:** Ambos proyectos deben compilar sin advertencias (`npm run build`).
- **Linter Check:** No se permiten commits que no pasen las reglas de `ESLint` (`npm run lint`).
- **Tests Pasan:** Todos los tests automatizados (`unit` y `e2e`) deben ejecutarse y ser exitosos. Una falla en las pruebas bloqueará automáticamente la posibilidad de fusionar un Pull Request.

**Regla de Oro:** "Todo código nuevo o refactorizado debe ir acompañado de sus respectivas pruebas."
