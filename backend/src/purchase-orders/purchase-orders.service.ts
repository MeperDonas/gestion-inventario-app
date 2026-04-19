import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderItemDto,
} from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { QueryPurchaseOrdersDto } from './dto/query-purchase-orders.dto';

interface ComputedItem {
  productId: string;
  qtyOrdered: number;
  unitCost: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
}

interface NormalizedReceiveItem {
  itemId: string;
  qtyReceivedNow: number;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  private normalizeOrderNumberQuery(query: string) {
    return query.replace(/^oc[-\s]*/i, '').trim();
  }

  private buildDateToExclusive(dateTo: string) {
    const exclusive = new Date(dateTo);
    exclusive.setUTCDate(exclusive.getUTCDate() + 1);
    return exclusive;
  }

  private normalizeReceiveItems(items: ReceivePurchaseOrderDto['items']) {
    const totalsByItemId = new Map<string, number>();

    for (const item of items) {
      if (totalsByItemId.has(item.itemId)) {
        throw new BadRequestException(
          `El ítem ${item.itemId} está repetido en la recepción`,
        );
      }

      totalsByItemId.set(item.itemId, item.qtyReceivedNow);
    }

    return Array.from(totalsByItemId.entries()).map(
      ([itemId, qtyReceivedNow]): NormalizedReceiveItem => ({
        itemId,
        qtyReceivedNow,
      }),
    );
  }

  private async computeItems(
    items: CreatePurchaseOrderItemDto[],
  ): Promise<{
    computed: ComputedItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
  }> {
    const computed: ComputedItem[] = [];
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${item.productId} no encontrado`,
        );
      }
      if (!product.active) {
        throw new BadRequestException(
          `El producto ${product.name} no está activo`,
        );
      }

      const taxRate = item.taxRate ?? Number(product.taxRate);
      const itemSubtotal = item.qtyOrdered * item.unitCost;
      const itemTax = itemSubtotal * (taxRate / 100);

      subtotal += itemSubtotal;
      taxAmount += itemTax;

      computed.push({
        productId: item.productId,
        qtyOrdered: item.qtyOrdered,
        unitCost: item.unitCost,
        taxRate,
        subtotal: itemSubtotal,
        taxAmount: itemTax,
      });
    }

    return {
      computed,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  }

  async create(dto: CreatePurchaseOrderDto, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    if (!supplier.active) {
      throw new BadRequestException('Proveedor inactivo');
    }

    const { computed, subtotal, taxAmount, total } = await this.computeItems(
      dto.items,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          supplierId: dto.supplierId,
          createdById: userId,
          status: 'DRAFT',
          subtotal,
          taxAmount,
          total,
          notes: dto.notes,
        },
      });

      for (const c of computed) {
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: order.id,
            productId: c.productId,
            qtyOrdered: c.qtyOrdered,
            unitCost: c.unitCost,
            taxRate: c.taxRate,
            subtotal: c.subtotal,
            taxAmount: c.taxAmount,
          },
        });
      }

      return order;
    });

    return this.findOne(created.id);
  }

  async findAll(query: QueryPurchaseOrdersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.status) where.status = query.status;

    if (query.dateFrom || query.dateTo) {
      const createdAt: Record<string, Date> = {};
      if (query.dateFrom) createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        createdAt.lt = this.buildDateToExclusive(query.dateTo);
      }
      where.createdAt = createdAt;
    }

    const q = query.q?.trim();
    if (q) {
      const orFilters: Record<string, unknown>[] = [
        {
          supplier: {
            is: { name: { contains: q, mode: 'insensitive' } },
          },
        },
        { notes: { contains: q, mode: 'insensitive' } },
      ];

      const normalizedOrderQuery = this.normalizeOrderNumberQuery(q);
      if (/^\d+$/.test(normalizedOrderQuery)) {
        const orderNumber = Number.parseInt(normalizedOrderQuery, 10);
        orFilters.push({ orderNumber });
      }

      where.OR = orFilters;
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: where as never,
        skip,
        take: limit,
        include: {
          supplier: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where: where as never }),
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

  async findOne(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Orden de compra no encontrada');
    }
    return order;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    const existing = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Orden de compra no encontrada');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Solo se pueden editar órdenes en borrador',
      );
    }

    const supplierId = dto.supplierId ?? existing.supplierId;

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException('Proveedor no encontrado');
      }
      if (!supplier.active) {
        throw new BadRequestException('Proveedor inactivo');
      }
    }

    if (dto.items) {
      const { computed, subtotal, taxAmount, total } = await this.computeItems(
        dto.items,
      );

      await this.prisma.$transaction(async (tx) => {
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id },
        });
        for (const c of computed) {
          await tx.purchaseOrderItem.create({
            data: {
              purchaseOrderId: id,
              productId: c.productId,
              qtyOrdered: c.qtyOrdered,
              unitCost: c.unitCost,
              taxRate: c.taxRate,
              subtotal: c.subtotal,
              taxAmount: c.taxAmount,
            },
          });
        }
        await tx.purchaseOrder.update({
          where: { id },
          data: {
            supplierId,
            notes: dto.notes,
            subtotal,
            taxAmount,
            total,
          },
        });
      });
    } else {
      await this.prisma.purchaseOrder.update({
        where: { id },
        data: {
          supplierId,
          notes: dto.notes,
        },
      });
    }

    return this.findOne(id);
  }

  async confirm(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true, supplier: true },
    });
    if (!order) {
      throw new NotFoundException('Orden de compra no encontrada');
    }
    if (order.status !== 'DRAFT') {
      throw new BadRequestException(
        'Solo se pueden confirmar órdenes en borrador',
      );
    }
    if (order.items.length === 0) {
      throw new BadRequestException(
        'La orden debe tener al menos un ítem para confirmarse',
      );
    }
    if (!order.supplier.active) {
      throw new BadRequestException('Proveedor inactivo');
    }

    await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'PENDING',
        confirmedAt: new Date(),
      },
    });

    return this.findOne(id);
  }

  async receive(id: string, dto: ReceivePurchaseOrderDto, userId: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Orden de compra no encontrada');
    }
    if (order.status !== 'PENDING' && order.status !== 'PARTIAL_RECEIVED') {
      throw new BadRequestException(
        'Solo se pueden recibir órdenes pendientes o parcialmente recibidas',
      );
    }

    const normalizedItems = this.normalizeReceiveItems(dto.items);
    const itemsById = new Map(order.items.map((i) => [i.id, i]));

    for (const r of normalizedItems) {
      const item = itemsById.get(r.itemId);
      if (!item) {
        throw new NotFoundException(
          `Ítem ${r.itemId} no pertenece a la orden`,
        );
      }
      const pending = item.qtyOrdered - item.qtyReceived;
      if (r.qtyReceivedNow > pending) {
        throw new BadRequestException(
          `Cantidad recibida excede lo pendiente para el ítem ${r.itemId}`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (const r of normalizedItems) {
        const item = await tx.purchaseOrderItem.findUnique({
          where: { id: r.itemId },
        });

        if (!item || item.purchaseOrderId !== id) {
          throw new NotFoundException(
            `Ítem ${r.itemId} no pertenece a la orden`,
          );
        }

        const pending = item.qtyOrdered - item.qtyReceived;
        if (r.qtyReceivedNow > pending) {
          throw new BadRequestException(
            `Cantidad recibida excede lo pendiente para el ítem ${r.itemId}`,
          );
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Producto ${item.productId} no encontrado`,
          );
        }

        const previousStock = product.stock;
        const newStock = previousStock + r.qtyReceivedNow;
        const currentVersion = product.version;
        const newUnitCost = Number(item.unitCost);
        const oldCost = Number(product.costPrice);
        const costChanged = newUnitCost !== oldCost;

        const updateData: Record<string, unknown> = {
          stock: { increment: r.qtyReceivedNow },
          version: { increment: 1 },
        };
        if (costChanged) {
          updateData.costPrice = newUnitCost;
        }

        const updated = await tx.product.updateMany({
          where: { id: item.productId, version: currentVersion },
          data: updateData,
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Modificación concurrente detectada sobre el producto',
          );
        }

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'PURCHASE',
            quantity: r.qtyReceivedNow,
            previousStock,
            newStock,
            reason: `OC-${order.orderNumber}`,
            userId,
          },
        });

        if (costChanged) {
          await tx.auditLog.create({
            data: {
              userId,
              action: 'PRODUCT_COST_UPDATED_FROM_PO',
              resource: 'Product',
              resourceId: item.productId,
              metadata: {
                oldCost,
                newCost: newUnitCost,
                orderNumber: order.orderNumber,
                purchaseOrderId: order.id,
              },
            },
          });
        }

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { qtyReceived: { increment: r.qtyReceivedNow } },
        });
      }

      const refreshed = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: id },
      });
      const allReceived = refreshed.every(
        (i) => i.qtyReceived >= i.qtyOrdered,
      );

      await tx.purchaseOrder.update({
        where: { id },
        data: allReceived
          ? { status: 'RECEIVED', receivedAt: new Date() }
          : { status: 'PARTIAL_RECEIVED' },
      });
    });

    return this.findOne(id);
  }

  async cancel(id: string, dto: CancelPurchaseOrderDto) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Orden de compra no encontrada');
    }
    if (order.status !== 'DRAFT' && order.status !== 'PENDING') {
      throw new BadRequestException(
        'Solo se pueden cancelar órdenes en borrador o pendientes',
      );
    }

    await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: dto.reason,
      },
    });

    return this.findOne(id);
  }
}
