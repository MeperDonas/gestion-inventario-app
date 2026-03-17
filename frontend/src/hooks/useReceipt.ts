"use client";

import { api } from "@/lib/api";

export async function printReceipt(saleId: string) {
  try {
    await api.exportData(`/sales/${saleId}/receipt`, {});
  } catch {
    throw new Error("Error al generar el comprobante");
  }
}
