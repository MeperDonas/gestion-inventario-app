"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Settings, InventoryMovement, PaginatedResponse } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      api.get<Settings>("/settings").then((res) => res.data),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Settings>) =>
      api.put<Settings>("/settings", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useInventoryMovements(params?: {
  page?: number;
  limit?: number;
  productId?: string;
}) {
  return useQuery({
    queryKey: ["inventory-movements", params],
    queryFn: () =>
      api.get<PaginatedResponse<InventoryMovement>>("/exports/inventory", {
        ...params,
        format: "json",
      }).then((res) => res.data),
  });
}
