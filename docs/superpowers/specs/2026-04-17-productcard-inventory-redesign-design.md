# Rediseño — `ProductCard` modo `inventory`

**Fecha**: 2026-04-17
**Alcance**: Rediseño visual completo de la rama `mode === "inventory"` del componente `ProductCard`. No se toca la rama `mode === "pos"` ni la API pública del componente.
**Archivo único afectado**: `frontend/src/components/products/ProductCard.tsx`.

---

## 1. Contexto y problema

La `ProductCard` en modo `inventory` (usada en `frontend/src/app/inventory/page.tsx`) presenta seis problemas de fondo:

1. **Rompe el sistema de temas.** Usa colores hex hardcodeados (`#23201E`, `#18181c`, `#26181b`, `#17231c`, `#18181d`, `#707070`, `#808080`, `#F4F1EE`) en lugar de tokens CSS (`bg-card`, `bg-muted`, `text-foreground`, etc.). Resultado: la card se ve oscura incluso en modo claro, peleando con la paleta real (`--background: #FAF8F5` / `--card: #FFFFFF` en claro; `#1A1917` / `#242220` en oscuro).
2. **Fuente fantasma.** Referencia `[font-family:var(--font-dm-sans)]` pero en `globals.css` solo están cargadas `--font-manrope` y `--font-jetbrains-mono`. La variable no existe, cae al fallback silenciosamente.
3. **Información duplicada.** La categoría se muestra sobre la imagen Y debajo junto al precio. El SKU también ocupa espacio en la banda inferior siendo un dato técnico que vive mejor en el modal.
4. **Radios asimétricos.** Combina `rounded-t-[18px] rounded-b-[4px]`, `rounded-bl-[16px]`, `rounded-br-[16px]` — tres sistemas de redondeo peleándose sin jerarquía.
5. **Competencia de capas sobre la imagen.** Badge de estado arriba-derecha + botón de desactivar arriba-izquierda + gradiente + nombre + categoría sobre un `aspect-[4/3]` pequeño = sobrecarga visual.
6. **Micro-tipografías disruptivas.** Uppercase con `tracking-[0.22em]` + mono a 10px en áreas grandes dan un look "terminal" que no encaja con el resto de la app (editorial cálido).

## 2. Objetivos

- **Visual**: estética editorial cálida alineada con el sistema actual (Notion/Linear/Things-like), usando exclusivamente tokens del tema para que la card respete claro/oscuro.
- **Jerarquía**: tres bandas horizontales con propósitos separados (imagen / meta / acciones).
- **Reducción de ruido**: mostrar solo lo que aporta en la grid; detalle técnico (SKU, costo, minStock) vive en el modal de edición.
- **Accesibilidad**: soporte de teclado, ARIA, focus ring, contraste WCAG AA en ambos modos.
- **API intacta**: el consumidor (`inventory/page.tsx`) no se modifica.

## 3. No-objetivos

- No se toca la rama `mode === "pos"` del mismo componente.
- No se modifica `ProductCardProps` ni `ProductCardData`.
- No se agregan nuevas variables CSS ni se tocan `globals.css` / `tailwind.config`.
- No se rediseña el modal de edición de productos (`inventory/page.tsx`).
- No se agregan nuevas acciones (eliminar definitivo sigue viviendo solo en el modal).

## 4. Decisiones de diseño

### 4.1 Dirección estética
**Editorial cálida** alineada al sistema: `bg-card`, `text-foreground`, `border-border/70`, precio en `text-primary` (terracota), accent sage para reactivar. Tipografías del sistema (`Manrope` sans, `JetBrains Mono` para números).

### 4.2 Anatomía — tres bandas

```
┌─────────────────────────────┐
│       IMAGEN 4:3            │  Banda 1 — producto puro
├─────────────────────────────┤
│  Nombre del producto        │
│  [chip categoría]           │  Banda 2 — meta (nombre, categoría, precio, stock)
│  ─────────────────────      │
│  $ 45.000          12 uds.  │
├─────────────────────────────┤
│  ⏻  Desactivar              │  Banda 3 — acción (condicional)
└─────────────────────────────┘
```

### 4.3 Contenedor

- `rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden`.
- Hover (si `onClick` está definido y `product.active === true`): `-translate-y-0.5`, `shadow-md`, `border-primary/30`, `duration-200 ease-out`.
- Cuando `product.active === false`: `opacity-60`, y el hover NO eleva (se mantiene `translate-y-0`, `shadow-sm`, `border-border/70`).

### 4.4 Banda 1 — Imagen

- `aspect-[4/3]`, `bg-muted`, `rounded-t-2xl`, `overflow-hidden`.
- Con imagen: `<Image>` de `next/image`, `object-cover`, `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"`, `className="transition-transform duration-500 ease-out group-hover:scale-[1.02]"`. `alt={product.name}`.
- Sin imagen: ícono `Package` de `lucide-react`, `h-10 w-10 text-muted-foreground/40`, centrado, `aria-hidden="true"`.
- **Sin overlay, sin gradiente, sin texto sobre la imagen.**
- **Badge "Inactivo" (condicional, solo si `product.active === false`)**:
  - Posición: `absolute top-2.5 right-2.5`.
  - Estilo: `inline-flex items-center rounded-full border border-border/60 bg-card/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground`.
  - Contenido: `Inactivo`.

### 4.5 Banda 2 — Meta

- Contenedor: `px-4 py-3.5 flex flex-col`.
- **Nombre**: `text-[15px] leading-tight font-bold text-foreground line-clamp-2 min-h-[38px]`. `min-h` garantiza altura uniforme entre cards con nombres de 1 y 2 líneas.
- **Chip categoría** (debajo del nombre, `mt-1.5`):
  - Con categoría: `inline-flex items-center rounded-full bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5` con el nombre de la categoría.
  - Sin categoría: mismo chip, texto `Sin categoría`, color `text-muted-foreground/60`.
- **Divisor**: `mt-3 pt-3 border-t border-border/60`.
- **Fila precio + stock**: `flex items-center justify-between`.
  - **Precio** (izquierda): `text-xl leading-none font-black text-primary tracking-tight font-sans tabular-nums`. Contenido: `formatCurrency(product.salePrice)`.
  - **Stock chip** (derecha): tres variantes según `product.stock` y `product.minStock`:

    | Condición | Estilo | Contenido |
    |---|---|---|
    | `stock === 0` | `bg-primary/15 border-primary/40 text-primary` | `<AlertTriangle className="w-3 h-3" />` + `Agotado` |
    | `stock <= minStock` (con `minStock` definido) | `bg-primary/10 border-primary/30 text-primary` | `<AlertTriangle className="w-3 h-3" />` + `{stock} uds.` |
    | resto | `bg-muted/60 border-border/60 text-foreground` | `{stock} uds.` |

    Base común: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-mono tabular-nums`.

### 4.6 Banda 3 — Pie de acción

**Renderizado condicional**: solo si `onDelete || onReactivate` está definido (que a su vez en el consumidor depende de `canManageInventory`).

- Contenedor: `<button type="button">` full-width, `border-t border-border/60`, `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold`, alineación izquierda.
- `onClick`: recibe el evento, llama `event.stopPropagation()` para no propagar al click de la card, luego ejecuta `onDelete?.() ?? onReactivate?.()`.
- `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset`.
- **Variante Desactivar** (cuando `onDelete` está definido):
  - `aria-label="Desactivar producto"`.
  - Ícono: `Power` (`h-3.5 w-3.5`).
  - Texto: `Desactivar`.
  - Colores: `text-muted-foreground hover:bg-muted/50 hover:text-foreground`.
- **Variante Reactivar** (cuando `onReactivate` está definido, no `onDelete`):
  - `aria-label="Reactivar producto"`.
  - Ícono: `RotateCcw` (`h-3.5 w-3.5`).
  - Texto: `Reactivar`.
  - Colores: `text-accent hover:bg-accent/10`.
  - Override: `opacity-100` (para mantenerlo legible aunque la card esté con `opacity-60` por estar inactiva).

### 4.7 Estado combinado (matriz)

| Estado producto | Card opacity | Imagen | Badge sobre imagen | Stock chip | Pie |
|---|---|---|---|---|---|
| Activo + `stock > minStock` | 100 % | limpia + hover eleva | — | neutro (`bg-muted/60`) | Desactivar |
| Activo + `0 < stock <= minStock` | 100 % | limpia + hover eleva | — | terracota + `AlertTriangle` | Desactivar |
| Activo + `stock === 0` | 100 % | limpia + hover eleva | — | terracota marcado + `Agotado` | Desactivar |
| Inactivo | 60 % + hover NO eleva | apagada por opacity | chip `Inactivo` | sin cambios (se ve con 60 %) | Reactivar (`opacity-100`) |

### 4.8 Accesibilidad

- **Card**: `role="button"`, `tabIndex={0}` cuando `onClick` está definido; `onKeyDown` dispara `onClick` al recibir `Enter` o `Space` (con `preventDefault()` en `Space` para evitar scroll).
- **`aria-label` del card**: `Editar producto: ${product.name}` cuando `onClick` está definido.
- **Focus ring del card**: `focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none`.
- **Imagen**: `alt={product.name}`; fallback ícono con `aria-hidden="true"`.
- **Botón del pie**: `<button type="button">` con `aria-label` específico.
- **Contraste**: todos los pares texto/fondo usan tokens CSS del sistema → respeto automático de claro/oscuro. El par `text-primary` sobre `bg-primary/10` pasa WCAG AA en ambos modos del tema actual.

### 4.9 API del componente — sin cambios

```ts
type ProductCardData = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  stock: number;
  salePrice: number;
  costPrice?: number;
  minStock?: number;
  category?: { name: string } | null;
  active?: boolean;
};

interface ProductCardProps {
  product: ProductCardData;
  mode: "pos" | "inventory";
  onClick?: () => void;
  onDelete?: () => void;        // interpretado como "desactivar" en inventory
  onReactivate?: () => void;
  isFavorite?: boolean;         // solo usado en mode="pos"
  onToggleFavorite?: () => void; // solo usado en mode="pos"
}
```

`costPrice`, `sku` y `minStock` siguen existiendo en el tipo (POS los puede usar y el modal del consumidor los sigue consumiendo vía `formData`). **En inventory, `sku` y `costPrice` dejan de renderizarse en la card.** `minStock` se usa para calcular el chip de stock.

## 5. Lo que se elimina del código actual

Dentro del branch `mode === "inventory"` de `ProductCard.tsx`:

- Todos los colores hex hardcodeados (`#23201E`, `#18181c`, `#26181b`, `#17231c`, `#18181d`, `#707070`, `#808080`).
- Todas las referencias a `[font-family:var(--font-dm-sans)]`.
- Gradiente `from-black/85 via-black/35 to-transparent` sobre la imagen.
- Texto del nombre y la categoría sobre la imagen.
- La segunda aparición de la categoría (ya no acompaña al precio).
- La aparición del SKU en la card (sigue en el modal).
- La aparición del `costPrice` en la card (sigue en el modal).
- El botón de desactivar/reactivar flotante sobre la imagen.
- Los radios asimétricos `rounded-t-[18px] rounded-b-[4px]`, `rounded-bl-[16px]`, `rounded-br-[16px]`.
- El estilo custom del grid 2×1 inferior.

## 6. Tokens CSS que se usan (todos ya existen)

Del `globals.css` actual: `--background`, `--foreground`, `--primary`, `--accent`, `--card`, `--border`, `--muted`, `--muted-foreground`, `--font-manrope`, `--font-jetbrains-mono`. Tailwind ya los expone como `bg-card`, `text-foreground`, `text-primary`, `text-accent`, etc.

## 7. Plan de verificación

- **Visual en claro**: la card se ve con fondo blanco, tipografía oscura, precio terracota, chip de categoría en crema tenue. Nada hex hardcodeado visible.
- **Visual en oscuro**: la card se ve con fondo `#242220`, tipografía clara, paleta terracota/sage respetada.
- **Estado activo + stock OK**: sin badges, imagen limpia, chip neutro con número.
- **Estado stock bajo**: chip terracota con `AlertTriangle`, sin cambios en el resto.
- **Estado agotado**: chip terracota con `Agotado`.
- **Estado inactivo**: card al 60 %, badge `Inactivo` arriba-derecha, botón `Reactivar` a opacidad completa y en sage.
- **Teclado**: se puede enfocar la card con `Tab`, activarla con `Enter`/`Space`. El botón del pie recibe su propio foco y dispara solo su acción.
- **Click en el botón del pie** no abre el modal (no propaga).
- **Roles sin permisos (`canManageInventory === false`)**: no se renderiza la banda 3 ni el botón sobre la imagen (el consumidor ya no pasa `onDelete`/`onReactivate` en ese caso).
- **API del componente**: `inventory/page.tsx` compila sin cambios. No hay regresión en la rama `mode === "pos"`.

## 8. Archivos afectados

| Archivo | Cambia |
|---|---|
| `frontend/src/components/products/ProductCard.tsx` | **SÍ** — solo el branch `mode === "inventory"` |
| `frontend/src/app/inventory/page.tsx` | No |
| `frontend/src/app/globals.css` | No |
| Rama `mode === "pos"` de `ProductCard.tsx` | No |
