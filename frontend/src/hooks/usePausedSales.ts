import { useEffect, useState } from "react";
import type { CartItem } from "@/types";

interface PausedSale {
  id: string;
  cart: CartItem[];
  customerId: string | "";
  discountAmount: number;
  pausedAt: string;
  customerName?: string;
}

const PAUSED_SALES_KEY = "paused_sales";

export function usePausedSales() {
  const [pausedSales, setPausedSales] = useState<PausedSale[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem(PAUSED_SALES_KEY);
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as PausedSale[];
    } catch {
      console.error("Error loading paused sales");
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(PAUSED_SALES_KEY, JSON.stringify(pausedSales));
  }, [pausedSales]);

  const pauseSale = (
    cart: CartItem[],
    customerId: string | "",
    discountAmount: number,
    customerName?: string
  ) => {
    if (cart.length === 0) {
      throw new Error("No items in cart");
    }

    const pausedSale: PausedSale = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      cart,
      customerId,
      discountAmount,
      pausedAt: new Date().toISOString(),
      customerName,
    };

    setPausedSales((prev) => [...prev, pausedSale]);
    return pausedSale.id;
  };

  const resumeSale = (id: string) => {
    const sale = pausedSales.find((s) => s.id === id);
    if (!sale) {
      throw new Error("Paused sale not found");
    }

    setPausedSales((prev) => prev.filter((s) => s.id !== id));
    return sale;
  };

  const deletePausedSale = (id: string) => {
    setPausedSales((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAllPausedSales = () => {
    setPausedSales([]);
  };

  return {
    pausedSales,
    pauseSale,
    resumeSale,
    deletePausedSale,
    clearAllPausedSales,
    isLoaded: true,
  };
}
