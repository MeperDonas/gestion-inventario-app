import { resolveEffectiveTaxRate, hasExplicitTaxOverride } from './tax.util';
import { Decimal } from '@prisma/client/runtime/library';

describe('resolveEffectiveTaxRate', () => {
  const SETTINGS_RATE = 19;
  const CATEGORY_RATE = 16;
  const PRODUCT_RATE = 5;

  describe('product-level override takes precedence', () => {
    it('should use product taxRate when it is non-zero', () => {
      const result = resolveEffectiveTaxRate(
        PRODUCT_RATE,
        CATEGORY_RATE,
        SETTINGS_RATE,
      );
      expect(result).toBe(PRODUCT_RATE);
    });

    it('should use product taxRate even when category is null', () => {
      const result = resolveEffectiveTaxRate(PRODUCT_RATE, null, SETTINGS_RATE);
      expect(result).toBe(PRODUCT_RATE);
    });

    it('should accept Decimal product taxRate', () => {
      const result = resolveEffectiveTaxRate(
        new Decimal('8.5'),
        CATEGORY_RATE,
        SETTINGS_RATE,
      );
      expect(result).toBe(8.5);
    });
  });

  describe('category default fallback', () => {
    it('should use category defaultRate when product taxRate is 0', () => {
      const result = resolveEffectiveTaxRate(0, CATEGORY_RATE, SETTINGS_RATE);
      expect(result).toBe(CATEGORY_RATE);
    });

    it('should use category defaultRate when product taxRate is null', () => {
      const result = resolveEffectiveTaxRate(null, CATEGORY_RATE, SETTINGS_RATE);
      expect(result).toBe(CATEGORY_RATE);
    });

    it('should use category defaultRate when product taxRate is undefined', () => {
      const result = resolveEffectiveTaxRate(
        undefined,
        CATEGORY_RATE,
        SETTINGS_RATE,
      );
      expect(result).toBe(CATEGORY_RATE);
    });

    it('should accept Decimal category rate', () => {
      const result = resolveEffectiveTaxRate(
        0,
        new Decimal('10.5'),
        SETTINGS_RATE,
      );
      expect(result).toBe(10.5);
    });
  });

  describe('settings global fallback', () => {
    it('should use settings rate when product is 0 and category is null', () => {
      const result = resolveEffectiveTaxRate(0, null, SETTINGS_RATE);
      expect(result).toBe(SETTINGS_RATE);
    });

    it('should use settings rate when product is 0 and category is 0', () => {
      const result = resolveEffectiveTaxRate(0, 0, SETTINGS_RATE);
      expect(result).toBe(SETTINGS_RATE);
    });

    it('should accept Decimal settings rate', () => {
      const result = resolveEffectiveTaxRate(0, null, new Decimal('19'));
      expect(result).toBe(19);
    });
  });

  describe('edge cases', () => {
    it('should handle all zeros — returns settings rate', () => {
      const result = resolveEffectiveTaxRate(0, 0, 0);
      expect(result).toBe(0);
    });

    it('should handle negative product rate as "not set" — falls to category', () => {
      // Defensive: negative rates should not happen but should not crash
      const result = resolveEffectiveTaxRate(-1, CATEGORY_RATE, SETTINGS_RATE);
      expect(result).toBe(CATEGORY_RATE);
    });
  });
});

describe('hasExplicitTaxOverride', () => {
  it('returns true for non-zero product taxRate', () => {
    expect(hasExplicitTaxOverride(19)).toBe(true);
    expect(hasExplicitTaxOverride(0.01)).toBe(true);
  });

  it('returns false for zero product taxRate', () => {
    expect(hasExplicitTaxOverride(0)).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(hasExplicitTaxOverride(null)).toBe(false);
    expect(hasExplicitTaxOverride(undefined)).toBe(false);
  });

  it('returns true for Decimal non-zero', () => {
    expect(hasExplicitTaxOverride(new Decimal('5'))).toBe(true);
  });

  it('returns false for Decimal zero', () => {
    expect(hasExplicitTaxOverride(new Decimal('0'))).toBe(false);
  });
});
