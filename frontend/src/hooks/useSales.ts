"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Sale, PaginatedResponse, CartItem } from "@/types";

export function useSales(params?: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () =>
      api.get<PaginatedResponse<Sale>>("/sales", params).then(
        (res) => res.data
      ),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () =>
      api.get<Sale>(`/sales/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useSaleByNumber(saleNumber: number) {
  return useQuery({
    queryKey: ["sale", "number", saleNumber],
    queryFn: () =>
      api.get<Sale>(`/sales/number/${saleNumber}`).then((res) => res.data),
    enabled: !!saleNumber,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      customerId?: string;
      items: Omit<CartItem, "product">[];
      discountAmount?: number;
      payments?: Array<{
        method: "CASH" | "CARD" | "TRANSFER";
        amount: number;
      }>;
    }) =>
      api.post<Sale>("/sales", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateSaleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put<Sale>(`/sales/${id}`, { status }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
