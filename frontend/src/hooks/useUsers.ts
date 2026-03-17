"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types";

type CreateUserPayload = {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "CASHIER" | "INVENTORY_USER";
};

type UpdateUserPayload = {
  name?: string;
  role?: "ADMIN" | "CASHIER" | "INVENTORY_USER";
};

async function getUsersRequest() {
  return api.get<User[]>("/auth/users");
}

async function createUserRequest(data: CreateUserPayload) {
  return api.post<User>("/auth/users", data);
}

async function updateUserRequest(id: string, data: UpdateUserPayload) {
  try {
    return await api.put<User>(`/users/${id}`, data);
  } catch {
    return api.put<User>(`/auth/users/${id}`, data);
  }
}

async function toggleUserActiveRequest(id: string) {
  return api.put<User>(`/auth/users/${id}/toggle-active`, {});
}

async function deleteUserRequest(id: string) {
  return api.delete(`/auth/users/${id}`);
}

async function resetPasswordRequest(userId: string, newPassword: string) {
  try {
    return await api.post(`/users/${userId}/reset-password`, { newPassword });
  } catch {
    return api.post("/auth/admin-reset-password", { userId, newPassword });
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) =>
      createUserRequest(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      updateUserRequest(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleUserActiveRequest(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserRequest(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      resetPasswordRequest(userId, newPassword),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsersRequest().then((res) => res.data),
  });
}
