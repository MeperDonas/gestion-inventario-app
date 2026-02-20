"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
const jspdf_1 = require("jspdf");
const csv = __importStar(require("@fast-csv/format"));
let ExportsService = class ExportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInventoryMovements(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.productId) {
            where.productId = query.productId;
        }
        if (query.startDate || query.endDate) {
            const createdAt = {};
            if (query.startDate) {
                createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                const end = new Date(query.endDate);
                end.setHours(23, 59, 59, 999);
                createdAt.lte = end;
            }
            where.createdAt = createdAt;
        }
        const [data, total] = await Promise.all([
            this.prisma.inventoryMovement.findMany({
                where: where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: true,
                },
            }),
            this.prisma.inventoryMovement.count({ where: where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async exportSales(query, response) {
        const sales = await this.getSalesData(query);
        return this.exportData(sales, 'sales', query.format, response);
    }
    async exportProducts(query, response) {
        const products = await this.getProductsData(query);
        return this.exportData(products, 'products', query.format, response);
    }
    async exportCustomers(query, response) {
        const customers = await this.getCustomersData(query);
        return this.exportData(customers, 'customers', query.format, response);
    }
    async exportInventory(query, response) {
        const movements = await this.getInventoryData(query);
        return this.exportData(movements, 'inventory', query.format, response);
    }
    async getSalesData(query) {
        const where = {};
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate)
                where.createdAt.gte = new Date(query.startDate);
            if (query.endDate) {
                const end = new Date(query.endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        return this.prisma.sale.findMany({
            where,
            take: query.limit || undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { product: true } },
                customer: true,
                payments: true,
            },
        });
    }
    async getProductsData(query) {
        return this.prisma.product.findMany({
            where: { active: true },
            take: query.limit || undefined,
            orderBy: { createdAt: 'desc' },
            include: { category: { select: { name: true } } },
        });
    }
    async getCustomersData(query) {
        return this.prisma.customer.findMany({
            where: { active: true },
            take: query.limit || undefined,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getInventoryData(query) {
        const where = {};
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate)
                where.createdAt.gte = new Date(query.startDate);
            if (query.endDate) {
                const end = new Date(query.endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        return this.prisma.inventoryMovement.findMany({
            where,
            take: query.limit || undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                product: { select: { name: true, sku: true } },
                user: { select: { name: true } },
            },
        });
    }
    async exportData(data, type, format, response) {
        switch (format) {
            case 'excel':
                await this.exportToExcel(data, type, response);
                break;
            case 'csv':
                await this.exportToCSV(data, type, response);
                break;
            case 'pdf':
                await this.exportToPDF(data, type, response);
                break;
        }
    }
    async exportToExcel(data, type, response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(type);
        worksheet.addRow(this.getHeaders(type));
        data.forEach((item) => worksheet.addRow(this.getRowData(type, item)));
        response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.xlsx`);
        await workbook.xlsx.write(response);
        response.end();
    }
    async exportToCSV(data, type, response) {
        const csvData = [
            this.getHeaders(type),
            ...data.map((item) => this.getRowData(type, item)),
        ];
        response.setHeader('Content-Type', 'text/csv; charset=utf-8');
        response.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.csv`);
        response.write('\uFEFF');
        response.flushHeaders();
        csv.write(csvData, { headers: false }).pipe(response);
    }
    async exportToPDF(data, type, response) {
        const doc = new jspdf_1.jsPDF();
        doc.setFontSize(16);
        doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.setFontSize(8);
        let y = 50;
        const margin = 14;
        const headers = this.getHeaders(type);
        const colWidths = this.getColumnWidths(type);
        let x = margin;
        headers.forEach((header, index) => {
            doc.rect(x, y, colWidths[index], 10, 'S');
            doc.text(header, x + 2, y + 6);
            x += colWidths[index];
        });
        y += 10;
        data.forEach((item) => {
            const rowData = this.getRowData(type, item);
            x = margin;
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            rowData.forEach((cell, index) => {
                doc.rect(x, y, colWidths[index], 10, 'S');
                const text = String(cell).substring(0, 20);
                doc.text(text, x + 2, y + 6);
                x += colWidths[index];
            });
            y += 10;
        });
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.pdf`);
        response.send(Buffer.from(doc.output('arraybuffer')));
    }
    getHeaders(type) {
        const headers = {
            sales: [
                'Sale #',
                'Date',
                'Customer',
                'Total',
                'Status',
                'Payment Method',
            ],
            products: [
                'Name',
                'SKU',
                'Category',
                'Price',
                'Cost',
                'Stock',
                'Min Stock',
            ],
            customers: [
                'Name',
                'Document Type',
                'Document #',
                'Email',
                'Phone',
                'Segment',
            ],
            inventory: [
                'Date',
                'Product',
                'Type',
                'Quantity',
                'Previous Stock',
                'New Stock',
                'User',
            ],
        };
        return headers[type] || [];
    }
    getRowData(type, item) {
        const getters = {
            sales: (item) => [
                item.saleNumber,
                new Date(item.createdAt).toLocaleDateString(),
                item.customer?.name || 'N/A',
                Number(item.total).toFixed(2),
                item.status,
                item.payments?.map((p) => p.method).join(', ') ||
                    'N/A',
            ],
            products: (item) => [
                item.name,
                item.sku,
                item.category?.name || 'N/A',
                Number(item.salePrice).toFixed(2),
                Number(item.costPrice).toFixed(2),
                item.stock,
                item.minStock,
            ],
            customers: (item) => [
                item.name,
                item.documentType,
                item.documentNumber,
                item.email || 'N/A',
                item.phone || 'N/A',
                item.segment,
            ],
            inventory: (item) => [
                new Date(item.createdAt).toLocaleDateString(),
                item.product?.name || 'N/A',
                item.type,
                item.quantity,
                item.previousStock,
                item.newStock,
                item.user?.name || 'N/A',
            ],
        };
        return getters[type](item);
    }
    getColumnWidths(type) {
        const widths = {
            sales: [20, 30, 40, 25, 25, 30],
            products: [50, 25, 25, 20, 20, 15, 15],
            customers: [35, 25, 25, 30, 25, 20],
            inventory: [25, 40, 25, 15, 20, 20, 25],
        };
        return widths[type] || [];
    }
};
exports.ExportsService = ExportsService;
exports.ExportsService = ExportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportsService);
//# sourceMappingURL=exports.service.js.map