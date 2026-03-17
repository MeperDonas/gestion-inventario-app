import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEvent, ReactNode } from "react";
import type { Product, Sale } from "@/types";

type UseProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

const useProductsMock = vi.fn();
const createSaleMutateMock = vi.fn();

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}));

vi.mock("@/components/layout/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/products/ProductCard", () => ({
  ProductCard: ({ product, onClick }: { product: Product; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {product.name}
    </button>
  ),
}));

vi.mock("@/components/pos/PaymentMethodCards", () => ({
  PaymentMethodCards: ({
    onMethodChange,
  }: {
    onMethodChange: (method: "CASH" | "CARD" | "TRANSFER") => void;
  }) => (
    <div>
      <button type="button" onClick={() => onMethodChange("CASH")}>
        Efectivo
      </button>
      <button type="button" onClick={() => onMethodChange("CARD")}>
        Tarjeta
      </button>
      <button type="button" onClick={() => onMethodChange("TRANSFER")}>
        Transferencia
      </button>
    </div>
  ),
}));

vi.mock("@/components/pos/PaymentConfirmationModal", () => ({
  PaymentConfirmationModal: ({
    isOpen,
    onConfirm,
  }: {
    isOpen: boolean;
    onConfirm: () => Promise<void>;
  }) =>
    isOpen ? (
      <button type="button" onClick={() => void onConfirm()}>
        Confirmar pago
      </button>
    ) : null,
}));

vi.mock("@/components/ui/Input", () => ({
  Input: ({ value, onChange, placeholder }: { value?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, onClick, disabled, type }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" | "reset" }) => (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Badge", () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/ui/Modal", () => ({
  Modal: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title?: string;
    children: ReactNode;
  }) => (isOpen ? <section aria-label={title}>{children}</section> : null),
}));

vi.mock("@/components/ui/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}));

vi.mock("@/hooks/useProducts", () => ({
  useProducts: (params?: UseProductsParams) => useProductsMock(params),
}));

vi.mock("@/hooks/useCustomers", () => ({
  useCustomers: () => ({
    data: {
      data: [
        {
          id: "customer-1",
          name: "Ana Perez",
          documentType: "CC",
          documentNumber: "123",
          email: null,
          phone: null,
          address: null,
          segment: "OCCASIONAL",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    },
  }),
}));

vi.mock("@/hooks/useSales", () => ({
  useCreateSale: () => ({
    mutateAsync: createSaleMutateMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/usePausedSales", () => ({
  usePausedSales: () => ({
    pausedSales: [],
    pauseSale: vi.fn(),
    resumeSale: vi.fn(),
    deletePausedSale: vi.fn(),
  }),
}));

vi.mock("@/hooks/useReceipt", () => ({
  printReceipt: vi.fn(),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

import POSPage from "./page";

function makeProduct(id: string, name: string): Product {
  return {
    id,
    name,
    sku: `sku-${id}`,
    barcode: null,
    description: null,
    costPrice: 1000,
    salePrice: 1000,
    taxRate: 0,
    stock: 10,
    minStock: 1,
    imageUrl: null,
    categoryId: "cat-1",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: 1,
  };
}

function makeSale(): Sale {
  return {
    id: "sale-1",
    saleNumber: 101,
    customerId: null,
    subtotal: 1000,
    taxAmount: 0,
    discountAmount: 0,
    total: 1000,
    amountPaid: 1000,
    change: 0,
    status: "COMPLETED",
    userId: "user-1",
    items: [],
    payments: [{ id: "pay-1", saleId: "sale-1", method: "CARD", amount: 1000, createdAt: "2026-01-01T00:00:00.000Z" }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("POS behavior evidence (#19, #18)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSaleMutateMock.mockResolvedValue(makeSale());
  });

  afterEach(() => {
    cleanup();
  });

  it("#19 paginates products and keeps interaction available during page fetch", async () => {
    useProductsMock.mockImplementation((params?: UseProductsParams) => {
      if (params?.search === "nada") {
        return {
          data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } },
          isLoading: false,
          isFetching: false,
        };
      }

      if (params?.page === 2) {
        return {
          data: { data: [makeProduct("2", "Producto Pagina 2")], meta: { total: 2, page: 2, limit: 20, totalPages: 2 } },
          isLoading: false,
          isFetching: true,
        };
      }

      return {
        data: { data: [makeProduct("1", "Producto Pagina 1")], meta: { total: 2, page: 1, limit: 20, totalPages: 2 } },
        isLoading: false,
        isFetching: false,
      };
    });

    render(<POSPage />);

    expect(screen.getByText("Producto Pagina 1")).toBeTruthy();
    expect(screen.getByText("1 / 2")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.getByText("Producto Pagina 2")).toBeTruthy();
    expect(screen.getByText("2 / 2")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Producto Pagina 2" }));
    expect(screen.getByText("1 en carrito")).toBeTruthy();
  });

  it("#19 shows explicit empty state when search has no results", async () => {
    useProductsMock.mockImplementation((params?: UseProductsParams) => {
      if (params?.search === "sinresultados") {
        return {
          data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } },
          isLoading: false,
          isFetching: false,
        };
      }

      return {
        data: { data: [makeProduct("1", "Producto Base")], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } },
        isLoading: false,
        isFetching: false,
      };
    });

    render(<POSPage />);
    await userEvent.type(screen.getByPlaceholderText("Buscar por nombre, SKU o código..."), "sinresultados");

    await waitFor(() => {
      expect(screen.getByText("No se encontraron productos")).toBeTruthy();
    }, { timeout: 2000 });
  });

  it("#18 keeps customer selector near checkout, preserves total, and allows checkout without customer", async () => {
    useProductsMock.mockReturnValue({
      data: { data: [makeProduct("1", "Producto Checkout")], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } },
      isLoading: false,
      isFetching: false,
    });

    render(<POSPage />);

    await userEvent.click(screen.getByRole("button", { name: "Producto Checkout" }));

    const customerLabel = screen.getByText("Cliente (opcional)");
    const totalLabel = screen.getByText("Total");
    expect(customerLabel.compareDocumentPosition(totalLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const totalValueBefore = totalLabel.parentElement?.querySelectorAll("span")[1]?.textContent;
    await userEvent.click(screen.getByRole("button", { name: /sin cliente/i }));
    await userEvent.click(screen.getByText("Ana Perez"));
    const totalValueAfter = totalLabel.parentElement?.querySelectorAll("span")[1]?.textContent;

    expect(totalValueBefore).toBe(totalValueAfter);

    await userEvent.click(screen.getByRole("button", { name: /ana perez/i }));
    await userEvent.click(screen.getByText("Cliente General"));

    await userEvent.click(screen.getByRole("button", { name: /tarjeta/i }));
    await userEvent.click(screen.getByRole("button", { name: /finalizar venta/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(createSaleMutateMock).toHaveBeenCalled();
    });

    const payload = createSaleMutateMock.mock.calls[0]?.[0] as { customerId?: string };
    expect(payload.customerId).toBeUndefined();
  });
});
