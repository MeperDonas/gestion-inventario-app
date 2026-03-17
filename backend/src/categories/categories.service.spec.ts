import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const prismaMock = {
    category: {
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
        active: true,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        _count: { products: 0 },
      },
      {
        id: 'cat-two',
        name: 'Con productos',
        description: null,
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
    expect(result.data[1].productCount).toBe(2);
  });
});
