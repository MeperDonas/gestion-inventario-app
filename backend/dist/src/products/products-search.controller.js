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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsSearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let ProductsSearchController = class ProductsSearchController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchProducts(q, limit = 10, categoryId) {
        if (!q || q.trim() === '') {
            return [];
        }
        const searchQuery = q.trim();
        const where = {
            active: true,
            OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { sku: { contains: searchQuery, mode: 'insensitive' } },
                { barcode: { contains: searchQuery, mode: 'insensitive' } },
            ],
        };
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const products = await this.prisma.product.findMany({
            where: where,
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
                { stock: 'desc' },
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
    async quickSearch(code) {
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
};
exports.ProductsSearchController = ProductsSearchController;
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)('ADMIN', 'CASHIER', 'INVENTORY_USER'),
    (0, swagger_1.ApiOperation)({ summary: 'Search products for POS (real-time search)' }),
    (0, swagger_1.ApiQuery)({
        name: 'q',
        required: false,
        description: 'Search query (name, sku, or barcode)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], ProductsSearchController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('quick-search'),
    (0, roles_decorator_1.Roles)('ADMIN', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Quick search by barcode or SKU for POS' }),
    (0, swagger_1.ApiQuery)({ name: 'code', required: true, description: 'Barcode or SKU' }),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsSearchController.prototype, "quickSearch", null);
exports.ProductsSearchController = ProductsSearchController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsSearchController);
//# sourceMappingURL=products-search.controller.js.map