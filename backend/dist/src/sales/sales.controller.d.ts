import type { Response } from 'express';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sales.dto';
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        customer: {
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
        } | null;
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
        payments: {
            id: string;
            createdAt: Date;
            saleId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
        }[];
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
    }>;
    findAll(page?: number, limit?: number, startDate?: string, endDate?: string, status?: string, search?: string): Promise<{
        data: ({
            customer: {
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
            } | null;
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
            payments: {
                id: string;
                createdAt: Date;
                saleId: string;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: import("@prisma/client/runtime/library").Decimal;
            }[];
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySaleNumber(saleNumber: number): Promise<({
        customer: {
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
        } | null;
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
        payments: {
            id: string;
            createdAt: Date;
            saleId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
        }[];
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
    }) | null>;
    findOne(id: string): Promise<{
        customer: {
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
        } | null;
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
        payments: {
            id: string;
            createdAt: Date;
            saleId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
        }[];
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
    }>;
    update(id: string, updateSaleDto: UpdateSaleDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
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
    }>;
    generateInvoice(id: string, res: Response): Promise<void>;
}
