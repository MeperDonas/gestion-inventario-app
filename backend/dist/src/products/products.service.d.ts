import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ProductsService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    create(createProductDto: CreateProductDto, userId: string): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<{
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
    getLowStockProducts(): Promise<({
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
    searchProducts(query: string, limit?: number): Promise<{
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
    private createInventoryMovement;
    uploadImage(file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadProductImage(productId: string, file: Express.Multer.File): Promise<{
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
