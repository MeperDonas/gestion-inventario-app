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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        const { name } = createCategoryDto;
        const existingCategory = await this.prisma.category.findUnique({
            where: { name },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Category already exists');
        }
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAll(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = {
            active: true,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        {
                            description: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : {}),
        };
        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.category.count({ where }),
        ]);
        return {
            data: categories,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!category || !category.active) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existingCategory || !existingCategory.active) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (updateCategoryDto.name &&
            updateCategoryDto.name !== existingCategory.name) {
            const existingName = await this.prisma.category.findUnique({
                where: { name: updateCategoryDto.name },
            });
            if (existingName) {
                throw new common_1.ConflictException('Category name already exists');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }
    async remove(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category.products.length > 0) {
            throw new common_1.ConflictException('Cannot delete category with associated products');
        }
        return this.prisma.category.update({
            where: { id },
            data: { active: false },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map