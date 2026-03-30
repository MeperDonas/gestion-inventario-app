import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SettingsService } from '../src/settings/settings.service';
import { CloudinaryService } from '../src/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../src/auth/jwt.strategy';

/**
 * E2E — Tax Precedence via API layer
 *
 * These tests verify the full HTTP request → service → response cycle
 * with Prisma mocked at the provider level. This ensures:
 *  - ValidationPipe processes DTOs correctly
 *  - The controller delegates to the service properly
 *  - The response shape includes effectiveTaxRate
 *  - Tax precedence logic fires end-to-end
 */
describe('Tax Precedence (e2e)', () => {
  let app: INestApplication<App>;

  // ── Mocked dependencies ────────────────────────────────────────────
  const prismaMock = {
    category: { findUnique: jest.fn() },
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    inventoryMovement: { create: jest.fn() },
  };

  const settingsServiceMock = {
    getSettings: jest.fn(),
  };

  const cloudinaryServiceMock = {};

  // ── Stubbed auth guard — injects a fake user ──────────────────────
  const mockAuthGuard = {
    canActivate: (ctx: any) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = { sub: 'user-1', role: 'ADMIN' };
      return true;
    },
  };

  // ── Valid UUIDs for DTO validation ──────────────────────────────────
  const CAT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const CAT_ID_2 = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

  // ── Fixtures ───────────────────────────────────────────────────────
  const categoryWithDefault = (
    defaultTaxRate: number | null,
    id = CAT_ID,
  ) => ({
    id,
    name: 'Electrónica',
    description: null,
    defaultTaxRate,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const buildProduct = (overrides: Record<string, unknown> = {}) => ({
    id: 'prod-1',
    name: overrides.name ?? 'Test Product',
    sku: overrides.sku ?? 'SKU-001',
    barcode: null,
    description: null,
    costPrice: 100,
    salePrice: 150,
    taxRate: overrides.taxRate ?? 0,
    stock: 10,
    minStock: 5,
    imageUrl: null,
    categoryId: overrides.categoryId ?? CAT_ID,
    active: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: overrides.category ?? categoryWithDefault(16),
    ...overrides,
  });

  // ── Setup ──────────────────────────────────────────────────────────
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SettingsService, useValue: settingsServiceMock },
        { provide: CloudinaryService, useValue: cloudinaryServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
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

  // ════════════════════════════════════════════════════════════════════
  // POST /products — creation tax precedence
  // ════════════════════════════════════════════════════════════════════
  describe('POST /products', () => {
    it('inherits category defaultTaxRate when no explicit taxRate', async () => {
      prismaMock.category.findUnique.mockResolvedValue(categoryWithDefault(16));
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue(
        buildProduct({ taxRate: 16, sku: 'SKU-E2E-1' }),
      );
      prismaMock.inventoryMovement.create.mockResolvedValue({});
      settingsServiceMock.getSettings.mockResolvedValue({ taxRate: 19 });

      const res = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Laptop',
          sku: 'SKU-E2E-1',
          costPrice: 1000000,
          salePrice: 1500000,
          stock: 5,
          minStock: 2,
          categoryId: CAT_ID,
        })
        .expect(201);

      expect(res.body.taxRate).toBe(16);
      expect(res.body.effectiveTaxRate).toBe(16);
      // Verify the resolved value was stored, not the settings default
      expect(prismaMock.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ taxRate: 16 }),
        }),
      );
    });

    it('uses explicit taxRate overriding category default', async () => {
      prismaMock.category.findUnique.mockResolvedValue(categoryWithDefault(16));
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue(
        buildProduct({ taxRate: 5, sku: 'SKU-E2E-2' }),
      );
      prismaMock.inventoryMovement.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Special Item',
          sku: 'SKU-E2E-2',
          costPrice: 100,
          salePrice: 200,
          taxRate: 5,
          stock: 10,
          minStock: 3,
          categoryId: CAT_ID,
        })
        .expect(201);

      expect(res.body.taxRate).toBe(5);
      expect(res.body.effectiveTaxRate).toBe(5);
      // Settings should NOT be fetched when taxRate is explicit
      expect(settingsServiceMock.getSettings).not.toHaveBeenCalled();
    });

    it('falls back to settings when category has no defaultTaxRate', async () => {
      prismaMock.category.findUnique.mockResolvedValue(
        categoryWithDefault(null),
      );
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue(
        buildProduct({
          taxRate: 19,
          sku: 'SKU-E2E-3',
          category: categoryWithDefault(null),
        }),
      );
      prismaMock.inventoryMovement.create.mockResolvedValue({});
      settingsServiceMock.getSettings.mockResolvedValue({ taxRate: 19 });

      const res = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Misc Product',
          sku: 'SKU-E2E-3',
          costPrice: 50,
          salePrice: 100,
          stock: 20,
          minStock: 5,
          categoryId: CAT_ID,
        })
        .expect(201);

      expect(res.body.taxRate).toBe(19);
      expect(res.body.effectiveTaxRate).toBe(19);
    });

    it('returns 404 when category does not exist', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Ghost Product',
          sku: 'SKU-GHOST',
          costPrice: 50,
          salePrice: 100,
          stock: 5,
          minStock: 1,
          categoryId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('returns 409 when SKU already exists', async () => {
      prismaMock.category.findUnique.mockResolvedValue(categoryWithDefault(16));
      prismaMock.product.findUnique.mockResolvedValue({ id: 'existing' });

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Duplicate SKU',
          sku: 'DUPLICATE',
          costPrice: 50,
          salePrice: 100,
          stock: 5,
          minStock: 1,
          categoryId: CAT_ID,
        })
        .expect(409);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Incomplete',
          // missing sku, costPrice, salePrice, stock, minStock, categoryId
        })
        .expect(400);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // GET /products — enrichment consistency
  // ════════════════════════════════════════════════════════════════════
  describe('GET /products', () => {
    it('returns effectiveTaxRate matching stored taxRate for all products', async () => {
      prismaMock.product.findMany.mockResolvedValue([
        buildProduct({ id: 'p1', taxRate: 5, sku: 'SKU-A' }),
        buildProduct({ id: 'p2', taxRate: 16, sku: 'SKU-B' }),
        buildProduct({ id: 'p3', taxRate: 19, sku: 'SKU-C' }),
      ]);
      prismaMock.product.count.mockResolvedValue(3);

      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(res.body.data).toHaveLength(3);
      res.body.data.forEach((product: any) => {
        expect(product.effectiveTaxRate).toBe(product.taxRate);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // GET /products/:id — single product enrichment
  // ════════════════════════════════════════════════════════════════════
  describe('GET /products/:id', () => {
    it('returns effectiveTaxRate for a single product', async () => {
      prismaMock.product.findFirst.mockResolvedValue(
        buildProduct({ id: 'prod-1', taxRate: 8, movements: [] }),
      );

      const res = await request(app.getHttpServer())
        .get('/products/prod-1')
        .expect(200);

      expect(res.body.taxRate).toBe(8);
      expect(res.body.effectiveTaxRate).toBe(8);
    });

    it('returns 404 for non-existent product', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/products/non-existent')
        .expect(404);
    });
  });
});
