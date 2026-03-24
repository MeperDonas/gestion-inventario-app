"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AppliedRange,
  DashboardData,
  SaleByPaymentMethod,
  SaleByCategory,
  TopSellingProduct,
  CustomerStatistics,
  DailySale,
  ReportEnvelope,
  UserPerformance,
} from "@/types";

type DashboardResponse = DashboardData & {
  appliedRange: AppliedRange;
  comparisonRange?: AppliedRange;
};

type UserPerformanceResponse = ReportEnvelope<UserPerformance[]>;

function buildUserPerformanceParams(
  startDate?: string,
  endDate?: string,
  compare?: boolean,
  userIds?: string[],
) {
  return {
    ...buildDateRangeParams(startDate, endDate),
    ...(typeof compare === "boolean" ? { compare } : {}),
    ...(userIds && userIds.length > 0 ? { userIds: userIds.join(",") } : {}),
  };
}

function buildDateRangeParams(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  return params;
}

export function useDashboard(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () =>
      api
        .get<DashboardResponse>(
          "/reports/dashboard",
          buildDateRangeParams(startDate, endDate),
        )
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
        .get<ReportEnvelope<SaleByPaymentMethod[]>>(
          "/reports/sales/payment-method",
          buildDateRangeParams(startDate, endDate),
        )
        .then((res) => res.data),
  });
}

export function useSalesByCategory(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["reports", "sales", "category", startDate, endDate],
    queryFn: () =>
      api
        .get<ReportEnvelope<SaleByCategory[]>>(
          "/reports/sales/category",
          buildDateRangeParams(startDate, endDate),
        )
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
        .get<ReportEnvelope<TopSellingProduct[]>>(
          "/reports/products/top-selling",
          {
            ...buildDateRangeParams(startDate, endDate),
            limit,
          },
        )
        .then((res) => res.data),
  });
}

export function useCustomerStatistics(
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ["reports", "customers", "statistics", startDate, endDate],
    queryFn: () =>
      api
        .get<CustomerStatistics>(
          "/reports/customers/statistics",
          buildDateRangeParams(startDate, endDate),
        )
        .then((res) => res.data),
  });
}

export function useDailySales(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["reports", "sales", "daily", startDate, endDate],
    queryFn: () =>
      api
        .get<ReportEnvelope<DailySale[]>>("/reports/sales/daily", {
          startDate,
          endDate,
        })
        .then((res) => res.data),
    enabled: !!startDate && !!endDate,
  });
}

export function useUserPerformance(
  startDate?: string,
  endDate?: string,
  compare = true,
  userIds?: string[],
) {
  const normalizedUserIds = userIds?.filter(Boolean) ?? [];

  return useQuery({
    queryKey: [
      "reports",
      "users",
      "performance",
      startDate,
      endDate,
      compare,
      normalizedUserIds.join(","),
    ],
    queryFn: () =>
      api
        .get<UserPerformanceResponse>(
          "/reports/users/performance",
          buildUserPerformanceParams(
            startDate,
            endDate,
            compare,
            normalizedUserIds,
          ),
        )
        .then((res) => res.data),
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
