export type ExportFormat = 'pdf' | 'excel' | 'csv';
export declare class ExportQueryDto {
    format: ExportFormat;
    type: 'sales' | 'products' | 'customers' | 'inventory';
    startDate?: string;
    endDate?: string;
    limit?: number;
}
export declare class CsvExportDto {
    delimiter?: string;
    encoding?: string;
    includeHeaders?: boolean;
    bom?: boolean;
}
export declare class InventoryMovementsQueryDto {
    page?: number;
    limit?: number;
    productId?: string;
    startDate?: string;
    endDate?: string;
    format?: 'json';
}
