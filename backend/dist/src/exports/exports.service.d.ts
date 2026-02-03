import { PrismaService } from '../prisma/prisma.service';
import { ExportQueryDto } from './dto/export.dto';
export declare class ExportsService {
    private prisma;
    constructor(prisma: PrismaService);
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
