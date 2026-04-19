"use client";

import { cn } from "@/lib/utils";
import { chipStyles } from "@/lib/chipStyles";
import type { PurchaseOrderStatus } from "@/types";

const statusConfig: Record<
  PurchaseOrderStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "Borrador", className: chipStyles.neutral },
  PENDING: { label: "Pendiente", className: chipStyles.primary },
  PARTIAL_RECEIVED: { label: "Recibida parcialmente", className: chipStyles.warning },
  RECEIVED: { label: "Recibida", className: chipStyles.success },
  CANCELLED: { label: "Cancelada", className: chipStyles.danger },
};

export function PurchaseOrderStatusBadge({
  status,
  className,
}: {
  status: PurchaseOrderStatus;
  className?: string;
}) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
