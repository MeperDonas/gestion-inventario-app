import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string;
        phone: string | null;
        address: string | null;
        segment: import("@prisma/client").$Enums.CustomerSegment;
    }>;
    findAll(page?: number, limit?: number, search?: string, segment?: string): Promise<{
        data: {
            id: string;
            email: string | null;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            documentType: string;
            documentNumber: string;
            phone: string | null;
            address: string | null;
            segment: import("@prisma/client").$Enums.CustomerSegment;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        sales: ({
            items: ({
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
                taxRate: import("@prisma/client/runtime/library").Decimal;
                productId: string;
                quantity: number;
                saleId: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                total: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            saleNumber: number;
            customerId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            change: import("@prisma/client/runtime/library").Decimal | null;
            status: import("@prisma/client").$Enums.SaleStatus;
        })[];
    } & {
        id: string;
        email: string | null;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string;
        phone: string | null;
        address: string | null;
        segment: import("@prisma/client").$Enums.CustomerSegment;
    }>;
    findByDocumentNumber(documentNumber: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string;
        phone: string | null;
        address: string | null;
        segment: import("@prisma/client").$Enums.CustomerSegment;
    } | null>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string;
        phone: string | null;
        address: string | null;
        segment: import("@prisma/client").$Enums.CustomerSegment;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string;
        phone: string | null;
        address: string | null;
        segment: import("@prisma/client").$Enums.CustomerSegment;
    }>;
}
