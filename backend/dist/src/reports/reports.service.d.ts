import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/services/cache.service';
export declare class ReportsService {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: CacheService);
    getDashboardKPIs(startDate?: string, endDate?: string): Promise<{}>;
    getSalesByPaymentMethod(startDate?: string, endDate?: string): Promise<{
        paymentMethod: "CASH" | "CARD" | "TRANSFER";
        total: number;
        subtotal: number;
        count: number;
    }[]>;
    getSalesByCategory(startDate?: string, endDate?: string): Promise<{
        category: any;
        total: any;
        quantity: any;
    }[]>;
    getTopSellingProducts(startDate?: string, endDate?: string, limit?: number): Promise<{
        productId: string;
        productName: string;
        quantity: number | null;
        total: number;
        stock: number;
    }[]>;
    getCustomerStatistics(startDate?: string, endDate?: string): Promise<{
        totalCustomers: number;
        activeCustomers: number;
        topCustomers: {
            customerId: string | null;
            customerName: string;
            totalSales: number;
            totalRevenue: number;
        }[];
    }>;
    getDailySales(startDate: string, endDate: string): Promise<any[]>;
}
