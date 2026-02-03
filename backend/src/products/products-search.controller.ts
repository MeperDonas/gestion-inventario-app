import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class ProductsSearchController {
  constructor(private prisma: PrismaService) {}

  @Get('search')
  @Roles('ADMIN', 'CASHIER', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Search products for POS (real-time search)' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query (name, sku, or barcode)',
  })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'categoryId', required: false })
  async searchProducts(
    @Query('q') q?: string,
    @Query('limit') limit: number = 10,
    @Query('categoryId') categoryId?: string,
  ) {
    if (!q || q.trim() === '') {
      return [];
    }

    const searchQuery = q.trim();

    const where: Record<string, unknown> = {
      active: true,
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' as const } },
        { sku: { contains: searchQuery, mode: 'insensitive' as const } },
        { barcode: { contains: searchQuery, mode: 'insensitive' as const } },
      ],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await this.prisma.product.findMany({
      where: where as never,
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        salePrice: true,
        stock: true,
        minStock: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { stock: 'desc' }, // Productos con stock disponible primero
        { name: 'asc' },
      ],
    });

    return {
      success: true,
      data: products.map((product) => ({
        ...product,
        isLowStock: product.stock <= product.minStock,
      })),
    };
  }

  @Get('quick-search')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Quick search by barcode or SKU for POS' })
  @ApiQuery({ name: 'code', required: true, description: 'Barcode or SKU' })
  async quickSearch(@Query('code') code: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        active: true,
        OR: [{ barcode: { equals: code } }, { sku: { equals: code } }],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        salePrice: true,
        stock: true,
        minStock: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        data: null,
      };
    }

    return {
      success: true,
      data: {
        ...product,
        isLowStock: product.stock <= product.minStock,
      },
    };
  }
}
