"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  isDisabled?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel = "elemento",
  isDisabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const clamped = Math.max(1, Math.min(currentPage, totalPages));
  const prev = () => onPageChange(Math.max(1, clamped - 1));
  const next = () => onPageChange(Math.min(totalPages, clamped + 1));

  const hasTotal = typeof totalItems === "number";
  const hasRange = hasTotal && typeof pageSize === "number" && pageSize > 0;
  const rangeStart = hasRange ? (clamped - 1) * pageSize + 1 : 0;
  const rangeEnd = hasRange
    ? Math.min(clamped * pageSize, totalItems as number)
    : 0;
  const pluralSuffix = totalItems !== 1 ? "s" : "";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      {hasRange ? (
        <p className="text-xs text-muted-foreground">
          Mostrando {rangeStart}-{rangeEnd} de {totalItems}
        </p>
      ) : hasTotal ? (
        <p className="text-xs text-muted-foreground">
          {totalItems} {itemLabel}
          {pluralSuffix}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={prev}
          disabled={clamped <= 1 || isDisabled}
          className="px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-xs font-medium text-foreground tabular-nums">
          {clamped} / {totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={next}
          disabled={clamped >= totalPages || isDisabled}
          className="px-2"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
