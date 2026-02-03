"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Check,
  Package,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentMethod {
  type: "CASH" | "CARD" | "TRANSFER";
  amount: number;
}

interface CartItem {
  productId: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    salePrice: number;
  };
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cart: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethods: PaymentMethod[];
  onPaymentMethodChange: (methods: PaymentMethod[]) => void;
  loading?: boolean;
  customerName?: string;
  saleNumber?: number;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  cart,
  subtotal,
  taxAmount,
  total,
  paymentMethods,
  onPaymentMethodChange,
  loading = false,
  customerName = "Cliente General",
  saleNumber,
}: PaymentConfirmationModalProps) {
  const [activeMethodIndex, setActiveMethodIndex] = useState<number | null>(
    null,
  );
  const [customAmount, setCustomAmount] = useState("");

  const totalPaid = paymentMethods.reduce(
    (sum, method) => sum + method.amount,
    0,
  );
  const remaining = total - totalPaid;
  const isFullyPaid = totalPaid >= total;
  const cashPaid = paymentMethods.find((m) => m.type === "CASH")?.amount || 0;
  const nonCashPaid = paymentMethods
    .filter((m) => m.type !== "CASH")
    .reduce((sum, m) => sum + m.amount, 0);
  const change = cashPaid - (total - nonCashPaid);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

  const handleQuickAmount = (amount: number) => {
    const currentCashIndex = paymentMethods.findIndex((m) => m.type === "CASH");
    if (currentCashIndex === -1) {
      onPaymentMethodChange([...paymentMethods, { type: "CASH", amount }]);
    } else {
      const newMethods = [...paymentMethods];
      newMethods[currentCashIndex] = {
        ...newMethods[currentCashIndex],
        amount: amount,
      };
      onPaymentMethodChange(newMethods);
    }
    setCustomAmount("");
  };

  const handleCustomAmount = (amount: number) => {
    const currentCashIndex = paymentMethods.findIndex((m) => m.type === "CASH");
    if (currentCashIndex === -1) {
      onPaymentMethodChange([...paymentMethods, { type: "CASH", amount }]);
    } else {
      const newMethods = [...paymentMethods];
      newMethods[currentCashIndex] = {
        ...newMethods[currentCashIndex],
        amount,
      };
      onPaymentMethodChange(newMethods);
    }
  };

  const addPaymentMethod = (type: "CARD" | "TRANSFER") => {
    if (type === "CARD" && paymentMethods.some((m) => m.type === "CARD"))
      return;
    if (
      type === "TRANSFER" &&
      paymentMethods.some((m) => m.type === "TRANSFER")
    )
      return;

    const amount = Math.max(0, remaining);
    onPaymentMethodChange([...paymentMethods, { type, amount }]);
  };

  const removePaymentMethod = (index: number) => {
    const newMethods = paymentMethods.filter((_, i) => i !== index);
    onPaymentMethodChange(newMethods);
  };

  const getPaymentMethodLabel = (type: string) => {
    switch (type) {
      case "CASH":
        return "Efectivo";
      case "CARD":
        return "Tarjeta";
      case "TRANSFER":
        return "Transferencia";
      default:
        return type;
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return <DollarSign className="w-5 h-5" />;
      case "CARD":
        return <CreditCard className="w-5 h-5" />;
      case "TRANSFER":
        return <Smartphone className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Pago" size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Resumen de Compra
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {cart.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-terracotta/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </span>
                      {item.discountAmount > 0 && (
                        <Badge variant="success" className="text-xs">
                          -{formatCurrency(item.discountAmount)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground text-sm">
                      {formatCurrency(
                        item.quantity * item.unitPrice - item.discountAmount,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <Badge variant="default" className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              {customerName}
            </Badge>
            {saleNumber && <Badge variant="secondary">#{saleNumber}</Badge>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Desglose de Pagos
            </h3>
            <div className="space-y-2 mb-4">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-primary">
                      {getPaymentMethodIcon(method.type)}
                    </div>
                    <span className="font-medium text-foreground text-sm">
                      {getPaymentMethodLabel(method.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeMethodIndex === index ? (
                      <input
                        type="number"
                        step="100"
                        value={method.amount}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          const newMethods = [...paymentMethods];
                          newMethods[index] = {
                            ...newMethods[index],
                            amount: value,
                          };
                          onPaymentMethodChange(newMethods);
                        }}
                        onBlur={() => setActiveMethodIndex(null)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") setActiveMethodIndex(null);
                        }}
                        autoFocus
                        className="w-28 px-2 py-1 text-sm border border-border rounded"
                      />
                    ) : (
                      <span
                        className="font-semibold text-foreground cursor-pointer"
                        onClick={() => setActiveMethodIndex(index)}
                      >
                        {formatCurrency(method.amount)}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePaymentMethod(index)}
                      className="w-8 h-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (paymentMethods.some((m) => m.type === "CARD")) return;
                  addPaymentMethod("CARD");
                }}
                disabled={
                  paymentMethods.some((m) => m.type === "CARD") ||
                  totalPaid >= total
                }
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Agregar Tarjeta
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (paymentMethods.some((m) => m.type === "TRANSFER")) return;
                  addPaymentMethod("TRANSFER");
                }}
                disabled={
                  paymentMethods.some((m) => m.type === "TRANSFER") ||
                  totalPaid >= total
                }
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Agregar Transferencia
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {cashPaid > 0
                ? `Efectivo: ${formatCurrency(cashPaid)}`
                : "Efectivo"}
            </h3>
            
            {/* Botón de Monto Exacto - Destacado */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleQuickAmount(remaining)}
              className="w-full mb-3 font-bold"
              disabled={remaining <= 0}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Monto Exacto: {formatCurrency(remaining)}
            </Button>
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAmount(cashPaid + amount)}
                  className="text-xs"
                >
                  ${amount.toLocaleString()}
                </Button>
              ))}
            </div>

            <Input
              type="number"
              step="100"
              placeholder="Monto personalizado"
              value={customAmount}
              onChange={(e) => {
                const value = e.target.value;
                setCustomAmount(value);
                if (value) handleCustomAmount(Number(value));
              }}
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-border bg-background rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium text-foreground">
                {formatCurrency(taxAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuentos</span>
              <span className="font-medium">
                -
                {formatCurrency(
                  cart.reduce((sum, item) => sum + item.discountAmount, 0),
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pagado</span>
              <span className="font-medium text-foreground">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Faltante</span>
                <span className="font-medium">{formatCurrency(remaining)}</span>
              </div>
            )}
            {cashPaid > total - nonCashPaid && (
              <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t border-border">
                <span>Cambio</span>
                <span>{formatCurrency(change)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Volver
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              disabled={!isFullyPaid || loading}
              loading={loading}
            >
              <Check className="w-5 h-5 mr-2" />
              Confirmar Pago
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
