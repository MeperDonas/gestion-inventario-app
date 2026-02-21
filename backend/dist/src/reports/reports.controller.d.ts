import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(startDate?: string, endDate?: string): Promise<{}>;
    getSalesByPaymentMethod(startDate?: string, endDate?: string): Promise<{
        paymentMethod: "CASH" | "CARD" | "TRANSFER";
        total: number;
        subtotal: number;
        count: number;
    }[]>;
    getSalesByCategory(startDate?: string, endDate?: string): Promise<{
        category: string;
        total: number;
        quantity: number;
    }[]>;
    getTopSellingProducts(startDate?: string, endDate?: string, limit?: string): Promise<{
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
    getDailySales(startDate: string, endDate: string): Promise<{
        total: number;
        subtotal: number;
        tax: number;
        count: number;
        date: string;
    }[]>;
}
