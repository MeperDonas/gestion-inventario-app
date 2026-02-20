import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    const { sku, barcode, categoryId, ...rest } = createProductDto;

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode },
      });
      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        ...rest,
        sku,
        barcode,
        categoryId,
      },
      include: { category: true },
    });

    await this.createInventoryMovement(
      product.id,
      'PURCHASE',
      0,
      product.stock,
      'Initial stock',
      userId,
    );

    return product;
  }

  async findAll(page = 1, limit = 10, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
        { barcode: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, movements: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== existingProduct.barcode
    ) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });
      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    const previousStock = existingProduct.stock;
    const newStock = updateProductDto.stock ?? previousStock;

    const updateResult = await this.prisma.product.updateMany({
      where: { id, version: existingProduct.version },
      data: {
        ...updateProductDto,
        version: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictException('Product was modified by another user');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      updateProductDto.stock !== undefined &&
      updateProductDto.stock !== previousStock
    ) {
      const movementType =
        newStock > previousStock ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
      await this.createInventoryMovement(
        id,
        movementType,
        previousStock,
        newStock,
        'Stock adjustment',
        userId,
      );
    }

    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  async getLowStockProducts() {
    return this.prisma.$queryRaw`
      SELECT p.*, c.name as "categoryName"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p.active = true AND p.stock <= p."minStock"
      ORDER BY p.stock ASC
    `;
  }

  async searchProducts(query: string, limit = 20) {
    const products = await this.prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { sku: { contains: query, mode: 'insensitive' as const } },
          { barcode: { contains: query, mode: 'insensitive' as const } },
        ],
      },
      take: limit,
      include: { category: true },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      salePrice: p.salePrice,
      stock: p.stock,
      taxRate: p.taxRate,
      minStock: p.minStock,
      isLowStock: p.stock <= p.minStock,
      category: p.category,
      imageUrl: p.imageUrl,
    }));
  }

  async quickSearch(code: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        active: true,
        OR: [
          { barcode: { equals: code, mode: 'insensitive' as const } },
          { sku: { equals: code, mode: 'insensitive' as const } },
        ],
      },
      include: { category: true },
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      salePrice: product.salePrice,
      stock: product.stock,
      taxRate: product.taxRate,
      minStock: product.minStock,
      isLowStock: product.stock <= product.minStock,
      category: product.category,
      imageUrl: product.imageUrl,
    };
  }

  private async createInventoryMovement(
    productId: string,
    type:
      | 'PURCHASE'
      | 'SALE'
      | 'ADJUSTMENT_IN'
      | 'ADJUSTMENT_OUT'
      | 'DAMAGE'
      | 'RETURN',
    previousStock: number,
    newStock: number,
    reason: string,
    userId: string,
    saleId?: string,
  ) {
    await this.prisma.inventoryMovement.create({
      data: {
        productId,
        type,
        quantity: newStock - previousStock,
        previousStock,
        newStock,
        reason,
        userId,
        saleId,
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');
    return { imageUrl };
  }

  async uploadProductImage(productId: string, file: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');

    if (product.imageUrl) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(
          product.imageUrl,
        );
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
      include: { category: true },
    });

    return updatedProduct;
  }
}
