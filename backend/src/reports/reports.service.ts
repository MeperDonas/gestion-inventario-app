/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/services/cache.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getDashboardKPIs(startDate?: string, endDate?: string) {
    const cacheKey = `dashboard:${startDate || ''}:${endDate || ''}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateObj;
      }
    }

    const [
      totalSales,
      totalRevenue,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      recentSales,
    ] = await Promise.all([
      this.prisma.sale.count({ where: where as never }),
      this.prisma.sale.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.product.count({
        where: { active: true },
      }),
      this.prisma.customer.count({
        where: { active: true },
      }),
      this.prisma.product.count({
        where: {
          active: true,
          stock: { lte: this.prisma.product.fields.minStock },
        },
      }),
      this.prisma.sale.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          saleNumber: true,
          total: true,
          status: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              total: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const result = {
      totalSales,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalProducts,
      totalCustomers,
      lowStockProducts,
      recentSales,
    };

    this.cache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes

    return result;
  }

  async getSalesByPaymentMethod(startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = endDateObj;
      }
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        payments: true,
      },
    });

    const paymentMethodTotals = new Map<
      'CASH' | 'CARD' | 'TRANSFER',
      { total: number; subtotal: number; count: number }
    >();

    for (const sale of sales) {
      for (const payment of sale.payments) {
        const current = paymentMethodTotals.get(payment.method) || {
          total: 0,
          subtotal: 0,
          count: 0,
        };
        current.total += Number(payment.amount);
        current.subtotal += Number(payment.amount);
        current.count += 1;
        paymentMethodTotals.set(payment.method, current);
      }
    }

    return Array.from(paymentMethodTotals.entries()).map(
      ([method, totals]) => ({
        paymentMethod: method,
        total: totals.total,
        subtotal: totals.subtotal,
        count: totals.count,
      }),
    );
  }

  async getSalesByCategory(startDate?: string, endDate?: string) {
    const where: any = {
      sale: {
        status: 'COMPLETED',
      },
    };

    if (startDate || endDate) {
      where.sale.createdAt = {};
      if (startDate) {
        where.sale.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.sale.createdAt.lte = endDateObj;
      }
    }

    const productsByCategory = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: { total: true, quantity: true },
    });

    const productIds = productsByCategory.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const categorySales = new Map();

    products.forEach((product) => {
      const saleData = productsByCategory.find(
        (p) => p.productId === product.id,
      );
      if (saleData) {
        const categoryName = product.category.name;
        const existing = categorySales.get(categoryName) || {
          total: 0,
          quantity: 0,
        };
        categorySales.set(categoryName, {
          total: existing.total + Number(saleData._sum.total),
          quantity: existing.quantity + saleData._sum.quantity,
        });
      }
    });

    return Array.from(categorySales.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      quantity: data.quantity,
    }));
  }

  async getTopSellingProducts(
    startDate?: string,
    endDate?: string,
    limit: number = 10,
  ) {
    const where: any = {
      sale: {
        status: 'COMPLETED',
      },
    };

    if (startDate || endDate) {
      where.sale.createdAt = {};
      if (startDate) {
        where.sale.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.sale.createdAt.lte = endDateObj;
      }
    }

    const products = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const productIds = products.map((p) => p.productId);
    const productDetails = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    return products.map((p) => {
      const product = productDetails.find((pd) => pd.id === p.productId);
      return {
        productId: p.productId,
        productName: product?.name || 'Unknown',
        quantity: p._sum.quantity,
        total: Number(p._sum.total),
        stock: product?.stock || 0,
      };
    });
  }

  async getCustomerStatistics(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateObj;
      }
    }

    const [totalCustomers, customersWithSales, topCustomers] =
      await Promise.all([
        this.prisma.customer.count({ where: { active: true } }),
        this.prisma.sale.groupBy({
          by: ['customerId'],
          where,
          _count: { id: true },
          _sum: { total: true },
        }),
        this.prisma.sale.groupBy({
          by: ['customerId'],
          where,
          _count: { id: true },
          _sum: { total: true },
          orderBy: { _sum: { total: 'desc' } },
          take: 10,
        }),
      ]);

    const customerIds = topCustomers
      .map((c) => c.customerId)
      .filter((id): id is string => id !== null);
    const customerDetails = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
    });

    return {
      totalCustomers,
      activeCustomers: customersWithSales.length,
      topCustomers: topCustomers.map((c) => {
        const customer = customerDetails.find((cd) => cd.id === c.customerId);
        return {
          customerId: c.customerId,
          customerName: customer?.name || 'Guest',
          totalSales: c._count.id,
          totalRevenue: Number(c._sum.total),
        };
      }),
    };
  }

  async getDailySales(startDate: string, endDate: string) {
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(startDate),
          lte: endDateObj,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        total: true,
        subtotal: true,
        taxAmount: true,
      },
    });

    const salesByDay = new Map();

    sales.forEach((sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      const existing = salesByDay.get(date) || {
        total: 0,
        subtotal: 0,
        tax: 0,
        count: 0,
      };
      salesByDay.set(date, {
        total: existing.total + Number(sale.total),
        subtotal: existing.subtotal + Number(sale.subtotal),
        tax: existing.tax + Number(sale.taxAmount),
        count: existing.count + 1,
      });
    });

    return Array.from(salesByDay.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
}
