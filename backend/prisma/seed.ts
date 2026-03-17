import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedCashierPassword = await bcrypt.hash('cashier123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@inventory.com',
      password: hashedAdminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  await prisma.settings.create({
    data: {
      companyName: 'Mi Negocio',
      currency: 'COP',
      taxRate: 19,
      receiptPrefix: 'REC-',
      printHeader: 'Comprobante de Pago',
      printFooter: 'Gracias por su compra',
      userId: admin.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'cajero@inventory.com',
      password: hashedCashierPassword,
      name: 'Cajero Principal',
      role: 'CASHIER',
    },
  });

  await prisma.user.create({
    data: {
      email: 'inventory@inventory.com',
      password: hashedCashierPassword,
      name: 'Usuario Inventario',
      role: 'INVENTORY_USER',
    },
  });

  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electrónicos',
      description: 'Productos digitales y accesorios',
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Ropa y Accesorios',
      description: 'Vestuario y complementos',
    },
  });

  const beveragesCategory = await prisma.category.create({
    data: {
      name: 'Bebidas',
      description: 'Refrescos, jugos y bebidas alcohólicas',
    },
  });

  const foodCategory = await prisma.category.create({
    data: {
      name: 'Alimentos',
      description: 'Comestibles y snacks',
    },
  });

  const cleaningCategory = await prisma.category.create({
    data: {
      name: 'Hogar y Limpieza',
      description: 'Artículos de aseo y mantenimiento',
    },
  });

  await prisma.product.createMany({
    data: [
      { name: 'Laptop Dell XPS 15', sku: 'LAP-001', barcode: '7894561230128', costPrice: 1500000, salePrice: 1800000, taxRate: 19, stock: 10, minStock: 3, categoryId: electronicsCategory.id },
      { name: 'Samsung Galaxy S24', sku: 'CEL-001', barcode: '7894561230129', costPrice: 2800000, salePrice: 3200000, taxRate: 19, stock: 15, minStock: 5, categoryId: electronicsCategory.id },
      { name: 'Monitor LG 27"', sku: 'MON-001', barcode: '7894561230130', costPrice: 450000, salePrice: 550000, taxRate: 19, stock: 8, minStock: 2, categoryId: electronicsCategory.id },
      { name: 'Teclado mecánico RGB', sku: 'TEC-001', barcode: '7894561230131', costPrice: 120000, salePrice: 180000, taxRate: 19, stock: 20, minStock: 5, categoryId: electronicsCategory.id },
      { name: 'Mouse inalámbrico Logitech', sku: 'MOU-001', barcode: '7894561230132', costPrice: 50000, salePrice: 75000, taxRate: 19, stock: 25, minStock: 10, categoryId: electronicsCategory.id },
      { name: 'Auriculares Bluetooth', sku: 'AUD-001', barcode: '7894561230133', costPrice: 80000, salePrice: 120000, taxRate: 19, stock: 30, minStock: 10, categoryId: electronicsCategory.id },
      { name: 'Cámara de seguridad TP-Link', sku: 'CAM-001', barcode: '7894561230134', costPrice: 180000, salePrice: 220000, taxRate: 19, stock: 12, minStock: 3, categoryId: electronicsCategory.id },
      { name: 'Cargador USB-C 65W', sku: 'CAR-001', barcode: '7894561230135', costPrice: 45000, salePrice: 65000, taxRate: 19, stock: 18, minStock: 5, categoryId: electronicsCategory.id },
      { name: 'Memoria RAM 16GB DDR4', sku: 'MEM-001', barcode: '7894561230136', costPrice: 90000, salePrice: 130000, taxRate: 19, stock: 22, minStock: 5, categoryId: electronicsCategory.id },
      { name: 'Disco SSD 1TB Samsung', sku: 'SSD-001', barcode: '7894561230137', costPrice: 150000, salePrice: 200000, taxRate: 19, stock: 15, minStock: 5, categoryId: electronicsCategory.id },
      { name: 'Case Gamer NZXT', sku: 'CAS-001', barcode: '7894561230138', costPrice: 180000, salePrice: 250000, taxRate: 19, stock: 7, minStock: 2, categoryId: electronicsCategory.id },
      { name: 'Fuente de poder 750W Corsair', sku: 'FUE-001', barcode: '7894561230139', costPrice: 200000, salePrice: 280000, taxRate: 19, stock: 10, minStock: 3, categoryId: electronicsCategory.id },
      { name: 'Camiseta algodón XL', sku: 'ROP-001', barcode: '7894561230140', costPrice: 45000, salePrice: 75000, taxRate: 19, stock: 50, minStock: 15, categoryId: clothingCategory.id },
      { name: 'Pantalón jeans clásico', sku: 'ROP-002', barcode: '7894561230141', costPrice: 60000, salePrice: 90000, taxRate: 19, stock: 40, minStock: 10, categoryId: clothingCategory.id },
      { name: 'Zapatos deportivos Running', sku: 'ROP-003', barcode: '7894561230142', costPrice: 120000, salePrice: 180000, taxRate: 19, stock: 25, minStock: 8, categoryId: clothingCategory.id },
      { name: 'Gorra de lana beis', sku: 'ROP-004', barcode: '7894561230143', costPrice: 35000, salePrice: 55000, taxRate: 19, stock: 30, minStock: 10, categoryId: clothingCategory.id },
      { name: 'Chaqueta impermeable', sku: 'ROP-005', barcode: '7894561230144', costPrice: 180000, salePrice: 280000, taxRate: 19, stock: 20, minStock: 5, categoryId: clothingCategory.id },
      { name: 'Camiseta polo blanco M', sku: 'ROP-006', barcode: '7894561230145', costPrice: 55000, salePrice: 85000, taxRate: 19, stock: 35, minStock: 10, categoryId: clothingCategory.id },
      { name: 'Pantalón chándal clásico', sku: 'ROP-007', barcode: '7894561230146', costPrice: 65000, salePrice: 95000, taxRate: 19, stock: 45, minStock: 15, categoryId: clothingCategory.id },
      { name: 'Botas de cuero para hombre', sku: 'ROP-008', barcode: '7894561230147', costPrice: 150000, salePrice: 220000, taxRate: 19, stock: 18, minStock: 5, categoryId: clothingCategory.id },
      { name: 'Coca-Cola 2L botella', sku: 'BEB-001', barcode: '7894561230148', costPrice: 2500, salePrice: 4000, taxRate: 19, stock: 100, minStock: 20, categoryId: beveragesCategory.id },
      { name: 'Pepsi 600ml lata', sku: 'BEB-002', barcode: '7894561230149', costPrice: 2000, salePrice: 3500, taxRate: 19, stock: 80, minStock: 15, categoryId: beveragesCategory.id },
      { name: 'Jugo de naranja natural 500ml', sku: 'BEB-003', barcode: '7894561230150', costPrice: 3000, salePrice: 5000, taxRate: 19, stock: 60, minStock: 15, categoryId: beveragesCategory.id },
      { name: 'Cerveza Club Colombia 330ml', sku: 'BEB-004', barcode: '7894561230151', costPrice: 2500, salePrice: 4500, taxRate: 19, stock: 48, minStock: 12, categoryId: beveragesCategory.id },
      { name: 'Agua mineral 500ml botella', sku: 'BEB-005', barcode: '7894561230152', costPrice: 1000, salePrice: 2000, taxRate: 0, stock: 120, minStock: 30, categoryId: beveragesCategory.id },
      { name: 'Gaseosa 2L botella', sku: 'BEB-006', barcode: '7894561230153', costPrice: 2000, salePrice: 3000, taxRate: 19, stock: 150, minStock: 30, categoryId: beveragesCategory.id },
      { name: 'Papas Lays clásicas 150g', sku: 'ALI-001', barcode: '7894561230154', costPrice: 3000, salePrice: 5500, taxRate: 19, stock: 75, minStock: 20, categoryId: foodCategory.id },
      { name: 'Galletas Oreo paquete 300g', sku: 'ALI-002', barcode: '7894561230155', costPrice: 3500, salePrice: 6000, taxRate: 19, stock: 60, minStock: 15, categoryId: foodCategory.id },
      { name: 'Chocolatina Jet paquete 200g', sku: 'ALI-003', barcode: '7894561230156', costPrice: 4000, salePrice: 7000, taxRate: 19, stock: 50, minStock: 10, categoryId: foodCategory.id },
      { name: 'Papas Fritas McColloño 150g', sku: 'ALI-004', barcode: '7894561230157', costPrice: 3500, salePrice: 6500, taxRate: 19, stock: 65, minStock: 15, categoryId: foodCategory.id },
      { name: 'Nachos con queso 100g', sku: 'ALI-005', barcode: '7894561230158', costPrice: 4000, salePrice: 7500, taxRate: 19, stock: 40, minStock: 10, categoryId: foodCategory.id },
      { name: 'Gomitas Mastic paquete 200g', sku: 'ALI-006', barcode: '7894561230159', costPrice: 2500, salePrice: 4500, taxRate: 19, stock: 80, minStock: 20, categoryId: foodCategory.id },
      { name: 'Helados popsicle caja 12u', sku: 'ALI-007', barcode: '7894561230160', costPrice: 2000, salePrice: 4000, taxRate: 19, stock: 30, minStock: 10, categoryId: foodCategory.id },
      { name: 'Cereal Kellogg caja 500g', sku: 'ALI-008', barcode: '7894561230161', costPrice: 6000, salePrice: 10000, taxRate: 19, stock: 25, minStock: 5, categoryId: foodCategory.id },
      { name: 'Detergente líquido 2L', sku: 'LIM-001', barcode: '7894561230162', costPrice: 8500, salePrice: 15000, taxRate: 19, stock: 40, minStock: 10, categoryId: cleaningCategory.id },
      { name: 'Desinfectante multiuso 500ml', sku: 'LIM-002', barcode: '7894561230163', costPrice: 12000, salePrice: 22000, taxRate: 19, stock: 25, minStock: 5, categoryId: cleaningCategory.id },
      { name: 'Papel higiénico rollo 200m', sku: 'LIM-003', barcode: '7894561230164', costPrice: 5000, salePrice: 9000, taxRate: 19, stock: 50, minStock: 15, categoryId: cleaningCategory.id },
      { name: 'Escoba suave 1u', sku: 'LIM-004', barcode: '7894561230165', costPrice: 15000, salePrice: 25000, taxRate: 19, stock: 30, minStock: 10, categoryId: cleaningCategory.id },
      { name: 'Limpiador de pisos 2L', sku: 'LIM-005', barcode: '7894561230166', costPrice: 18000, salePrice: 32000, taxRate: 19, stock: 15, minStock: 5, categoryId: cleaningCategory.id },
    ],
  });

  await prisma.customer.createMany({
    data: [
      {
        name: 'Carlos Rodríguez',
        documentType: 'CC',
        documentNumber: '1234567890',
        email: 'carlos.rodriguez@email.com',
        phone: '300-123-4567',
        address: 'Calle 123 #45-67, Bogotá',
        segment: 'VIP',
      },
      {
        name: 'María González',
        documentType: 'CC',
        documentNumber: '9876543210',
        email: 'maria.gonzalez@email.com',
        phone: '310-987-6543',
        address: 'Carrera 7 #8-92, Medellín',
        segment: 'FREQUENT',
      },
      {
        name: 'Pedro Pérez',
        documentType: 'NIT',
        documentNumber: '900123456',
        email: 'pedro.perez@empresa.com',
        phone: '320-111-2222',
        address: 'Avenida Siempre Vivas #123, Cali',
        segment: 'OCCASIONAL',
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📊 Users created:');
  console.log('  - admin@inventory.com / admin123 (ADMIN)');
  console.log('  - cajero@inventory.com / cashier123 (CASHIER)');
  console.log('  - inventory@inventory.com / cashier123 (INVENTORY_USER)');
  console.log('');
  console.log('📦 Products created: 20 items');
  console.log('📁 Categories created: 5 categories');
  console.log('👥 Customers created: 3 customers');
  console.log('');
  console.log('⚙️  Settings configured: Mi Negocio / COP / 19% IVA');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });