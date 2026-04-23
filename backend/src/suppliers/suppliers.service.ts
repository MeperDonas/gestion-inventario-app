import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySuppliersDto } from './dto/query-suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSupplierDto, organizationId: string) {
    const existing = await this.prisma.supplier.findFirst({
      where: { documentNumber: dto.documentNumber, organizationId },
    });
    if (existing) {
      throw new ConflictException(
        'Ya existe un proveedor con ese número de documento',
      );
    }
    return this.prisma.supplier.create({
      data: { ...dto, organizationId },
    });
  }

  async findAll(query: QuerySuppliersDto, organizationId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      organizationId,
    };

    if (query.status === 'active') {
      where.active = true;
    } else if (query.status === 'inactive') {
      where.active = false;
    } else if (query.active !== undefined) {
      where.active = query.active === 'true';
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where: where as never }),
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

  async findOne(id: string, organizationId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId },
    });
    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, organizationId: string) {
    await this.findOne(id, organizationId);

    if (dto.documentNumber) {
      const existing = await this.prisma.supplier.findFirst({
        where: { documentNumber: dto.documentNumber, organizationId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Ya existe un proveedor con ese número de documento',
        );
      }
    }

    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.supplier.update({
      where: { id },
      data: { active: false },
    });
  }

  async reactivate(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.supplier.update({
      where: { id },
      data: { active: true },
    });
  }
}
