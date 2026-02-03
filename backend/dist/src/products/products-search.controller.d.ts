import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsSearchController {
    private prisma;
    constructor(prisma: PrismaService);
    searchProducts(q?: string, limit?: number, categoryId?: string): Promise<never[] | {
        success: boolean;
        data: {
            isLowStock: boolean;
            id: string;
            name: string;
            sku: string;
            barcode: string | null;
            salePrice: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            minStock: number;
            imageUrl: string | null;
            category: {
                id: string;
                name: string;
            };
        }[];
    }>;
    quickSearch(code: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        data: {
            isLowStock: boolean;
            id: string;
            name: string;
            sku: string;
            barcode: string | null;
            salePrice: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            minStock: number;
            imageUrl: string | null;
            category: {
                id: string;
                name: string;
            };
        };
        message?: undefined;
    }>;
}
