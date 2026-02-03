export declare class CreateProductDto {
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    costPrice: number;
    salePrice: number;
    taxRate?: number;
    stock: number;
    minStock: number;
    imageUrl?: string;
    categoryId: string;
}
export declare class UpdateProductDto {
    name?: string;
    sku?: string;
    barcode?: string;
    description?: string;
    costPrice?: number;
    salePrice?: number;
    taxRate?: number;
    stock?: number;
    minStock?: number;
    imageUrl?: string;
    categoryId?: string;
    active?: boolean;
}
