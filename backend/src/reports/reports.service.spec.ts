import { BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  const prismaMock = {
    sale: {
      findMany: jest.fn(),
    },
  };
  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(prismaMock as never, cacheMock as never);
  });

  it('rejects invalid ranges where endDate is before startDate', async () => {
    await expect(
      service.getSalesByPaymentMethod('2026-03-10', '2026-03-05'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns appliedRange metadata with the queried date range', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      {
        payments: [
          { method: 'CASH', amount: 100000 },
          { method: 'CARD', amount: 50000 },
        ],
      },
      {
        payments: [{ method: 'CASH', amount: 20000 }],
      },
    ]);

    const result = await service.getSalesByPaymentMethod(
      '2026-03-01',
      '2026-03-31',
    );

    expect(result.appliedRange).toEqual({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      timezone: 'America/Bogota',
    });
    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paymentMethod: 'CASH', total: 120000 }),
        expect.objectContaining({ paymentMethod: 'CARD', total: 50000 }),
      ]),
    );
  });

  it('[#16] returns empty-safe metrics for zero-data ranges', async () => {
    prismaMock.sale.findMany.mockResolvedValue([]);

    const result = await service.getSalesByPaymentMethod(
      '2026-04-01',
      '2026-04-30',
    );

    expect(result).toEqual({
      data: [],
      appliedRange: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        timezone: 'America/Bogota',
      },
    });
    expect(prismaMock.sale.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'COMPLETED',
          createdAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      }),
    );
  });
});
