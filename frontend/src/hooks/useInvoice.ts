"use client";

import { api } from "@/lib/api";

export async function printInvoice(saleId: string) {
  try {
    await api.exportData(`/sales/${saleId}/invoice`, {});
  } catch {
    throw new Error("Error al generar la factura");
  }
}
