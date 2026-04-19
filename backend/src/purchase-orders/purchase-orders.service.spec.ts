import { BadRequestException } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;

  const txMock = {
    product: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    purchaseOrderItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    purchaseOrder: {
      update: jest.fn(),
    },
  };

  const prismaMock = {
    $transaction: jest.fn(),
    purchaseOrder: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  const buildOrder = (overrides: Record<string, unknown> = {}) => ({
    id: 'po-1',
    orderNumber: 12,
    supplierId: 'supplier-1',
    createdById: 'user-1',
    status: 'PENDING',
    subtotal: 500,
    taxAmount: 95,
    total: 595,
    notes: null,
    confirmedAt: new Date('2026-04-19T10:00:00.000Z'),
    receivedAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: new Date('2026-04-19T09:00:00.000Z'),
    updatedAt: new Date('2026-04-19T09:00:00.000Z'),
    items: [
      {
        id: 'poi-1',
        purchaseOrderId: 'po-1',
        productId: 'prod-1',
        qtyOrdered: 5,
        qtyReceived: 0,
        unitCost: 100,
        taxRate: 19,
        subtotal: 500,
        taxAmount: 95,
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof txMock) => unknown) => callback(txMock),
    );
    service = new PurchaseOrdersService(prismaMock as never);
  });

  it('rejects duplicated receive entries for the same item before touching stock', async () => {
    prismaMock.purchaseOrder.findUnique.mockResolvedValue(buildOrder());

    await expect(
      service.receive(
        'po-1',
        {
          items: [
            { itemId: 'poi-1', qtyReceivedNow: 2 },
            { itemId: 'poi-1', qtyReceivedNow: 1 },
          ],
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(txMock.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('revalidates pending quantity inside the transaction before updating stock', async () => {
    prismaMock.purchaseOrder.findUnique.mockResolvedValue(buildOrder());
    txMock.purchaseOrderItem.findUnique.mockResolvedValue({
      id: 'poi-1',
      purchaseOrderId: 'po-1',
      productId: 'prod-1',
      qtyOrdered: 5,
      qtyReceived: 4,
      unitCost: 100,
      taxRate: 19,
      subtotal: 500,
      taxAmount: 95,
    });

    await expect(
      service.receive(
        'po-1',
        { items: [{ itemId: 'poi-1', qtyReceivedNow: 2 }] },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(txMock.product.findUnique).not.toHaveBeenCalled();
    expect(txMock.inventoryMovement.create).not.toHaveBeenCalled();
    expect(txMock.purchaseOrderItem.update).not.toHaveBeenCalled();
  });

  it('treats dateTo as inclusive for the whole selected day', async () => {
    prismaMock.purchaseOrder.findMany.mockResolvedValue([]);
    prismaMock.purchaseOrder.count.mockResolvedValue(0);

    await service.findAll({ dateTo: '2026-04-19' });

    expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({
            lt: expect.any(Date),
          }),
        }),
      }),
    );

    const where = prismaMock.purchaseOrder.findMany.mock.calls[0][0].where as {
      createdAt: { lt: Date };
    };

    expect(where.createdAt.lt.toISOString()).toBe('2026-04-20T00:00:00.000Z');
  });

  it('accepts order-number searches with the OC- prefix', async () => {
    prismaMock.purchaseOrder.findMany.mockResolvedValue([]);
    prismaMock.purchaseOrder.count.mockResolvedValue(0);

    await service.findAll({ q: 'OC-12' });

    const where = prismaMock.purchaseOrder.findMany.mock.calls[0][0].where as {
      OR: Array<Record<string, unknown>>;
    };

    expect(where.OR).toEqual(
      expect.arrayContaining([expect.objectContaining({ orderNumber: 12 })]),
    );
  });

  it('keeps PARTIAL_RECEIVED orders non-cancellable', async () => {
    prismaMock.purchaseOrder.findUnique.mockResolvedValue(
      buildOrder({ status: 'PARTIAL_RECEIVED' }),
    );

    await expect(
      service.cancel('po-1', { reason: 'Saldo pendiente' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.purchaseOrder.update).not.toHaveBeenCalled();
  });
});
