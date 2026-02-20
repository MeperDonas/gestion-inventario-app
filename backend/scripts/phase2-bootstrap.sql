INSERT INTO "User" ("id", "email", "password", "name", "role", "active", "createdAt", "updatedAt")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@inventory.com', '$2b$10$xFY3g9WNkQAAXi/9PRYjPuBK8Jo.YYBbFEWCvM4yj0YGZc/XWYU2.', 'Administrador', 'ADMIN', true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'cajero@inventory.com', '$2b$10$Ph7Kh4Pm3xbUjoqVijhIFe7YY.3bS83kUAU2FJG2GfkUaABAYZNhy', 'Cajero', 'CASHIER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Settings" ("id", "companyName", "currency", "taxRate", "invoicePrefix", "userId", "createdAt", "updatedAt")
VALUES ('33333333-3333-3333-3333-333333333333', 'Mi Negocio', 'COP', 19, 'INV-', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Category" ("id", "name", "description", "active", "createdAt", "updatedAt")
VALUES ('123e4567-e89b-12d3-a456-426614174400', 'Pruebas Fase 2', 'Categoria para validacion automatica', true, NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

WITH category_ref AS (
  SELECT id FROM "Category" WHERE name = 'Pruebas Fase 2' LIMIT 1
)
INSERT INTO "Product" (
  "id", "name", "sku", "barcode", "description", "costPrice", "salePrice", "taxRate", "stock", "minStock", "categoryId", "active", "version", "createdAt", "updatedAt"
)
SELECT
  '123e4567-e89b-12d3-a456-426614174558',
  'Producto Precio BD',
  'PH2-P1B',
  '900000000011',
  'Producto para validar precio desde BD',
  80,
  100,
  19,
  50,
  10,
  category_ref.id,
  true,
  0,
  NOW(),
  NOW()
FROM category_ref
ON CONFLICT ("sku") DO NOTHING;

WITH category_ref AS (
  SELECT id FROM "Category" WHERE name = 'Pruebas Fase 2' LIMIT 1
)
INSERT INTO "Product" (
  "id", "name", "sku", "barcode", "description", "costPrice", "salePrice", "taxRate", "stock", "minStock", "categoryId", "active", "version", "createdAt", "updatedAt"
)
SELECT
  '123e4567-e89b-12d3-a456-426614174669',
  'Producto Low Stock',
  'PH2-P2B',
  '900000000012',
  'Producto para validar low stock',
  40,
  60,
  19,
  2,
  5,
  category_ref.id,
  true,
  0,
  NOW(),
  NOW()
FROM category_ref
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "Customer" (
  "id", "name", "documentType", "documentNumber", "email", "phone", "address", "segment", "active", "createdAt", "updatedAt"
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174777',
  'Cliente Fase 2',
  'CC',
  '123456780',
  'cliente.fase2@test.local',
  '3000000000',
  'Direccion de prueba',
  'OCCASIONAL',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("documentNumber") DO NOTHING;
