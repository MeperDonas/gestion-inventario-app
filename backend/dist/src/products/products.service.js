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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ProductsService = class ProductsService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async create(createProductDto, userId) {
        const { sku, barcode, categoryId, ...rest } = createProductDto;
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku },
            });
            if (existingSku) {
                throw new common_1.ConflictException('SKU already exists');
            }
        }
        if (barcode) {
            const existingBarcode = await this.prisma.product.findUnique({
                where: { barcode },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException('Barcode already exists');
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
        await this.createInventoryMovement(product.id, 'PURCHASE', 0, product.stock, 'Initial stock', userId);
        return product;
    }
    async findAll(page = 1, limit = 10, search, categoryId, status = 'active') {
        const skip = (page - 1) * limit;
        const where = {};
        if (status === 'active') {
            where.active = true;
        }
        if (status === 'inactive') {
            where.active = false;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
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
    async findOne(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, active: true },
            include: { category: true, movements: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async update(id, updateProductDto, userId) {
        const existingProduct = await this.prisma.product.findFirst({
            where: { id, active: true },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: updateProductDto.sku },
            });
            if (existingSku) {
                throw new common_1.ConflictException('SKU already exists');
            }
        }
        if (updateProductDto.barcode &&
            updateProductDto.barcode !== existingProduct.barcode) {
            const existingBarcode = await this.prisma.product.findUnique({
                where: { barcode: updateProductDto.barcode },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException('Barcode already exists');
            }
        }
        const previousStock = existingProduct.stock;
        const newStock = updateProductDto.stock ?? previousStock;
        const updateResult = await this.prisma.product.updateMany({
            where: { id, version: existingProduct.version, active: true },
            data: {
                ...updateProductDto,
                version: { increment: 1 },
            },
        });
        if (updateResult.count === 0) {
            throw new common_1.ConflictException('Product was modified by another user');
        }
        const product = await this.prisma.product.findFirst({
            where: { id, active: true },
            include: { category: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (updateProductDto.stock !== undefined &&
            updateProductDto.stock !== previousStock) {
            const movementType = newStock > previousStock ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
            await this.createInventoryMovement(id, movementType, previousStock, newStock, 'Stock adjustment', userId);
        }
        return product;
    }
    async deactivate(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, active: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return this.prisma.product.update({
            where: { id },
            data: { active: false },
            include: { category: true },
        });
    }
    async remove(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        try {
            return await this.prisma.product.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003') {
                throw new common_1.ConflictException('No se puede eliminar definitivamente un producto con ventas o movimientos de inventario asociados');
            }
            throw error;
        }
    }
    async getLowStockProducts() {
        return this.prisma.$queryRaw `
      SELECT p.*, c.name as "categoryName"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p.active = true AND p.stock <= p."minStock"
      ORDER BY p.stock ASC
    `;
    }
    async searchProducts(query, limit = 20) {
        const products = await this.prisma.product.findMany({
            where: {
                active: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                    { barcode: { contains: query, mode: 'insensitive' } },
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
    async quickSearch(code) {
        const product = await this.prisma.product.findFirst({
            where: {
                active: true,
                OR: [
                    { barcode: { equals: code, mode: 'insensitive' } },
                    { sku: { equals: code, mode: 'insensitive' } },
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
    async createInventoryMovement(productId, type, previousStock, newStock, reason, userId, saleId) {
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
    async uploadImage(file) {
        const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');
        return { imageUrl };
    }
    async uploadProductImage(productId, file) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');
        if (product.imageUrl) {
            try {
                const publicId = this.cloudinaryService.extractPublicId(product.imageUrl);
                await this.cloudinaryService.deleteImage(publicId);
            }
            catch (error) {
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
    async reactivate(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.active) {
            return product;
        }
        return this.prisma.product.update({
            where: { id },
            data: { active: true },
            include: { category: true },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ProductsService);
//# sourceMappingURL=products.service.js.map