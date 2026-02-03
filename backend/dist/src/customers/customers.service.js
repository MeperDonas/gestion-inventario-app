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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCustomerDto) {
        const { documentNumber } = createCustomerDto;
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { documentNumber },
        });
        if (existingCustomer) {
            throw new common_1.ConflictException('Customer with this document number already exists');
        }
        return this.prisma.customer.create({
            data: createCustomerDto,
        });
    }
    async findAll(page = 1, limit = 10, search, segment) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { documentNumber: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (segment) {
            where.segment = segment;
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where: where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.customer.count({ where: where }),
        ]);
        return {
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                sales: { include: { items: { include: { product: true } } } },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return customer;
    }
    async findByDocumentNumber(documentNumber) {
        const customer = await this.prisma.customer.findUnique({
            where: { documentNumber },
        });
        return customer;
    }
    async update(id, updateCustomerDto) {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { id },
        });
        if (!existingCustomer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (updateCustomerDto.documentNumber &&
            updateCustomerDto.documentNumber !== existingCustomer.documentNumber) {
            const existingDocument = await this.prisma.customer.findUnique({
                where: { documentNumber: updateCustomerDto.documentNumber },
            });
            if (existingDocument) {
                throw new common_1.ConflictException('Document number already in use');
            }
        }
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }
    async remove(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { sales: true },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (customer.sales.length > 0) {
            throw new common_1.ConflictException('Cannot delete customer with associated sales');
        }
        return this.prisma.customer.delete({
            where: { id },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map