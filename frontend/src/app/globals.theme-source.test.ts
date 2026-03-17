import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("global theme source configuration", () => {
  const globalsCss = readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");

  it("binds Tailwind dark variant to the app dark class", () => {
    expect(globalsCss).toContain("@custom-variant dark (&:where(.dark, .dark *));");
  });

  it("maps browser color-scheme to the selected app theme", () => {
    expect(globalsCss).toContain(":root {");
    expect(globalsCss).toContain("color-scheme: light;");
    expect(globalsCss).toContain(".dark {");
    expect(globalsCss).toContain("color-scheme: dark;");
  });
});
