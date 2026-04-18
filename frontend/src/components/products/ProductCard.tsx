"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { cn, formatCurrency } from "@/lib/utils";
import { AlertTriangle, Package, Power, RotateCcw, Star } from "lucide-react";

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
  onDelete?: () => void;
  onReactivate?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ProductCard({
  product,
  mode,
  onClick,
  onDelete,
  onReactivate,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) {
  const isInactive = product.active === false;
  const isActive = !isInactive;
  const isLowStock =
    typeof product.minStock === "number"
      ? product.stock <= product.minStock
      : false;

  if (mode === "inventory") {
    const categoryLabel = product.category?.name ?? null;
    const hasCategory = categoryLabel !== null && categoryLabel.length > 0;
    const hasMinStock = typeof product.minStock === "number";
    const isOutOfStock = product.stock === 0;
    const isLowStockStrict =
      hasMinStock && product.stock > 0 && product.stock <= (product.minStock as number);
    const showStockAlert = isOutOfStock || isLowStockStrict;

    const stockChipClasses = cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-mono tabular-nums",
      isOutOfStock
        ? "bg-primary/15 border-primary/40 text-primary"
        : isLowStockStrict
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-muted/60 border-border/60 text-foreground",
    );

    const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    };

    const showFooter = Boolean(onDelete || onReactivate);
    const isReactivate = !onDelete && Boolean(onReactivate);

    return (
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Editar producto: ${product.name}` : undefined}
        onClick={onClick ? () => onClick() : undefined}
        onKeyDown={onClick ? handleCardKeyDown : undefined}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          onClick && isActive
            ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            : onClick
              ? "cursor-pointer"
              : "cursor-default",
          !isActive && "opacity-60",
        )}
      >
        {/* Banda 1 — Imagen */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              aria-hidden="true"
            >
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          {!isActive && (
            <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full border border-border/60 bg-card/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-md">
              Inactivo
            </span>
          )}
        </div>

        {/* Banda 2 — Meta */}
        <div className="flex flex-1 flex-col px-4 py-3.5">
          <p className="line-clamp-2 min-h-[38px] text-[15px] font-bold leading-tight text-foreground">
            {product.name}
          </p>
          <div className="mt-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium",
                hasCategory ? "text-muted-foreground" : "text-muted-foreground/60",
              )}
            >
              {hasCategory ? categoryLabel : "Sin categoría"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
            <p className="text-xl font-black leading-none tracking-tight text-primary tabular-nums">
              {formatCurrency(product.salePrice)}
            </p>
            <span className={stockChipClasses}>
              {showStockAlert && (
                <AlertTriangle
                  data-testid="stock-alert-icon"
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              )}
              {isOutOfStock ? "Agotado" : `${product.stock} uds.`}
            </span>
          </div>
        </div>

        {/* Banda 3 — Pie de acción */}
        {showFooter && (
          <button
            type="button"
            aria-label={
              isReactivate ? "Reactivar producto" : "Desactivar producto"
            }
            onClick={(event) => {
              event.stopPropagation();
              if (onDelete) {
                onDelete();
                return;
              }
              onReactivate?.();
            }}
            className={cn(
              "flex w-full items-center gap-2 border-t border-border/60 px-4 py-2.5 text-xs font-semibold",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset",
              isReactivate
                ? "text-accent hover:bg-accent/10 opacity-100"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {isReactivate ? (
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Power className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isReactivate ? "Reactivar" : "Desactivar"}</span>
          </button>
        )}
      </div>
    );
  }

  const categoryLabel = product.category?.name || "Sin categoria";

  return (
    <Card
      className={cn(
        "group h-full overflow-hidden border-0 bg-transparent shadow-none",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
      onClick={() => onClick?.()}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-[22px] border border-border/60 bg-card/35">
          <div className="relative aspect-[5/5] bg-[#23201E] transition-all duration-500 ease-out group-hover:brightness-110">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3A3633] to-[#23201E]">
                <Package className="h-11 w-11 text-white/65" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-colors duration-500 group-hover:from-black/55" />
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "absolute right-3 top-3 rounded-xl border border-border/80 bg-card/75 p-1.5 text-foreground/75 backdrop-blur-md transition-all duration-300 hover:text-primary",
                isFavorite
                  ? "border-primary/45 bg-primary/15 text-primary"
                  : "",
              )}
            >
              <Star
                className={cn("h-4 w-4", isFavorite ? "fill-current" : "")}
              />
            </button>
          )}

          <div className="border-t border-border/60 bg-card/88 px-4 py-3.5 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] font-bold leading-tight text-foreground [font-family:var(--font-dm-sans)]">
                  {product.name}
                </p>
                <p className="mt-1 truncate text-[10px] text-muted-foreground [font-family:var(--font-jetbrains-mono)]">
                  {categoryLabel}
                </p>
                <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.08em] text-muted-foreground/85 [font-family:var(--font-jetbrains-mono)]">
                  SKU {product.sku}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
              <p className="text-xl font-black leading-none text-primary [font-family:var(--font-dm-sans)]">
                {formatCurrency(product.salePrice)}
              </p>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className={cn(
                    "inline-flex min-w-10 items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-bold [font-family:var(--font-jetbrains-mono)]",
                    isInactive
                      ? "border-border/70 bg-muted/85 text-muted-foreground"
                      : isLowStock
                        ? "border-primary/30 bg-primary/12 text-primary"
                        : "border-accent/30 bg-accent/14 text-accent",
                  )}
                >
                  {product.stock}
                </span>
                {mode === "pos" && product.stock > 0 && product.stock <= 5 && (
                  <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                    Últimas {product.stock} uds.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
