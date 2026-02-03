"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DashboardData,
  SaleByPaymentMethod,
  SaleByCategory,
  TopSellingProduct,
  CustomerStatistics,
  DailySale,
} from "@/types";

export function useDashboard(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () =>
      api
        .get<DashboardData>("/reports/dashboard", { startDate, endDate })
        .then((res) => res.data),
  });
}

export function useSalesByPaymentMethod(
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["reports", "sales", "payment-method", startDate, endDate],
    queryFn: () =>
      api
        .get<SaleByPaymentMethod[]>("/reports/sales/payment-method", {
          startDate,
          endDate,
        })
        .then((res) => res.data),
  });
}

export function useSalesByCategory(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["reports", "sales", "category", startDate, endDate],
    queryFn: () =>
      api
        .get<SaleByCategory[]>("/reports/sales/category", {
          startDate,
          endDate,
        })
        .then((res) => res.data),
  });
}

export function useTopSellingProducts(
  startDate?: string,
  endDate?: string,
  limit = 10
) {
  return useQuery({
    queryKey: ["reports", "products", "top-selling", startDate, endDate, limit],
    queryFn: () =>
      api
        .get<TopSellingProduct[]>("/reports/products/top-selling", {
          startDate,
          endDate,
          limit,
        })
        .then((res) => res.data),
  });
}

export function useCustomerStatistics(
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["reports", "customers", "statistics", startDate, endDate],
    queryFn: () =>
      api
        .get<CustomerStatistics>("/reports/customers/statistics", {
          startDate,
          endDate,
        })
        .then((res) => res.data),
  });
}

export function useDailySales(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["reports", "sales", "daily", startDate, endDate],
    queryFn: () =>
      api
        .get<DailySale[]>("/reports/sales/daily", {
          startDate,
          endDate,
        })
        .then((res) => res.data),
    enabled: !!startDate && !!endDate,
  });
}

export function useExportData(
  type: "sales" | "products" | "customers" | "inventory",
  format: "pdf" | "excel" | "csv",
  data?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  return api.exportData(`/exports/${type}`, {
    format,
    type,
    ...data,
  });
}
