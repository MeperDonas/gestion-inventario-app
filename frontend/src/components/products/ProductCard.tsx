"use client";

import Image from "next/image";
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

function getStockChipClasses({
  isOutOfStock,
  isLowStockStrict,
}: {
  isOutOfStock: boolean;
  isLowStockStrict: boolean;
}) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-mono tabular-nums",
    isOutOfStock
      ? "bg-rose-500 border-rose-500 text-white"
      : isLowStockStrict
        ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
        : "bg-muted/60 border-border/60 text-foreground",
  );
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

  const categoryLabel = product.category?.name ?? null;
  const hasCategory = categoryLabel !== null && categoryLabel.length > 0;
  const hasMinStock = typeof product.minStock === "number";
  const isOutOfStock = product.stock === 0;
  const isLowStockStrict =
    hasMinStock && product.stock > 0 && product.stock <= (product.minStock as number);
  const showStockAlert = isOutOfStock || isLowStockStrict;

  const stockChipClasses = getStockChipClasses({ isOutOfStock, isLowStockStrict });

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  if (mode === "inventory") {
    const isReactivate = isInactive;
    const footerHandler = isReactivate ? onReactivate : onDelete;
    const showFooter = Boolean(footerHandler);

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
              footerHandler?.();
            }}
            className={cn(
              "relative flex w-full items-center justify-center gap-2 overflow-hidden border-t border-border/60 px-4 py-2.5 text-xs font-semibold transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset",
              isReactivate
                ? "text-accent hover:bg-gradient-to-r hover:from-accent/5 hover:via-accent/15 hover:to-accent/5 hover:tracking-wide"
                : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/15 hover:to-primary/5 hover:text-primary hover:tracking-wide",
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

  const showLastUnitsAlert = product.stock > 0 && product.stock <= 5;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Agregar ${product.name} al carrito` : undefined}
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
        {onToggleFavorite && (
          <button
            type="button"
            aria-label={
              isFavorite
                ? `Quitar ${product.name} de favoritos`
                : `Marcar ${product.name} como favorito`
            }
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              "absolute right-2.5 top-2.5 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/90 p-1.5 backdrop-blur-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isFavorite
                ? "text-primary hover:border-primary/40"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <Star
              className={cn("h-4 w-4", isFavorite && "fill-current")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Banda 2 — Meta */}
      <div className="flex flex-1 flex-col px-4 py-3.5">
        <p className="line-clamp-2 min-h-[38px] text-[15px] font-bold leading-tight text-foreground">
          {product.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium",
              hasCategory ? "text-muted-foreground" : "text-muted-foreground/60",
            )}
          >
            {hasCategory ? categoryLabel : "Sin categoría"}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-muted-foreground/70">
            SKU {product.sku}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <p className="text-xl font-black leading-none tracking-tight text-primary tabular-nums">
            {formatCurrency(product.salePrice)}
          </p>
          <span className={stockChipClasses}>
            {showStockAlert && (
              <AlertTriangle
                className="h-3 w-3"
                aria-hidden="true"
              />
            )}
            {isOutOfStock ? "Agotado" : `${product.stock} uds.`}
          </span>
        </div>
        {showLastUnitsAlert && (
          <p className="mt-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Últimas {product.stock} uds.
          </p>
        )}
      </div>
    </div>
  );
}
