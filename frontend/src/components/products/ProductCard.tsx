"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { Package, Star, Trash2 } from "lucide-react";

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
};

interface ProductCardProps {
  product: ProductCardData;
  mode: "pos" | "inventory";
  onClick?: () => void;
  onDelete?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ProductCard({
  product,
  mode,
  onClick,
  onDelete,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) {
  const isLowStock =
    typeof product.minStock === "number"
      ? product.stock <= product.minStock
      : false;

  return (
    <Card
      className="h-full cursor-pointer transition-shadow duration-200 hover:shadow-xl"
      onClick={onClick}
    >
      <CardContent className="flex h-full flex-col gap-3 p-3">
        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-primary/10 to-terracotta/10">
          <div className="aspect-[4/3] flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-10 w-10 text-primary" />
            )}
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite();
              }}
              className="absolute right-2 top-2 rounded-md bg-card/90 p-1 text-muted-foreground shadow-sm transition-colors hover:text-primary"
            >
              <Star
                className={`h-4 w-4 ${isFavorite ? "fill-current text-primary" : ""}`}
              />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="min-h-[2.3rem]">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-muted-foreground">{product.sku}</span>
            {isLowStock ? (
              <Badge variant="warning" className="text-[10px]">
                Stock Bajo
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Stock OK
              </Badge>
            )}
          </div>

          {product.category?.name && (
            <p className="truncate text-xs text-muted-foreground">{product.category.name}</p>
          )}
        </div>

        <div className="mt-auto space-y-1 rounded-lg border border-border/60 bg-background/80 p-2">
          {mode === "inventory" && typeof product.costPrice === "number" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Costo</span>
              <span className="font-medium text-foreground">
                {formatCurrency(product.costPrice)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Precio</span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(product.salePrice)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Stock</span>
            <span className="font-semibold text-foreground">{product.stock}</span>
          </div>
        </div>

        {mode === "inventory" && onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="w-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
