import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const useDashboardMock = vi.fn();
const useSalesByPaymentMethodMock = vi.fn();
const useSalesByCategoryMock = vi.fn();
const useTopSellingProductsMock = vi.fn();
const useCustomerStatisticsMock = vi.fn();
const useUserPerformanceMock = vi.fn();
const useUsersMock = vi.fn();

vi.mock("@/components/layout/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/reports/ImportSection", () => ({
  ImportSection: () => <section>ImportSection</section>,
}));

vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    exportData: vi.fn(),
  },
  getApiErrorMessage: () => "error",
}));

vi.mock("@/hooks/useReports", () => ({
  useDashboard: (startDate?: string, endDate?: string) =>
    useDashboardMock(startDate, endDate),
  useSalesByPaymentMethod: (startDate?: string, endDate?: string) =>
    useSalesByPaymentMethodMock(startDate, endDate),
  useSalesByCategory: (startDate?: string, endDate?: string) =>
    useSalesByCategoryMock(startDate, endDate),
  useTopSellingProducts: (startDate?: string, endDate?: string, limit?: number) =>
    useTopSellingProductsMock(startDate, endDate, limit),
  useCustomerStatistics: (startDate?: string, endDate?: string) =>
    useCustomerStatisticsMock(startDate, endDate),
  useUserPerformance: (
    startDate?: string,
    endDate?: string,
    compare?: boolean,
    userIds?: string[],
  ) => useUserPerformanceMock(startDate, endDate, compare, userIds),
}));

vi.mock("@/hooks/useUsers", () => ({
  useUsers: () => useUsersMock(),
}));

import ReportsPage from "./page";

describe("Reports range label semantics evidence (#16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useDashboardMock.mockReturnValue({
      data: {
        totalSales: 3,
        totalRevenue: 100000,
        totalProducts: 20,
        totalCustomers: 6,
        lowStockProducts: 2,
        trends: { totalSales: 1, totalRevenue: 2, totalCustomers: 1 },
        recentSales: [],
        appliedRange: {
          startDate: "2026-01-10",
          endDate: "2026-01-12",
          timezone: "America/Bogota",
        },
      },
    });

    useSalesByPaymentMethodMock.mockReturnValue({
      data: {
        data: [{ paymentMethod: "CASH", total: 100000, subtotal: 90000, count: 3 }],
        appliedRange: {
          startDate: "2026-01-10",
          endDate: "2026-01-12",
          timezone: "America/Bogota",
        },
      },
      isLoading: false,
    });

    useSalesByCategoryMock.mockReturnValue({
      data: {
        data: [{ category: "Repuestos", total: 100000, quantity: 4 }],
        appliedRange: {
          startDate: "2026-01-10",
          endDate: "2026-01-12",
          timezone: "America/Bogota",
        },
      },
      isLoading: false,
    });

    useTopSellingProductsMock.mockReturnValue({
      data: {
        data: [{ productId: "p-1", productName: "Casco", quantity: 4, total: 100000, stock: 8 }],
        appliedRange: {
          startDate: "2026-01-10",
          endDate: "2026-01-12",
          timezone: "America/Bogota",
        },
      },
      isLoading: false,
    });

    useCustomerStatisticsMock.mockReturnValue({
      data: {
        totalCustomers: 6,
        activeCustomers: 3,
        topCustomers: [
          {
            customerId: "c-1",
            customerName: "Cliente Uno",
            totalSales: 2,
            totalRevenue: 50000,
          },
        ],
        appliedRange: {
          startDate: "2026-01-10",
          endDate: "2026-01-12",
          timezone: "America/Bogota",
        },
      },
      isLoading: false,
    });

    useUserPerformanceMock.mockReturnValue({
      data: {
        data: [],
        appliedRange: {
          startDate: "2026-01-10",
          endDate: "2026-01-12",
          timezone: "America/Bogota",
        },
        comparisonRange: {
          startDate: "2026-01-07",
          endDate: "2026-01-09",
          timezone: "America/Bogota",
        },
      },
      isLoading: false,
      error: null,
    });

    useUsersMock.mockReturnValue({
      data: [
        {
          id: "user-1",
          name: "Ana Admin",
          email: "ana@example.com",
          role: "ADMIN",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "user-2",
          name: "Carlos Caja",
          email: "carlos@example.com",
          role: "CASHIER",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows appliedRange labels consistently in key report sections", async () => {
    render(<ReportsPage />);

    const rangeChips = screen.getAllByText(
      /10\s+de\s+ene\s+de\s+2026\s+-\s+12\s+de\s+ene\s+de\s+2026/i,
    );
    expect(rangeChips.length).toBeGreaterThanOrEqual(5);

    expect(screen.getByText("Composición por Categoría")).toBeTruthy();
    expect(screen.getByText("Productos Más Vendidos")).toBeTruthy();
    expect(screen.getByText("Top Clientes")).toBeTruthy();
    expect(screen.getByText("Métodos de Pago")).toBeTruthy();
    expect(
      screen.getAllByText(/10\s+de\s+ene\s+de\s+2026\s+-\s+12\s+de\s+ene\s+de\s+2026/i)
        .length,
    ).toBeGreaterThanOrEqual(6);
    expect(screen.getByText(/vs\.?\s*07\s+de\s+ene\s+de\s+2026\s+-\s+09\s+de\s+ene\s+de\s+2026/i)).toBeTruthy();
  });

  it("passes a selected user subset to the performance hook", async () => {
    render(<ReportsPage />);

    expect(useUserPerformanceMock).toHaveBeenCalledWith("", "", true, undefined);

    await userEvent.click(screen.getByRole("button", { name: "Carlos Caja" }));

    expect(useUserPerformanceMock).toHaveBeenLastCalledWith(
      "",
      "",
      true,
      ["user-2"],
    );
    expect(screen.getByText("1 seleccionado")).toBeTruthy();
  });
});
