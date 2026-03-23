# Flujo Git y Convenciones

Para mantener un historial limpio, trazable y profesional, el equipo sigue lineamientos estrictos para el versionado de código y la creación de contribuciones (Pull Requests).

## 1. Estrategia de Ramas (Branching)

Utilizamos una adaptación ágil de Git Flow basada en GitHub Flow:

- `main`: Es la rama base, **siempre estable y desplegable**. Está protegida; nadie puede hacer push directo a esta rama.
- `feat/nombre-funcionalidad`: Ramas para el desarrollo de nuevas características.
- `fix/nombre-del-bug`: Ramas exclusivas para la resolución de errores detectados.
- `chore/tarea-mantenimiento`: Ramas para tareas operativas (actualización de dependencias, configuración de herramientas, refactorizaciones que no alteran comportamiento).
- `docs/documentacion`: Ramas para añadir o actualizar documentación.

### Flujo de trabajo estándar:
1. Asegurarse de tener la versión más reciente de `main` (`git pull origin main`).
2. Crear una nueva rama desde `main` (`git checkout -b feat/nueva-funcionalidad`).
3. Desarrollar, crear commits convencionales y subir la rama (`git push -u origin HEAD`).
4. Abrir un Pull Request apuntando a `main`.

---

## 2. Conventional Commits

Todo mensaje de commit en este repositorio **debe** seguir el estándar de [Conventional Commits](https://www.conventionalcommits.org/). Esto facilita la lectura del historial y la automatización de changelogs.

### Estructura
```
<tipo>[scope opcional]: <descripción corta en imperativo>

[cuerpo opcional detallando el porqué del cambio]
```

### Tipos Permitidos:
- `feat`: Una nueva característica (ej. nuevo endpoint o nueva pantalla).
- `fix`: Resolución de un bug.
- `docs`: Cambios exclusivos en la documentación.
- `style`: Cambios que no afectan el significado del código (espacios, formateo, punto y coma).
- `refactor`: Un cambio en el código que no corrige un bug ni añade una funcionalidad.
- `perf`: Un cambio que mejora el rendimiento.
- `test`: Añadir pruebas faltantes o corregir pruebas existentes.
- `chore`: Cambios en el proceso de build, herramientas auxiliares o dependencias.

### Ejemplos Correctos:
✅ `feat(auth): implementar protección de rutas por roles`
✅ `fix(pos): corregir cálculo de impuestos en carrito mixto`
✅ `refactor(ui): migrar componentes comunes a shadcn/ui`

### Ejemplos Incorrectos:
❌ `arreglando cosas del pos`
❌ `update`
❌ `Fix bug en el login` (no usa el formato convencional)

> **⚠️ REGLA CRÍTICA PARA ASISTENTES AI**: **NUNCA** agregues "Co-Authored-By" u otra atribución a los mensajes de commit. Se debe utilizar estrictamente el formato convencional y nada más.

---

## 3. Reglas de los Pull Requests (PRs)

Un Pull Request es el mecanismo para someter a revisión tu código. 

1. **Tamaño:** Mantenlos pequeños y enfocados (idealmente menos de 400 líneas de código cambiado). Si un PR es muy grande, divídelo en entregas más pequeñas.
2. **Título:** El título del PR debe usar el formato de Conventional Commits (ya que se utilizará como mensaje del "Squash and Merge").
3. **Descripción:** Todo PR debe incluir una descripción clara explicando **qué** soluciona y **por qué** se tomó el enfoque elegido.
4. **Revisión:** Todo PR requiere la aprobación de al menos otro desarrollador (Code Review).
5. **CI/CD:** El PR debe pasar de forma exitosa todas las validaciones automáticas (Linters, Tests y Build) antes de ser fusionado.

### Política de Fusión
Al aceptar un PR, utilizamos la estrategia **Squash and Merge**. Esto significa que todos los commits de la rama se compactan en un único commit en `main`. Por esto, el título del PR es vital, ya que será el que quede en el historial principal.
