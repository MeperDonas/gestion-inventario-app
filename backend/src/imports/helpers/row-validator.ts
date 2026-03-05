export interface ParsedImportRowData {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  taxRate: number;
  description?: string;
  costInferred: boolean;
}

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

export function normalizeLookupKey(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeCategoryName(value: string): string {
  return normalizeLookupKey(value);
}

export function toTitleCase(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseDecimal(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const cleaned = text.replace(/[^\d,.-]/g, '');
  if (!cleaned) {
    return null;
  }

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let normalized = cleaned;

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandSeparator = decimalSeparator === ',' ? '.' : ',';

    normalized = cleaned
      .replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
  } else if (hasComma) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = cleaned.replace(/,/g, '');
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value: unknown): number | null {
  const decimal = parseDecimal(value);

  if (decimal === null || !Number.isInteger(decimal)) {
    return null;
  }

  return decimal;
}

export function buildGeneratedSku(index: number): string {
  return `IMP-${String(index).padStart(3, '0')}`;
}
