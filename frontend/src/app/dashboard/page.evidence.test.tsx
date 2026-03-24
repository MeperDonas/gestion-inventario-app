import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { DashboardData } from "@/types";

const pushMock = vi.fn();
const useDashboardMock = vi.fn();
const useDailySalesMock = vi.fn();
const useTasksMock = vi.fn();
const useTaskTimelineMock = vi.fn();
const useCreateTaskMock = vi.fn();
const useUpdateTaskMock = vi.fn();
const useUpdateTaskStatusMock = vi.fn();
const useDeleteTaskMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/layout/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useReports", () => ({
  useDashboard: (startDate?: string, endDate?: string) =>
    useDashboardMock(startDate, endDate),
  useDailySales: (startDate: string, endDate: string) =>
    useDailySalesMock(startDate, endDate),
}));

vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({
    data: { meta: { total: 4 } },
  }),
}));

vi.mock("@/hooks/useTasks", () => ({
  useTasks: () => useTasksMock(),
  useTaskTimeline: (taskId: string, options?: { enabled?: boolean }) =>
    useTaskTimelineMock(taskId, options),
  useCreateTask: () => useCreateTaskMock(),
  useUpdateTask: () => useUpdateTaskMock(),
  useUpdateTaskStatus: () => useUpdateTaskStatusMock(),
  useDeleteTask: () => useDeleteTaskMock(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Ana Admin", role: "ADMIN" },
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

import DashboardPage from "./page";

function makeTask(overrides: Record<string, unknown> = {}) {
  return {
    id: "task-1",
    title: "Revisar vitrina",
    description: null,
    status: "IN_PROGRESS",
    createdById: "user-1",
    assignedToId: null,
    dueDate: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T13:00:00.000Z",
    createdBy: { id: "user-1", name: "Ana Admin" },
    assignedTo: null,
    ...overrides,
  };
}

function makeDashboardData(input: Partial<DashboardData>): DashboardData {
  return {
    totalSales: 5,
    totalRevenue: 500000,
    totalProducts: 10,
    totalCustomers: 3,
    lowStockProducts: 1,
    trends: {
      totalSales: 2,
      totalRevenue: 5,
      totalCustomers: 1,
    },
    recentSales: [
      {
        id: "sale-1",
        saleNumber: 101,
        total: 50000,
        status: "COMPLETED",
        createdAt: "2026-01-01T12:00:00.000Z",
        customer: { id: "customer-1", name: "Cliente Uno" },
        items: [
          {
            id: "item-1",
            quantity: 1,
            total: 50000,
            product: { id: "product-1", name: "Producto Uno" },
          },
        ],
      },
    ],
    appliedRange: {
      startDate: "2026-01-01",
      endDate: "2026-01-07",
      timezone: "America/Bogota",
    },
    ...input,
  };
}

describe("Dashboard date semantics and drill-down evidence (#17/#16/#15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useTasksMock.mockReturnValue({ data: { tasks: [], source: "remote" } });
    useTaskTimelineMock.mockReturnValue({ data: [], isLoading: false });
    useCreateTaskMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useUpdateTaskMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useUpdateTaskStatusMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useDeleteTaskMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    useDailySalesMock.mockReturnValue({
      data: {
        data: [
          { date: "2026-01-01", total: 50000, subtotal: 42000, tax: 8000, count: 1 },
        ],
      },
    });

    useDashboardMock.mockImplementation((startDate?: string, endDate?: string) => {
      if (startDate === "2026-01-10" && endDate === "2026-01-12") {
        return {
          data: makeDashboardData({
            totalSales: 9,
            totalRevenue: 900000,
            appliedRange: {
              startDate: "2026-01-10",
              endDate: "2026-01-12",
              timezone: "America/Bogota",
            },
          }),
          isLoading: false,
          error: null,
        };
      }

      return {
        data: makeDashboardData({
          totalSales: 3,
          totalRevenue: 300000,
        }),
        isLoading: false,
        error: null,
      };
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("applies valid range and updates KPI context with visible range label", async () => {
    render(<DashboardPage />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    await userEvent.type(dateInputs[0] as HTMLInputElement, "2026-01-10");
    await userEvent.type(dateInputs[1] as HTMLInputElement, "2026-01-12");
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    await waitFor(() => {
      expect(useDashboardMock).toHaveBeenCalledWith("2026-01-10", "2026-01-12");
    });
    expect(useDailySalesMock).toHaveBeenCalledWith("2026-01-10", "2026-01-12");

    expect(
      screen.getByText(/10\s+de\s+ene\s+de\s+2026\s+-\s+12\s+de\s+ene\s+de\s+2026/i),
    ).toBeTruthy();
  });

  it("rejects invalid range without mutating KPI values", async () => {
    render(<DashboardPage />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    await userEvent.type(dateInputs[0] as HTMLInputElement, "2026-01-20");
    await userEvent.type(dateInputs[1] as HTMLInputElement, "2026-01-10");
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(
      screen.getByText("La fecha Hasta no puede ser anterior a la fecha Desde."),
    ).toBeTruthy();
    expect(useDashboardMock).not.toHaveBeenCalledWith("2026-01-20", "2026-01-10");
    expect(useDailySalesMock).not.toHaveBeenCalledWith("2026-01-20", "2026-01-10");
  });

  it("renders zero-data states safely", async () => {
    useDashboardMock.mockReturnValue({
      data: makeDashboardData({
        totalSales: 0,
        totalRevenue: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        recentSales: [],
      }),
      isLoading: false,
      error: null,
    });

    render(<DashboardPage />);

    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("No hay ventas registradas")).toBeTruthy();
  });

  it("navigates to detail path from recent-sales row", async () => {
    render(<DashboardPage />);

    await userEvent.click(screen.getByText("#101"));
    expect(pushMock).toHaveBeenCalledWith("/sales/sale-1");
  });

  it("shows backend-driven task timeline and avoids silent local fallback", async () => {
    useTasksMock.mockReturnValue({
      data: {
        tasks: [makeTask()],
        source: "remote",
      },
    });
    useTaskTimelineMock.mockReturnValue({
      data: [
        {
          id: "event-1",
          taskId: "task-1",
          type: "STATUS_CHANGED",
          fromStatus: "PENDING",
          toStatus: "IN_PROGRESS",
          note: "Tomada por caja",
          createdById: "user-1",
          createdAt: "2026-01-10T13:00:00.000Z",
          createdBy: { id: "user-1", name: "Ana Admin" },
        },
      ],
      isLoading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText("API real")).toBeTruthy();
    expect(screen.getByText("Historial")).toBeTruthy();
    expect(screen.getByText("Cambio de estado")).toBeTruthy();
    expect(screen.getByText(/Pendiente -> En curso/i)).toBeTruthy();
    expect(screen.getByText(/Ana Admin - Tomada por caja/i)).toBeTruthy();
    expect(screen.queryByText(/compatibilidad temporal con localStorage/i)).toBeNull();
  });

  it("edits the selected task against the backend update endpoint", async () => {
    useTasksMock.mockReturnValue({
      data: {
        tasks: [makeTask({ description: "Pendiente de revision" })],
        source: "remote",
      },
    });

    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useUpdateTaskMock.mockReturnValue({ mutateAsync, isPending: false });

    render(<DashboardPage />);

    await userEvent.click(screen.getByRole("button", { name: "Editar" }));

    const titleInput = screen.getByDisplayValue("Revisar vitrina");
    const descriptionInput = screen.getByDisplayValue("Pendiente de revision");

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Revisar vitrina principal");
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, "Validar carteles y precios");
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "task-1",
        data: {
          title: "Revisar vitrina principal",
          description: "Validar carteles y precios",
        },
      });
    });
  });

  it("clears the selected timeline query before deleting the selected task", async () => {
    useTasksMock.mockReturnValue({
      data: {
        tasks: [makeTask()],
        source: "remote",
      },
    });

    let resolveDelete: (() => void) | undefined;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });

    const mutateAsync = vi.fn().mockReturnValue(deletePromise);
    useDeleteTaskMock.mockReturnValue({ mutateAsync, isPending: false });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(useTaskTimelineMock).toHaveBeenLastCalledWith("task-1", { enabled: true });
    });

    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(useTaskTimelineMock).toHaveBeenLastCalledWith("", { enabled: false });
    });

    resolveDelete?.();
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith("task-1");
    });
  });

  it("switches away from a completed selection before bulk delete", async () => {
    useTasksMock.mockReturnValue({
      data: {
        tasks: [
          makeTask({ id: "task-completed", status: "COMPLETED" }),
          makeTask({
            id: "task-pending",
            title: "Contar caja",
            status: "PENDING",
          }),
        ],
        source: "remote",
      },
    });

    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useDeleteTaskMock.mockReturnValue({ mutateAsync, isPending: false });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(useTaskTimelineMock).toHaveBeenLastCalledWith("task-completed", {
        enabled: true,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Borrar completadas" }));

    await waitFor(() => {
      expect(useTaskTimelineMock).toHaveBeenLastCalledWith("task-pending", {
        enabled: true,
      });
    });

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith("task-completed");
  });
});
