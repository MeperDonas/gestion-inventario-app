"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/contexts/AuthContext";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) =>
      api.put<User>("/auth/profile", data).then((res) => res.data),
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data));
      queryClient.setQueryData(["auth"], data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post("/auth/change-password", data).then((res) => res.data),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<User>("/auth/profile").then((res) => res.data),
  });
}
