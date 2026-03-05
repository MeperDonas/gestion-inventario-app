"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jspdf_1 = require("jspdf");
const bogota_date_1 = require("../common/utils/bogota-date");
let SalesService = class SalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSaleDto, userId) {
        const { customerId, items, discountAmount = 0, payments } = createSaleDto;
        if (items.length === 0) {
            throw new common_1.BadRequestException('Sale must have at least one item');
        }
        if (!payments || payments.length === 0) {
            throw new common_1.BadRequestException('Sale must have at least one payment method');
        }
        let subtotal = 0;
        let totalTax = 0;
        const saleItems = [];
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${item.productId} not found`);
            }
            if (!product.active) {
                throw new common_1.BadRequestException(`Product ${product.name} is not active`);
            }
            const unitPrice = Number(product.salePrice);
            const grossSubtotal = unitPrice * item.quantity;
            const itemDiscount = Math.max(0, item.discountAmount || 0);
            if (itemDiscount > grossSubtotal) {
                throw new common_1.BadRequestException(`Item discount for product ${product.name} cannot exceed item subtotal`);
            }
            const itemSubtotal = grossSubtotal - itemDiscount;
            const itemTax = itemSubtotal * (Number(product.taxRate) / 100);
            const itemTotal = itemSubtotal + itemTax;
            subtotal += itemSubtotal;
            totalTax += itemTax;
            saleItems.push({
                productId: product.id,
                quantity: item.quantity,
                unitPrice,
                taxRate: Number(product.taxRate),
                discountAmount: itemDiscount,
                subtotal: itemSubtotal,
                total: itemTotal,
            });
        }
        const total = subtotal + totalTax - discountAmount;
        if (total < 0) {
            throw new common_1.BadRequestException('Total cannot be negative');
        }
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid < total) {
            throw new common_1.BadRequestException(`Total paid (${totalPaid}) is less than total (${total})`);
        }
        const cashPaid = payments
            .filter((p) => p.method === 'CASH')
            .reduce((sum, p) => sum + p.amount, 0);
        const change = cashPaid > total ? cashPaid - total : null;
        if (customerId) {
            const customer = await this.prisma.customer.findUnique({
                where: { id: customerId },
            });
            if (!customer) {
                throw new common_1.NotFoundException('Customer not found');
            }
        }
        const sale = await this.prisma.$transaction(async (tx) => {
            const createdSale = await tx.sale.create({
                data: {
                    saleNumber: undefined,
                    customerId,
                    subtotal,
                    taxAmount: totalTax,
                    discountAmount,
                    total,
                    amountPaid: totalPaid,
                    change,
                    status: 'COMPLETED',
                    userId,
                },
            });
            for (const saleItem of saleItems) {
                await tx.saleItem.create({
                    data: {
                        saleId: createdSale.id,
                        productId: saleItem.productId,
                        quantity: saleItem.quantity,
                        unitPrice: saleItem.unitPrice,
                        taxRate: saleItem.taxRate,
                        discountAmount: saleItem.discountAmount,
                        subtotal: saleItem.subtotal,
                        total: saleItem.total,
                    },
                });
                const updatedProduct = await tx.product.updateMany({
                    where: {
                        id: saleItem.productId,
                        active: true,
                        stock: { gte: saleItem.quantity },
                    },
                    data: {
                        stock: { decrement: saleItem.quantity },
                    },
                });
                if (updatedProduct.count === 0) {
                    throw new common_1.ConflictException(`Insufficient stock for product ${saleItem.productId}`);
                }
                const productAfterUpdate = await tx.product.findUnique({
                    where: { id: saleItem.productId },
                    select: { stock: true },
                });
                if (!productAfterUpdate) {
                    throw new common_1.NotFoundException(`Product with ID ${saleItem.productId} not found`);
                }
                const newStock = productAfterUpdate.stock;
                const previousStock = newStock + saleItem.quantity;
                await tx.inventoryMovement.create({
                    data: {
                        productId: saleItem.productId,
                        type: 'SALE',
                        quantity: -saleItem.quantity,
                        previousStock,
                        newStock,
                        reason: `Sale #${createdSale.saleNumber}`,
                        userId,
                        saleId: createdSale.id,
                    },
                });
            }
            for (const payment of payments) {
                await tx.payment.create({
                    data: {
                        saleId: createdSale.id,
                        method: payment.method,
                        amount: payment.amount,
                    },
                });
            }
            return createdSale;
        });
        return this.findOne(sale.id);
    }
    async findAll(page = 1, limit = 10, startDate, endDate, status, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            const createdAtFilter = {};
            const startDateFilter = (0, bogota_date_1.parseBogotaStartOfDay)(startDate);
            if (startDateFilter) {
                createdAtFilter.gte = startDateFilter;
            }
            const endDateFilter = (0, bogota_date_1.parseBogotaEndOfDay)(endDate);
            if (endDateFilter) {
                createdAtFilter.lte = endDateFilter;
            }
            where.createdAt = createdAtFilter;
        }
        const normalizedSearch = search?.trim();
        if (normalizedSearch) {
            const orFilters = [
                {
                    customer: {
                        is: {
                            name: { contains: normalizedSearch, mode: 'insensitive' },
                        },
                    },
                },
            ];
            const saleNumber = Number.parseInt(normalizedSearch, 10);
            if (!Number.isNaN(saleNumber)) {
                orFilters.push({ saleNumber });
            }
            where.OR = orFilters;
        }
        const [sales, total] = await Promise.all([
            this.prisma.sale.findMany({
                where: where,
                skip,
                take: limit,
                include: {
                    customer: true,
                    items: {
                        include: { product: true },
                    },
                    payments: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.sale.count({ where: where }),
        ]);
        return {
            data: sales,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: { product: true },
                },
                payments: true,
            },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        return sale;
    }
    async findBySaleNumber(saleNumber) {
        const sale = await this.prisma.sale.findUnique({
            where: { saleNumber },
            include: {
                customer: true,
                items: {
                    include: { product: true },
                },
                payments: true,
            },
        });
        return sale;
    }
    async update(id, updateSaleDto, userId) {
        const existingSale = await this.prisma.sale.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!existingSale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        if (existingSale.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Only completed sales can be updated');
        }
        if (updateSaleDto.status === 'CANCELLED') {
            await this.prisma.$transaction(async (tx) => {
                for (const item of existingSale.items) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                    });
                    if (product) {
                        const previousStock = product.stock;
                        const newStock = previousStock + item.quantity;
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: newStock },
                        });
                        await tx.inventoryMovement.create({
                            data: {
                                productId: item.productId,
                                type: 'RETURN',
                                quantity: item.quantity,
                                previousStock,
                                newStock,
                                reason: `Sale #${existingSale.saleNumber} cancelled`,
                                userId,
                                saleId: existingSale.id,
                            },
                        });
                    }
                }
                await tx.sale.update({
                    where: { id },
                    data: { status: updateSaleDto.status },
                });
            });
            return this.findOne(id);
        }
        if (updateSaleDto.status === 'RETURNED_PARTIAL') {
            return this.prisma.sale.update({
                where: { id },
                data: { status: updateSaleDto.status },
            });
        }
        return this.findOne(id);
    }
    async generateInvoice(id, response) {
        const sale = await this.findOne(id);
        const settings = await this.prisma.settings.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        const doc = new jspdf_1.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 300],
        });
        const companyName = settings?.companyName || 'Mi Negocio';
        const printHeader = settings?.printHeader || '';
        const printFooter = settings?.printFooter || '';
        const logoUrl = settings?.logoUrl;
        const margin = 4;
        const maxWidth = 80 - margin * 2;
        let y = 5;
        if (logoUrl) {
            try {
                doc.addImage(logoUrl, 'PNG', 40 - 15, y, 30, 15, undefined, 'FAST');
                y += 17;
            }
            catch (error) {
                console.error('Error loading logo:', error);
            }
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const companyNameLines = doc.splitTextToSize(companyName.toUpperCase(), maxWidth);
        companyNameLines.forEach((line) => {
            doc.text(line, 40, y, { align: 'center' });
            y += 5;
        });
        y += 2;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        if (printHeader) {
            const headerLines = doc.splitTextToSize(printHeader, maxWidth);
            headerLines.forEach((line) => {
                doc.text(line, 40, y, { align: 'center' });
                y += 3.5;
            });
        }
        y += 3;
        doc.line(margin, y, 80 - margin, y);
        y += 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const invoiceDate = new Date(sale.createdAt).toLocaleDateString('es-CO');
        const invoiceTime = new Date(sale.createdAt).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
        doc.text(`No. ${sale.saleNumber}    ${invoiceDate} ${invoiceTime}`, margin, y);
        y += 5;
        if (sale.customer) {
            doc.text(`Cliente: ${sale.customer.name}`, margin, y);
            y += 4;
        }
        if (sale.payments && sale.payments.length > 0) {
            if (sale.payments.length === 1) {
                doc.text(`Pago: ${this.getPaymentMethodText(sale.payments[0].method)}`, margin, y);
            }
            else {
                doc.text(`Pago: Mixto (${sale.payments.length} métodos)`, margin, y);
            }
            y += 4;
        }
        doc.line(margin, y, 80 - margin, y);
        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('CANT  ITEM            $UNIT      $TOTAL', margin, y);
        y += 3;
        doc.line(margin, y, 80 - margin, y);
        y += 3;
        doc.setFont('helvetica', 'normal');
        for (const item of sale.items) {
            const productName = item.product?.name || 'Producto eliminado';
            const itemName = productName.length > 14
                ? productName.substring(0, 14) + '..'
                : productName;
            doc.text(`${item.quantity}`, margin + 2, y);
            doc.text(itemName, margin + 9, y);
            doc.text(this.formatCurrencyCompact(Number(item.unitPrice)), margin + 33, y);
            doc.text(this.formatCurrencyCompact(Number(item.total)), 80 - margin - 15, y);
            y += 4;
        }
        y += 2;
        doc.line(margin, y, 80 - margin, y);
        y += 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('SUBTOTAL', margin, y);
        doc.text(this.formatCurrencyCompact(Number(sale.subtotal)), 80 - margin - 15, y);
        y += 4;
        const taxAmount = Number(sale.taxAmount);
        if (taxAmount > 0) {
            doc.text(`IVA (${this.getTaxRate(sale)}%)`, margin, y);
            doc.text(this.formatCurrencyCompact(taxAmount), 80 - margin - 15, y);
            y += 4;
        }
        const discountAmount = Number(sale.discountAmount);
        if (discountAmount > 0) {
            doc.text('DESCUENTO', margin, y);
            doc.text(`-${this.formatCurrencyCompact(discountAmount)}`, 80 - margin - 15, y);
            y += 4;
        }
        doc.line(margin, y, 80 - margin, y);
        y += 4;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL A PAGAR', margin, y);
        doc.text(this.formatCurrencyCompact(Number(sale.total)), 80 - margin - 18, y);
        y += 6;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        if (sale.payments && sale.payments.length > 0) {
            if (sale.payments.length > 1) {
                y += 3;
                doc.line(margin, y, 80 - margin, y);
                y += 3;
                doc.setFont('helvetica', 'bold');
                doc.text('PAGOS:', margin, y);
                y += 4;
                doc.setFont('helvetica', 'normal');
                for (const payment of sale.payments) {
                    const methodText = this.getPaymentMethodText(payment.method);
                    doc.text(`${methodText}:`, margin, y);
                    doc.text(this.formatCurrencyCompact(Number(payment.amount)), 80 - margin - 15, y);
                    y += 4;
                }
            }
            else {
                const cashPayment = sale.payments.find((p) => p.method === 'CASH');
                if (cashPayment) {
                    doc.text('RECIBIDO:', margin, y);
                    doc.text(this.formatCurrencyCompact(Number(cashPayment.amount)), 80 - margin - 15, y);
                    y += 4;
                    if (sale.change !== null && Number(sale.change) > 0) {
                        doc.text('CAMBIO:', margin, y);
                        doc.text(this.formatCurrencyCompact(Number(sale.change)), 80 - margin - 15, y);
                        y += 4;
                    }
                }
            }
        }
        y += 4;
        doc.line(margin, y, 80 - margin, y);
        y += 5;
        doc.setFontSize(7);
        if (printFooter) {
            const footerLines = doc.splitTextToSize(printFooter, maxWidth);
            footerLines.forEach((line) => {
                doc.text(line, 40, y, { align: 'center' });
                y += 3.5;
            });
        }
        y += 3;
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('*** GRACIAS POR SU COMPRA ***', 40, y, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename=factura_${sale.saleNumber}.pdf`);
        response.send(Buffer.from(doc.output('arraybuffer')));
    }
    getTaxRate(sale) {
        if (sale.items && sale.items.length > 0) {
            const firstItem = sale.items[0];
            return Number(firstItem.taxRate) || 0;
        }
        return 0;
    }
    formatCurrencyCompact(amount) {
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(2) + 'M';
        }
        else if (amount >= 1000) {
            return '$' + (amount / 1000).toFixed(0) + 'K';
        }
        else {
            return '$' + amount.toFixed(0);
        }
    }
    getPaymentMethodText(method) {
        const methods = {
            CASH: 'Efectivo',
            CARD: 'Tarjeta',
            TRANSFER: 'Transferencia',
        };
        return methods[method] || method;
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
        }).format(amount);
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map