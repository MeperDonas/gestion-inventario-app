import { ForbiddenException } from '@nestjs/common';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;
  const prismaMock = {
    sale: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const cacheMock = {
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SalesService(prismaMock as never, cacheMock as never);
  });

  it('applies own-sales scope for CASHIER in list queries', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      {
        id: 'sale-1',
        userId: 'cashier-1',
        user: { id: 'cashier-1', name: 'Caja', email: 'caja@example.com' },
        customer: null,
        items: [],
        payments: [],
      },
    ]);
    prismaMock.sale.count.mockResolvedValue(1);

    const result = await service.findAll(
      1,
      10,
      undefined,
      undefined,
      undefined,
      undefined,
      { sub: 'cashier-1', role: 'CASHIER' },
    );

    expect(prismaMock.sale.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'cashier-1' },
        include: expect.objectContaining({
          user: { select: { id: true, name: true, email: true } },
        }),
      }),
    );
    expect(result.data[0].user).toEqual({
      id: 'cashier-1',
      name: 'Caja',
      email: 'caja@example.com',
    });
  });

  it('denies CASHIER access to another seller sale detail', async () => {
    prismaMock.sale.findUnique.mockResolvedValue({
      id: 'sale-foreign',
      userId: 'admin-1',
      user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' },
      customer: null,
      items: [],
      payments: [],
    });

    await expect(
      service.findOne('sale-foreign', { sub: 'cashier-1', role: 'CASHIER' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('[#15] allows CASHIER drill-down for own sale detail', async () => {
    prismaMock.sale.findUnique.mockResolvedValue({
      id: 'sale-own',
      userId: 'cashier-1',
      user: { id: 'cashier-1', name: 'Caja', email: 'caja@example.com' },
      customer: null,
      items: [],
      payments: [],
    });

    await expect(
      service.findOne('sale-own', { sub: 'cashier-1', role: 'CASHIER' }),
    ).resolves.toEqual(
      expect.objectContaining({ id: 'sale-own', userId: 'cashier-1' }),
    );
  });

  it('[#15] allows ADMIN drill-down for any sale detail', async () => {
    prismaMock.sale.findUnique.mockResolvedValue({
      id: 'sale-foreign',
      userId: 'cashier-2',
      user: { id: 'cashier-2', name: 'Otra Caja', email: 'otra@example.com' },
      customer: null,
      items: [],
      payments: [],
    });

    await expect(
      service.findOne('sale-foreign', { sub: 'admin-1', role: 'ADMIN' }),
    ).resolves.toEqual(
      expect.objectContaining({ id: 'sale-foreign', userId: 'cashier-2' }),
    );
  });
});
