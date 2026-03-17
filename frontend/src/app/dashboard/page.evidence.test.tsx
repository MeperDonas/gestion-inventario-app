import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { DashboardData } from "@/types";

const pushMock = vi.fn();
const useDashboardMock = vi.fn();
const useDailySalesMock = vi.fn();
const useTasksMock = vi.fn();
const useCreateTaskMock = vi.fn();
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
  useCreateTask: () => useCreateTaskMock(),
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

    useTasksMock.mockReturnValue({ data: [] });
    useCreateTaskMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
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
});
