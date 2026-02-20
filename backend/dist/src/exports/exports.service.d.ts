import { PrismaService } from '../prisma/prisma.service';
import { ExportQueryDto, InventoryMovementsQueryDto } from './dto/export.dto';
export declare class ExportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getInventoryMovements(query: InventoryMovementsQueryDto): Promise<{
        data: ({
            product: {
                id: string;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sku: string;
                barcode: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                salePrice: import("@prisma/client/runtime/library").Decimal;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                minStock: number;
                imageUrl: string | null;
                categoryId: string;
                version: number;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            type: import("@prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            reason: string;
            userId: string;
            saleId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    exportSales(query: ExportQueryDto, response: any): Promise<void>;
    exportProducts(query: ExportQueryDto, response: any): Promise<void>;
    exportCustomers(query: ExportQueryDto, response: any): Promise<void>;
    exportInventory(query: ExportQueryDto, response: any): Promise<void>;
    private getSalesData;
    private getProductsData;
    private getCustomersData;
    private getInventoryData;
    private exportData;
    private exportToExcel;
    private exportToCSV;
    private exportToPDF;
    private getHeaders;
    private getRowData;
    private getColumnWidths;
}
