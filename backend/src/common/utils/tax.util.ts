import { Decimal } from '@prisma/client/runtime/library';

/**
 * Resolves the effective tax rate for a product following this precedence:
 *
 *   1. Product-level taxRate (explicit override) → ALWAYS wins
 *   2. Category defaultTaxRate                   → fallback
 *   3. Settings global taxRate                   → final fallback
 *
 * "Explicit override" on a product means the taxRate was explicitly provided
 * (non-null/undefined in the input). Since Product.taxRate has @default(0),
 * a value of 0 stored in the DB means "not explicitly set" for the purpose
 * of fallback resolution.
 *
 * @param productTaxRate        - The product's own taxRate (from DB or DTO)
 * @param categoryDefaultRate   - The product's category defaultTaxRate (nullable)
 * @param settingsRate          - The global settings taxRate
 * @returns                     - The effective tax rate as a number
 */
export function resolveEffectiveTaxRate(
  productTaxRate: number | Decimal | null | undefined,
  categoryDefaultRate: number | Decimal | null | undefined,
  settingsRate: number | Decimal,
): number {
  const settings = toNumber(settingsRate);

  // 1. Product-level explicit override
  if (productTaxRate != null) {
    const productRate = toNumber(productTaxRate);
    // A non-zero product taxRate is treated as an explicit override
    if (productRate > 0) {
      return productRate;
    }
  }

  // 2. Category default fallback
  if (categoryDefaultRate != null) {
    const categoryRate = toNumber(categoryDefaultRate);
    if (categoryRate > 0) {
      return categoryRate;
    }
  }

  // 3. Global settings fallback
  return settings;
}

/**
 * Determines whether a product's taxRate was explicitly set (override)
 * vs relying on the default value of 0.
 *
 * A taxRate of exactly 0 is considered "not explicitly set" since
 * Product.taxRate has @default(0) in the schema.
 */
export function hasExplicitTaxOverride(
  productTaxRate: number | Decimal | null | undefined,
): boolean {
  if (productTaxRate == null) return false;
  return toNumber(productTaxRate) > 0;
}

/**
 * Safely converts a Decimal or number to a plain JS number.
 */
function toNumber(value: number | Decimal): number {
  if (typeof value === 'number') return value;
  return Number(value.toString());
}
