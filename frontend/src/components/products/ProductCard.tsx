"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn, formatCurrency } from "@/lib/utils";
import { Package, Power, RotateCcw, Star } from "lucide-react";

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
  const isLowStock =
    typeof product.minStock === "number"
      ? product.stock <= product.minStock
      : false;

  if (mode === "inventory") {
    const categoryLabel = product.category?.name || "Sin categoria";

    return (
      <Card
        className={cn(
          "h-full overflow-hidden border-0 bg-transparent shadow-none",
          onClick ? "cursor-pointer" : "cursor-default",
        )}
        onClick={() => onClick?.()}
      >
        <CardContent className="flex h-full flex-col gap-1 p-0">
          <div className="relative overflow-hidden rounded-t-[18px] rounded-b-[4px]">
            <div className="relative aspect-[4/3] bg-[#23201E]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#23201E]">
                  <Package className="h-10 w-10 text-white/65" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 py-2.5">
                <p className="line-clamp-2 text-base font-black leading-tight tracking-[-0.02em] text-white [font-family:var(--font-dm-sans)]">
                  {product.name}
                </p>
                <p className="mt-1 truncate text-[10px] uppercase tracking-[0.22em] text-white/60 [font-family:var(--font-jetbrains-mono)]">
                  {categoryLabel}
                </p>
              </div>
              <div className="absolute right-2 top-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm",
                    isInactive
                      ? "border-border/80 bg-card/85 text-muted-foreground"
                      : isLowStock
                        ? "border-primary/35 bg-primary/15 text-primary"
                        : "border-accent/40 bg-accent/15 text-accent",
                  )}
                >
                  {isInactive
                    ? "Inactivo"
                    : isLowStock
                      ? "Stock bajo"
                      : "Stock OK"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="flex min-h-[96px] flex-col justify-between rounded-t-[4px] rounded-br-[4px] rounded-bl-[16px] bg-[#18181c] px-3.5 py-3">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#707070] [font-family:var(--font-jetbrains-mono)]">
                Precio
              </p>
              <p className="text-xl font-black leading-none text-primary [font-family:var(--font-dm-sans)]">
                {formatCurrency(product.salePrice)}
              </p>
              <p className="truncate text-[10px] text-[#808080] [font-family:var(--font-jetbrains-mono)]">
                {typeof product.costPrice === "number"
                  ? `Costo ${formatCurrency(product.costPrice)}`
                  : categoryLabel}
              </p>
            </div>

            <div
              className={cn(
                "flex min-h-[96px] flex-col justify-between rounded-t-[4px] rounded-br-[16px] rounded-bl-[4px] px-3.5 py-3",
                isInactive
                  ? "bg-[#18181d]"
                  : isLowStock
                    ? "bg-[#26181b]"
                    : "bg-[#17231c]",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#707070] [font-family:var(--font-jetbrains-mono)]">
                  Stock
                </p>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isInactive
                      ? "bg-muted-foreground"
                      : isLowStock
                        ? "bg-primary"
                        : "bg-accent",
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-[30px] font-black leading-none [font-family:var(--font-jetbrains-mono)]",
                  isInactive
                    ? "text-muted-foreground"
                    : isLowStock
                      ? "text-primary"
                      : "text-accent",
                )}
              >
                {product.stock}
              </p>
              <p className="truncate text-[10px] text-[#808080] [font-family:var(--font-jetbrains-mono)]">
                SKU {product.sku}
              </p>
            </div>
          </div>

          {(onDelete || onReactivate) && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                if (onDelete) {
                  onDelete();
                  return;
                }
                onReactivate?.();
              }}
              className="mt-1 w-full"
            >
              {onDelete ? (
                <>
                  <Power className="h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Reactivar
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
