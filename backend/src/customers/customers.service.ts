import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CustomerSegment } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { documentNumber } = createCustomerDto;

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { documentNumber },
    });

    if (existingCustomer) {
      throw new ConflictException(
        'Customer with this document number already exists',
      );
    }

    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async findAll(page = 1, limit = 10, search?: string, segment?: string) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { documentNumber: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (segment) {
      where.segment = segment as CustomerSegment;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where: where as never }),
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

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: { include: { items: { include: { product: true } } } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByDocumentNumber(documentNumber: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { documentNumber },
    });

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    if (
      updateCustomerDto.documentNumber &&
      updateCustomerDto.documentNumber !== existingCustomer.documentNumber
    ) {
      const existingDocument = await this.prisma.customer.findUnique({
        where: { documentNumber: updateCustomerDto.documentNumber },
      });
      if (existingDocument) {
        throw new ConflictException('Document number already in use');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { sales: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.sales.length > 0) {
      throw new ConflictException(
        'Cannot delete customer with associated sales',
      );
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
