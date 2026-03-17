"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { safeGetItem, safeSetItem } from "@/lib/utils";
import type { Task, TaskEvent, TaskStatus } from "@/types";

type CreateTaskPayload = {
  title: string;
  description?: string;
};

const TASKS_MODE = process.env.NEXT_PUBLIC_TASKS_MODE === "remote" ? "remote" : "local";
const TASKS_FALLBACK_STORAGE_KEY = "dashboard_shop_notes_v2";

type FallbackTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

function getFallbackTasks(): Task[] {
  try {
    const raw = safeGetItem(TASKS_FALLBACK_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as FallbackTask[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((task) => ({
      id: String(task.id),
      title: String(task.title ?? "").trim(),
      description: task.description ?? null,
      status: task.status ?? "PENDING",
      createdById: "local",
      assignedToId: null,
      dueDate: null,
      createdAt: task.createdAt ?? new Date().toISOString(),
      updatedAt: task.updatedAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function setFallbackTasks(tasks: Task[]) {
  const serialized = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));

  safeSetItem(TASKS_FALLBACK_STORAGE_KEY, JSON.stringify(serialized));
}

function isFallbackError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return true;
  }

  const maybeError = error as { response?: { status?: number } };
  const status = maybeError.response?.status;

  return status === 404 || status === 405 || status === 501;
}

function createLocalTask(payload: CreateTaskPayload) {
  const current = getFallbackTasks();
  const now = new Date().toISOString();
  const createdTask: Task = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    title: payload.title,
    description: payload.description ?? null,
    status: "PENDING",
    createdById: "local",
    assignedToId: null,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
  };

  setFallbackTasks([createdTask, ...current].slice(0, 12));
  return createdTask;
}

function updateLocalTaskStatus(id: string, status: TaskStatus) {
  const current = getFallbackTasks();
  const updated = current.map((task) =>
    task.id === id
      ? { ...task, status, updatedAt: new Date().toISOString() }
      : task,
  );
  setFallbackTasks(updated);
  return updated.find((task) => task.id === id)!;
}

function deleteLocalTask(id: string) {
  const current = getFallbackTasks();
  setFallbackTasks(current.filter((task) => task.id !== id));
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (TASKS_MODE === "local") {
        return getFallbackTasks();
      }

      try {
        const response = await api.get<Task[]>("/tasks");
        return response.data;
      } catch (error) {
        if (isFallbackError(error)) {
          return getFallbackTasks();
        }
        throw error;
      }
    },
  });
}

export function useTaskTimeline(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "timeline"],
    queryFn: async () => {
      if (TASKS_MODE === "local") {
        return [];
      }

      const response = await api.get<TaskEvent[]>(`/tasks/${taskId}/timeline`);
      return response.data;
    },
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      if (TASKS_MODE === "local") {
        return createLocalTask(payload);
      }

      try {
        const response = await api.post<Task>("/tasks", payload);
        return response.data;
      } catch (error) {
        if (!isFallbackError(error)) {
          throw error;
        }

        return createLocalTask(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (TASKS_MODE === "local") {
        return updateLocalTaskStatus(id, status);
      }

      try {
        const response = await api.put<Task>(`/tasks/${id}/status`, { status });
        return response.data;
      } catch (error) {
        if (!isFallbackError(error)) {
          throw error;
        }

        return updateLocalTaskStatus(id, status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (TASKS_MODE === "local") {
        deleteLocalTask(id);
        return;
      }

      try {
        await api.delete(`/tasks/${id}`);
      } catch (error) {
        if (!isFallbackError(error)) {
          throw error;
        }

        deleteLocalTask(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
