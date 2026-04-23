import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { SequenceService } from '../src/common/sequences/sequence.service';

const prisma = new PrismaClient();
const sequenceService = new SequenceService();

const isDev = process.env.NODE_ENV !== 'production';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSku(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

function generateBarcode(): string {
  // 13 dígitos aleatorios
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
}

function d(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

async function ensureSuperAdmin(): Promise<void> {
  const email = 'admin@sistema.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('  ℹ️  SuperAdmin ya existe, saltando...');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Super Administrador',
      isSuperAdmin: true,
      tokenVersion: 0,
    },
  });

  console.log('  ✅ SuperAdmin creado: admin@sistema.com / admin123');
}

// ─── Demo Data Builders ─────────────────────────────────────────────────────

async function createDemoOrg(
  name: string,
  slug: string,
  plan: 'BASIC' | 'PRO',
): Promise<{ orgId: string; adminUserId: string }> {
  // 1. Crear organización
  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      plan,
      status: 'ACTIVE',
      settings: {
        companyName: name,
        currency: 'COP',
        taxRate: 19,
        receiptPrefix: 'REC-',
        printHeader: name,
        printFooter: 'Gracias por su compra',
      },
    },
  });

  // 2. Crear usuario admin de la org
  const adminEmail = `admin@${slug}.com`;
  const adminPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      password: adminPassword,
      name: faker.person.fullName(),
      isSuperAdmin: false,
      tokenVersion: 0,
    },
  });

  // 3. OrganizationUser (OWNER / ADMIN)
  await prisma.organizationUser.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      role: 'ADMIN',
      isPrimaryOwner: true,
    },
  });

  // 4. OrganizationSequence
  await prisma.organizationSequence.create({
    data: {
      organizationId: org.id,
      saleNumber: 0,
      orderNumber: 0,
    },
  });

  console.log(`  ✅ Org "${name}" creada (${plan})`);

  return { orgId: org.id, adminUserId: adminUser.id };
}

async function createDemoUsers(orgId: string, count: number): Promise<string[]> {
  const userIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const password = await bcrypt.hash('cajero123', 10);
    const user = await prisma.user.create({
      data: {
        email: `cajero${i + 1}@${faker.internet.domainName()}`.toLowerCase(),
        password,
        name: faker.person.fullName(),
        isSuperAdmin: false,
        tokenVersion: 0,
      },
    });

    await prisma.organizationUser.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role: 'CASHIER',
        isPrimaryOwner: false,
      },
    });

    userIds.push(user.id);
  }

  console.log(`  👤 ${count} cajeros creados`);
  return userIds;
}

async function createDemoCategories(orgId: string, count: number): Promise<string[]> {
  const categories = [
    'Bebidas',
    'Alimentos',
    'Limpieza',
    'Electrónica',
    'Ropa',
    'Hogar',
    'Papelería',
    'Cuidado Personal',
    'Mascotas',
    'Farmacia',
  ];

  const categoryIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const name = categories[i] || faker.commerce.department();
    const cat = await prisma.category.create({
      data: {
        name,
        description: faker.commerce.productDescription().slice(0, 100),
        defaultTaxRate: d(19),
        active: true,
        organizationId: orgId,
      },
    });
    categoryIds.push(cat.id);
  }

  console.log(`  📁 ${count} categorías creadas`);
  return categoryIds;
}

async function createDemoProducts(
  orgId: string,
  categoryIds: string[],
  count: number,
): Promise<{ id: string; salePrice: Prisma.Decimal }[]> {
  const prefixes = ['BEB', 'ALI', 'LIM', 'ELEC', 'ROP', 'HOG', 'PAPEL', 'CUID', 'MASC', 'FARM'];
  const products: { id: string; salePrice: Prisma.Decimal }[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i % prefixes.length];
    const sku = generateSku(prefix, i + 1);
    const barcode = Math.random() > 0.2 ? generateBarcode() : null;
    const costPrice = faker.number.int({ min: 1000, max: 500000 });
    const margin = faker.number.int({ min: 10, max: 50 });
    const salePrice = Math.round(costPrice * (1 + margin / 100));
    const stock = faker.number.int({ min: 5, max: 200 });
    const minStock = Math.max(1, Math.floor(stock * 0.2));

    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        sku,
        barcode,
        description: faker.commerce.productDescription().slice(0, 200),
        costPrice: d(costPrice),
        salePrice: d(salePrice),
        taxRate: d(19),
        stock,
        minStock,
        active: true,
        categoryId: categoryIds[i % categoryIds.length],
        organizationId: orgId,
      },
    });

    products.push({ id: product.id, salePrice: d(salePrice) });
  }

  console.log(`  📦 ${count} productos creados`);
  return products;
}

async function createDemoCustomers(orgId: string, count: number): Promise<string[]> {
  const customerIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const docNumber = faker.number.int({ min: 10000000, max: 99999999 }).toString();
    const customer = await prisma.customer.create({
      data: {
        name: faker.person.fullName(),
        documentType: 'CC',
        documentNumber: docNumber,
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        segment: faker.helpers.arrayElement(['VIP', 'FREQUENT', 'OCCASIONAL', 'INACTIVE']),
        active: true,
        organizationId: orgId,
      },
    });

    customerIds.push(customer.id);
  }

  console.log(`  👥 ${count} clientes creados`);
  return customerIds;
}

async function createDemoSales(
  orgId: string,
  userIds: string[],
  customerIds: string[],
  products: { id: string; salePrice: Prisma.Decimal }[],
  count: number,
): Promise<void> {
  for (let i = 0; i < count; i++) {
    const numItems = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = faker.helpers.arrayElements(products, numItems);

    let subtotal = d(0);
    const saleItemsData: {
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      taxRate: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      total: Prisma.Decimal;
    }[] = [];

    for (const product of selectedProducts) {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = product.salePrice;
      const itemSubtotal = unitPrice.mul(quantity);
      const taxRate = d(19);
      const itemTotal = itemSubtotal.mul(d(1).add(taxRate.div(d(100))));

      saleItemsData.push({
        productId: product.id,
        quantity,
        unitPrice,
        taxRate,
        subtotal: itemSubtotal,
        total: itemTotal,
      });

      subtotal = subtotal.add(itemSubtotal);
    }

    const taxAmount = subtotal.mul(d(19)).div(d(100));
    const total = subtotal.add(taxAmount);
    const amountPaid = total;

    // Obtener siguiente número de venta usando SequenceService
    const saleNumber = await sequenceService.nextSaleNumber(prisma, orgId);

    await prisma.sale.create({
      data: {
        saleNumber,
        customerId: faker.helpers.maybe(() => faker.helpers.arrayElement(customerIds), { probability: 0.7 }) ?? null,
        subtotal,
        taxAmount,
        discountAmount: d(0),
        total,
        amountPaid,
        change: d(0),
        status: 'COMPLETED',
        userId: faker.helpers.arrayElement(userIds),
        organizationId: orgId,
        items: {
          create: saleItemsData.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discountAmount: d(0),
            subtotal: item.subtotal,
            total: item.total,
          })),
        },
        payments: {
          create: [
            {
              method: faker.helpers.arrayElement(['CASH', 'CARD', 'TRANSFER']),
              amount: amountPaid,
            },
          ],
        },
      },
    });
  }

  console.log(`  🧾 ${count} ventas creadas`);
}

async function seedDemoOrganization(
  name: string,
  slug: string,
  plan: 'BASIC' | 'PRO',
): Promise<void> {
  console.log(`\n🏢 Sembrando organización: ${name}`);

  const { orgId, adminUserId } = await createDemoOrg(name, slug, plan);

  // Usuarios adicionales (cajeros)
  const cashierCount = plan === 'PRO' ? 5 : 3;
  const cashierIds = await createDemoUsers(orgId, cashierCount);
  const allUserIds = [adminUserId, ...cashierIds];

  // Categorías
  const categoryCount = plan === 'PRO' ? 10 : 5;
  const categoryIds = await createDemoCategories(orgId, categoryCount);

  // Productos
  const productCount = plan === 'PRO' ? 30 : 20;
  const products = await createDemoProducts(orgId, categoryIds, productCount);

  // Clientes
  const customerCount = plan === 'PRO' ? 10 : 5;
  const customerIds = await createDemoCustomers(orgId, customerCount);

  // Ventas
  const saleCount = plan === 'PRO' ? 15 : 10;
  await createDemoSales(orgId, allUserIds, customerIds, products, saleCount);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting multi-tenant database seed...\n');

  // 1. Siempre crear SuperAdmin
  console.log('👤 Creando SuperAdmin...');
  await ensureSuperAdmin();

  // 2. Solo en DEV: crear organizaciones demo
  if (isDev) {
    console.log('\n🛠️  Modo DEV detectado — creando datos de demo...');

    await seedDemoOrganization('Cafetería Demo', 'cafeteria-demo', 'BASIC');
    await seedDemoOrganization('Supermercado Demo', 'supermercado-demo', 'PRO');
  } else {
    console.log('\n🏭 Modo PRODUCTION — solo se creó SuperAdmin');
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('');
  console.log('📊 Resumen:');
  console.log('  - SuperAdmin: admin@sistema.com / admin123');

  if (isDev) {
    console.log('  - 2 organizaciones demo creadas');
    console.log('  - Usuarios, categorías, productos, clientes y ventas de demo generados');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
