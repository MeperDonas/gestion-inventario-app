import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { Settings } from "@/types";

const {
  updateSettingsMutateAsyncMock,
  toastSuccessMock,
  toastErrorMock,
  settingsData,
} = vi.hoisted(() => ({
  updateSettingsMutateAsyncMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  settingsData: {
    companyName: "Mi Empresa",
    currency: "COP",
    taxRate: 19,
    receiptPrefix: "REC-",
    printHeader: "",
    printFooter: "",
    logoUrl: "",
    id: "settings-1",
  } satisfies Settings,
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => (
    <span role="img" aria-label={props.alt ?? "image"} />
  ),
}));

vi.mock("@/components/layout/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => ({
    data: settingsData,
    isLoading: false,
  }),
  useUpdateSettings: () => ({
    mutateAsync: updateSettingsMutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    success: toastSuccessMock,
    error: toastErrorMock,
    info: vi.fn(),
  }),
}));

import SettingsPage from "./page";

describe("Settings page behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateSettingsMutateAsyncMock.mockResolvedValue({} as never);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows only app settings controls and no user-management actions", async () => {
    render(<SettingsPage />);

    await screen.findByDisplayValue("Mi Empresa");

    expect(screen.getByRole("heading", { name: "Configuración General" })).not.toBeNull();
    expect(screen.queryByText("Gestión de Usuarios")).toBeNull();
    expect(screen.queryByTitle("Restablecer contraseña")).toBeNull();
    expect(screen.queryByTitle("Desactivar usuario")).toBeNull();
    expect(screen.queryByTitle("Activar usuario")).toBeNull();
    expect(screen.queryByTitle("Eliminar usuario")).toBeNull();
  });

  it("saves general settings successfully", async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    const companyInput = await screen.findByLabelText(/Nombre de la Empresa/i);
    await user.clear(companyInput);
    await user.type(companyInput, "Empresa Actualizada");
    await user.click(screen.getByRole("button", { name: "Guardar Configuración" }));

    expect(updateSettingsMutateAsyncMock).toHaveBeenCalledWith({
      companyName: "Empresa Actualizada",
      currency: "COP",
      taxRate: 19,
      receiptPrefix: "REC-",
      printHeader: "",
      printFooter: "",
      logoUrl: "",
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("Configuración guardada correctamente");
  });
});
