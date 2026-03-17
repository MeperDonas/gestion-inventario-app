import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge variant contrast mapping", () => {
  it("keeps explicit light-mode contrast classes for default variant", () => {
    render(<Badge variant="default">Rol</Badge>);

    const badge = screen.getByText("Rol");
    expect(badge.className).toContain("bg-slate-200");
    expect(badge.className).toContain("text-slate-950");
    expect(badge.className).toContain("border-slate-500/80");
  });

  it("uses shared chipStyles source for secondary variant", () => {
    render(<Badge variant="secondary">Sin pago</Badge>);

    const badge = screen.getByText("Sin pago");
    expect(badge.className).toContain("bg-stone-200");
    expect(badge.className).toContain("text-stone-950");
    expect(badge.className).toContain("border-stone-500/80");
  });
});
