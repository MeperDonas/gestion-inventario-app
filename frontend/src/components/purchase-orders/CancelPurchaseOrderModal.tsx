"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCancelPurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";

interface Props {
  orderId: string;
  orderNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

export function CancelPurchaseOrderModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onCancelled,
}: Props) {
  const toast = useToast();
  const cancelOrder = useCancelPurchaseOrder();
  const [reason, setReason] = useState("");

  const valid = reason.trim().length >= 5;

  const handleSubmit = async () => {
    if (!valid) return;
    try {
      await cancelOrder.mutateAsync({ id: orderId, reason: reason.trim() });
      toast.success(`OC-${orderNumber} cancelada`);
      onCancelled?.();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo cancelar la orden"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cancelar OC-${orderNumber}`}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer. Indica el motivo de la cancelación
          (mínimo 5 caracteres).
        </p>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Motivo
          </label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Ej: Proveedor sin stock, pedido duplicado..."
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/60">
          <Button type="button" variant="secondary" onClick={onClose}>
            Volver
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleSubmit}
            disabled={!valid}
            loading={cancelOrder.isPending}
          >
            Cancelar orden
          </Button>
        </div>
      </div>
    </Modal>
  );
}
