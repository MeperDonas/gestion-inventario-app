export type ImportFieldKey =
  | 'name'
  | 'sku'
  | 'barcode'
  | 'category'
  | 'salePrice'
  | 'costPrice'
  | 'stock'
  | 'minStock'
  | 'taxRate'
  | 'description';

export type ColumnMapping = Partial<Record<ImportFieldKey, string>>;

export interface ColumnDetectionResult {
  detectedColumns: string[];
  mapping: ColumnMapping;
  missingRequiredFields: Array<'name' | 'salePrice' | 'stock'>;
  usesGenericPriceColumn: boolean;
}

const COLUMN_ALIASES: Record<ImportFieldKey, string[]> = {
  name: [
    'nombre',
    'name',
    'producto',
    'product',
    'descripcion_corta',
    'articulo',
  ],
  sku: ['sku', 'codigo', 'code', 'ref', 'referencia', 'codigo_interno'],
  barcode: [
    'codigo_de_barras',
    'barcode',
    'ean',
    'upc',
    'codigo_barras',
    'codigobarras',
  ],
  category: ['categoria', 'category', 'cat', 'tipo', 'grupo', 'familia'],
  salePrice: [
    'precio_venta',
    'sale_price',
    'pvp',
    'precio_de_venta',
    'precio',
  ],
  costPrice: [
    'precio_costo',
    'cost_price',
    'costo',
    'precio_de_costo',
    'precio_compra',
  ],
  stock: [
    'stock',
    'cantidad',
    'qty',
    'quantity',
    'existencia',
    'inventario',
    'unidades',
  ],
  minStock: [
    'stock_minimo',
    'min_stock',
    'punto_reorden',
    'minimo',
    'stock_min',
  ],
  taxRate: [
    'impuesto',
    'iva',
    'tax',
    'tax_rate',
    'tasa_impuesto',
    'porcentaje_iva',
  ],
  description: [
    'descripcion',
    'description',
    'detalle',
    'notas',
    'observaciones',
    'descripcion_larga',
  ],
};

export function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[%]/g, 'porcentaje')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function detectColumnMapping(headers: string[]): ColumnDetectionResult {
  const detectedColumns = headers.filter((header) => header.trim().length > 0);
  const normalizedHeaders = detectedColumns.map(normalizeHeader);
  const mapping: ColumnMapping = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as Array<
    [ImportFieldKey, string[]]
  >) {
    const matchedIndex = normalizedHeaders.findIndex((header) =>
      aliases.includes(header),
    );

    if (matchedIndex >= 0) {
      mapping[field] = detectedColumns[matchedIndex];
    }
  }

  const missingRequiredFields = (
    ['name', 'salePrice', 'stock'] as Array<'name' | 'salePrice' | 'stock'>
  ).filter((field) => !mapping[field]);

  const salePriceHeader = mapping.salePrice;
  const usesGenericPriceColumn =
    !!salePriceHeader && normalizeHeader(salePriceHeader) === 'precio';

  return {
    detectedColumns,
    mapping,
    missingRequiredFields,
    usesGenericPriceColumn,
  };
}
