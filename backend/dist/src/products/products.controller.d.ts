import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
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
    }>;
    findAll(page?: number, limit?: number, search?: string, categoryId?: string): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLowStock(): Promise<({
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
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
    })[]>;
    search(query: string, limit?: number): Promise<{
        id: string;
        name: string;
        sku: string;
        barcode: string | null;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        minStock: number;
        isLowStock: boolean;
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        imageUrl: string | null;
    }[]>;
    quickSearch(code: string): Promise<{
        id: string;
        name: string;
        sku: string;
        barcode: string | null;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        minStock: number;
        isLowStock: boolean;
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        imageUrl: string | null;
    } | null>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        movements: {
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
        }[];
    } & {
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
    }>;
    update(id: string, updateProductDto: UpdateProductDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    uploadImage(file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadProductImage(id: string, file: Express.Multer.File): Promise<{
        category: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
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
    }>;
}
