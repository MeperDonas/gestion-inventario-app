"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Task,
  TaskEvent,
  TaskListResult,
  TaskStatus,
} from "@/types";

type CreateTaskPayload = {
  title: string;
  description?: string;
};

type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
};

type TimelineQueryOptions = {
  enabled?: boolean;
};

function getErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  return (error as { response?: { status?: number } }).response?.status;
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskListResult> => {
      const response = await api.get<Task[]>("/tasks", {
        includeCompleted: true,
        limit: 20,
      });
      return { tasks: response.data, source: "remote" };
    },
  });
}

export function useTaskTimeline(taskId: string, options?: TimelineQueryOptions) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["tasks", taskId, "timeline"],
    queryFn: async () => {
      const response = await api.get<TaskEvent[]>(`/tasks/${taskId}/timeline`);
      return response.data;
    },
    enabled: enabled && !!taskId,
    retry: (failureCount, error) => {
      if (getErrorStatus(error) === 404) {
        return false;
      }

      return failureCount < 3;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      api.post<Task>("/tasks", payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      api.put<Task>(`/tasks/${id}`, data).then((response) => response.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id, "timeline"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: TaskStatus;
      note?: string;
    }) => api.put<Task>(`/tasks/${id}/status`, { status, note }).then((response) => response.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id, "timeline"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", id, "timeline"] });
    },
  });
}
