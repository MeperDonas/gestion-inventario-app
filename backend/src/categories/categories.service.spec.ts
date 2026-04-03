import { CategoriesService } from './categories.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const prismaMock = {
    category: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(prismaMock as never);
  });

  it('returns category productCount including zero', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      {
        id: 'cat-zero',
        name: 'Sin productos',
        description: null,
        defaultTaxRate: new Decimal('19.50'),
        active: true,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        _count: { products: 0 },
      },
      {
        id: 'cat-two',
        name: 'Con productos',
        description: null,
        defaultTaxRate: null,
        active: true,
        createdAt: new Date('2026-03-02T00:00:00.000Z'),
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
        _count: { products: 2 },
      },
    ]);
    prismaMock.category.count.mockResolvedValue(2);

    const result = await service.findAll(1, 10);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].productCount).toBe(0);
    expect(result.data[0].defaultTaxRate).toBe(19.5);
    expect(result.data[1].productCount).toBe(2);
    expect(result.data[1].defaultTaxRate).toBeNull();
  });

  it('clears defaultTaxRate when update receives null', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Electrnica',
      active: true,
    });
    prismaMock.category.update.mockResolvedValue({
      id: 'cat-1',
      name: 'Electrnica',
      description: null,
      defaultTaxRate: null,
      active: true,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    });

    const result = await service.update('cat-1', { defaultTaxRate: null });

    expect(prismaMock.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cat-1' },
        data: { defaultTaxRate: null },
      }),
    );
    expect(result.defaultTaxRate).toBeNull();
  });

  it('serializes defaultTaxRate as number on create', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);
    prismaMock.category.create.mockResolvedValue({
      id: 'cat-2',
      name: 'Accesorios',
      description: null,
      defaultTaxRate: new Decimal('16.25'),
      active: true,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    });

    const result = await service.create({
      name: 'Accesorios',
      defaultTaxRate: 16.25,
    });

    expect(result.defaultTaxRate).toBe(16.25);
  });

  it('serializes defaultTaxRate as number on findOne', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'cat-3',
      name: 'Ferretera',
      description: null,
      defaultTaxRate: new Decimal('7.75'),
      active: true,
      products: [],
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    });

    const result = await service.findOne('cat-3');

    expect(result.defaultTaxRate).toBe(7.75);
  });
});
