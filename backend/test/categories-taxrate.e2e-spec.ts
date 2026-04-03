import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Decimal } from '@prisma/client/runtime/library';
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt.strategy';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('Categories TaxRate contract (e2e)', () => {
  let app: INestApplication<App>;

  const prismaMock = {
    category: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockGuard = { canActivate: () => true };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serializes defaultTaxRate as number | null on list endpoint', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      {
        id: 'cat-1',
        name: 'Electrica',
        description: null,
        defaultTaxRate: new Decimal('19.50'),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 3 },
      },
      {
        id: 'cat-2',
        name: 'Libros',
        description: null,
        defaultTaxRate: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      },
    ]);
    prismaMock.category.count.mockResolvedValue(2);

    const res = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(res.body.data[0].defaultTaxRate).toBe(19.5);
    expect(res.body.data[1].defaultTaxRate).toBeNull();
  });

  it('serializes defaultTaxRate as number on get endpoint', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'cat-3',
      name: 'Hogar',
      description: null,
      defaultTaxRate: new Decimal('7.25'),
      active: true,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app.getHttpServer())
      .get('/categories/cat-3')
      .expect(200);

    expect(res.body.defaultTaxRate).toBe(7.25);
  });

  it('serializes defaultTaxRate as number on create endpoint', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);
    prismaMock.category.create.mockResolvedValue({
      id: 'cat-4',
      name: 'Aseo',
      description: null,
      defaultTaxRate: new Decimal('16.00'),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Aseo', defaultTaxRate: 16 })
      .expect(201);

    expect(res.body.defaultTaxRate).toBe(16);
  });

  it('accepts update with defaultTaxRate null and clears value', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'cat-5',
      name: 'Tecnologia',
      active: true,
    });
    prismaMock.category.update.mockResolvedValue({
      id: 'cat-5',
      name: 'Tecnologia',
      description: null,
      defaultTaxRate: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app.getHttpServer())
      .put('/categories/cat-5')
      .send({ defaultTaxRate: null })
      .expect(200);

    expect(prismaMock.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cat-5' },
        data: { defaultTaxRate: null },
      }),
    );
    expect(res.body.defaultTaxRate).toBeNull();
  });
});
