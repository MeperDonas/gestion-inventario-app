"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useReceivePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";
import type { PurchaseOrder } from "@/types";

interface Props {
  order: PurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
  onReceived?: (updated: PurchaseOrder) => void;
}

function buildInitialValues(
  pendingItems: Array<{ id: string; pending: number }>,
) {
  const initial: Record<string, number> = {};
  for (const item of pendingItems) {
    initial[item.id] = item.pending;
  }
  return initial;
}

export function ReceiveItemsModal({ order, isOpen, onClose, onReceived }: Props) {
  const toast = useToast();
  const receive = useReceivePurchaseOrder();

  const pendingItems = useMemo(() => {
    return (order.items ?? [])
      .map((it) => ({
        ...it,
        pending: Math.max(0, it.qtyOrdered - it.qtyReceived),
      }))
      .filter((it) => it.pending > 0);
  }, [order.items]);

  const [values, setValues] = useState<Record<string, number>>(() =>
    buildInitialValues(pendingItems),
  );

  const totalPlanned = Object.values(values).reduce((a, b) => a + b, 0);

  const canSubmit =
    totalPlanned > 0 &&
    pendingItems.every((it) => {
      const v = values[it.id] ?? 0;
      return Number.isInteger(v) && v >= 0 && v <= it.pending;
    });

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const items = pendingItems
        .map((it) => ({ itemId: it.id, qtyReceivedNow: values[it.id] ?? 0 }))
        .filter((p) => p.qtyReceivedNow > 0);
      const updated = await receive.mutateAsync({ id: order.id, items });
      const statusLabel =
        updated.status === "RECEIVED"
          ? "Orden recibida completamente"
          : "Recepción parcial registrada";
      toast.success(statusLabel);
      onReceived?.(updated);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo registrar la recepción"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recibir productos" size="lg">
      {pendingItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay items pendientes por recibir.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Ingresa la cantidad recibida ahora por cada producto. Los valores no
            pueden superar la cantidad pendiente.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-muted/40 border-b border-border/60">
                  <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Producto
                  </th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ordenado
                  </th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ya recibido
                  </th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pendiente
                  </th>
                  <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32">
                    Recibir ahora
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((it) => (
                  <tr
                    key={it.id}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <td className="py-2 px-4">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {it.product?.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {it.product?.sku}
                      </p>
                    </td>
                    <td className="py-2 px-3 text-right text-sm text-foreground font-mono">
                      {it.qtyOrdered}
                    </td>
                    <td className="py-2 px-3 text-right text-sm text-muted-foreground font-mono">
                      {it.qtyReceived}
                    </td>
                    <td className="py-2 px-3 text-right text-sm font-semibold text-amber-600 dark:text-amber-400 font-mono">
                      {it.pending}
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        min={0}
                        max={it.pending}
                        step={1}
                        value={values[it.id] ?? 0}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [it.id]: Math.max(
                              0,
                              Math.min(
                                it.pending,
                                Math.floor(Number(e.target.value) || 0),
                              ),
                            ),
                          }))
                        }
                        className="w-full rounded-md border border-border bg-card px-2 py-1 text-right text-sm focus:outline-none focus:border-primary/50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/60">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={receive.isPending}
            >
              Confirmar recepción
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
