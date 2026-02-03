"use client";

import { CreditCard, DollarSign, Smartphone, Check } from "lucide-react";

interface PaymentMethodCardProps {
  type: "CASH" | "CARD" | "TRANSFER";
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function PaymentMethodCard({
  type,
  label,
  icon,
  selected,
  onClick,
}: PaymentMethodCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
        ${selected
          ? "border-primary bg-primary/5 shadow-lg"
          : "border-border bg-card hover:border-primary/50"
        }
      `}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className={`
          p-4 rounded-xl ${
            selected ? "bg-primary text-white" : "bg-primary/10 text-primary"
          } flex items-center justify-center
        `}>
          {icon}
        </div>
        <h4 className={`font-semibold text-sm ${selected ? "text-white" : "text-foreground"}`}>
          {label}
        </h4>
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

interface PaymentMethodCardsProps {
  selectedMethod: "CASH" | "CARD" | "TRANSFER";
  onMethodChange: (method: "CASH" | "CARD" | "TRANSFER") => void;
}

export function PaymentMethodCards({ selectedMethod, onMethodChange }: PaymentMethodCardsProps) {
  const methods = [
    {
      type: "CASH" as const,
      label: "Efectivo",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      type: "CARD" as const,
      label: "Tarjeta",
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      type: "TRANSFER" as const,
      label: "Transferencia",
      icon: <Smartphone className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.type}
          type={method.type}
          label={method.label}
          icon={method.icon}
          selected={selectedMethod === method.type}
          onClick={() => onMethodChange(method.type)}
        />
      ))}
    </div>
  );
}
