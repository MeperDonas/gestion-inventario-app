import { ExportsService } from './exports.service';
import { ExportQueryDto, InventoryMovementsQueryDto } from './dto/export.dto';
export declare class ExportsController {
    private exportsService;
    constructor(exportsService: ExportsService);
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
    exportSales(query: ExportQueryDto, res: Response): Promise<void>;
    exportProducts(query: ExportQueryDto, res: Response): Promise<void>;
    exportCustomers(query: ExportQueryDto, res: Response): Promise<void>;
    exportInventory(query: ExportQueryDto, res: Response): Promise<void>;
}
