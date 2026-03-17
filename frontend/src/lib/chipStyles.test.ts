import { describe, expect, it } from "vitest";
import { chipStyles, getTrendChipClass } from "@/lib/chipStyles";

describe("chipStyles light-mode contrast", () => {
  it("returns explicit high-contrast classes for KPI trend chips", () => {
    const positive = getTrendChipClass(true);
    const negative = getTrendChipClass(false);

    expect(positive).toContain("text-emerald-950");
    expect(negative).toContain("text-rose-950");
    expect(positive).not.toMatch(/text-[^\s]*\/\d+/);
    expect(negative).not.toMatch(/text-[^\s]*\/\d+/);
  });

  it("keeps user and sales badge variants on explicit dark text", () => {
    expect(chipStyles.neutral).toContain("text-slate-950");
    expect(chipStyles.success).toContain("text-emerald-950");
    expect(chipStyles.danger).toContain("text-rose-950");
    expect(chipStyles.secondary).toContain("text-stone-950");
  });
});
