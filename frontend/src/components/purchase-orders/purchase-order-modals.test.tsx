import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { Product, PurchaseOrder, Supplier } from "@/types";

const cancelMutateAsyncMock = vi.fn();
const receiveMutateAsyncMock = vi.fn();
const updateMutateAsyncMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

const suppliersData: Supplier[] = [
  {
    id: "supplier-1",
    name: "Proveedor Andino",
    documentNumber: "900123456",
    active: true,
    createdAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
  },
];

const productsData: Product[] = [
  {
    id: "prod-1",
    name: "Producto Uno",
    sku: "SKU-1",
    barcode: null,
    description: null,
    costPrice: 100,
    salePrice: 150,
    taxRate: 19,
    stock: 10,
    minStock: 1,
    imageUrl: null,
    categoryId: "cat-1",
    active: true,
    createdAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    version: 1,
  },
];

vi.mock("@/components/ui/Modal", () => ({
  Modal: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title?: string;
    children: ReactNode;
  }) =>
    isOpen ? (
      <section>
        {title ? <h2>{title}</h2> : null}
        {children}
      </section>
    ) : null,
}));

vi.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/hooks/usePurchaseOrders", () => ({
  useCancelPurchaseOrder: () => ({
    mutateAsync: cancelMutateAsyncMock,
    isPending: false,
  }),
  useReceivePurchaseOrder: () => ({
    mutateAsync: receiveMutateAsyncMock,
    isPending: false,
  }),
  useUpdatePurchaseOrder: () => ({
    mutateAsync: updateMutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/useSuppliers", () => ({
  useSuppliers: () => ({ data: { data: suppliersData }, isLoading: false }),
}));

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({ data: { data: productsData }, isLoading: false }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    success: toastSuccessMock,
    error: toastErrorMock,
    info: vi.fn(),
  }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getApiErrorMessage: () => "Error",
  };
});

import { CancelPurchaseOrderModal } from "./CancelPurchaseOrderModal";
import { ReceiveItemsModal } from "./ReceiveItemsModal";
import { EditDraftModal } from "./EditDraftModal";

function makeOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  return {
    id: "po-1",
    orderNumber: 12,
    supplierId: "supplier-1",
    supplier: suppliersData[0],
    createdById: "user-1",
    createdBy: { id: "user-1", name: "Admin" },
    status: "DRAFT",
    subtotal: 500,
    taxAmount: 95,
    total: 595,
    notes: "Urgente",
    confirmedAt: null,
    receivedAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: "2026-04-19T09:00:00.000Z",
    updatedAt: "2026-04-19T09:00:00.000Z",
    items: [
      {
        id: "poi-1",
        purchaseOrderId: "po-1",
        productId: "prod-1",
        product: { id: "prod-1", name: "Producto Uno", sku: "SKU-1" },
        qtyOrdered: 5,
        qtyReceived: 2,
        unitCost: 100,
        taxRate: 19,
        subtotal: 500,
        taxAmount: 95,
      },
    ],
    ...overrides,
  };
}

describe("Purchase order modals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cancelMutateAsyncMock.mockResolvedValue({} as never);
    receiveMutateAsyncMock.mockResolvedValue({
      ...makeOrder({ status: "PARTIAL_RECEIVED" }),
    } as never);
    updateMutateAsyncMock.mockResolvedValue({} as never);
  });

  afterEach(() => {
    cleanup();
  });

  it("submits a trimmed cancel reason once it is valid", async () => {
    const user = userEvent.setup();

    render(
      <CancelPurchaseOrderModal
        orderId="po-1"
        orderNumber={12}
        isOpen
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "  Pedido duplicado  ");
    await user.click(screen.getByRole("button", { name: /Cancelar orden/i }));

    expect(cancelMutateAsyncMock).toHaveBeenCalledWith({
      id: "po-1",
      reason: "Pedido duplicado",
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("OC-12 cancelada");
  });

  it("initializes receive inputs with pending quantities and submits only positive rows", async () => {
    const user = userEvent.setup();

    render(
      <ReceiveItemsModal
        order={makeOrder({ status: "PARTIAL_RECEIVED" })}
        isOpen
        onClose={vi.fn()}
      />,
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("3");

    await user.clear(input);
    await user.type(input, "1");
    await user.click(screen.getByRole("button", { name: /Confirmar recepción/i }));

    expect(receiveMutateAsyncMock).toHaveBeenCalledWith({
      id: "po-1",
      items: [{ itemId: "poi-1", qtyReceivedNow: 1 }],
    });
  });

  it("boots draft editing state from the order snapshot on mount", async () => {
    const user = userEvent.setup();

    render(<EditDraftModal order={makeOrder()} isOpen onClose={vi.fn()} />);

    expect(screen.getByDisplayValue("Urgente")).toBeTruthy();
    expect(screen.getByDisplayValue("5")).toBeTruthy();
    expect(screen.getByText("Producto Uno")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /Guardar cambios/i }));

    expect(updateMutateAsyncMock).toHaveBeenCalledWith({
      id: "po-1",
      data: {
        supplierId: "supplier-1",
        notes: "Urgente",
        items: [
          {
            productId: "prod-1",
            qtyOrdered: 5,
            unitCost: 100,
            taxRate: 19,
          },
        ],
      },
    });
  });
});
