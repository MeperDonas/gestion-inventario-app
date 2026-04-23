-- Multi-tenant Fase 0: Schema refactor
-- Applied via prisma db push --accept-data-loss
-- Manual additions below:

-- Eliminar índice regular creado por Prisma y reemplazar por índice parcial UNIQUE
DROP INDEX IF EXISTS "Product_organizationId_barcode_idx";

-- Índice parcial para barcode nullable (PostgreSQL no permite múltiples NULLs en UNIQUE)
-- Prisma no soporta índices parciales nativamente
CREATE UNIQUE INDEX "Product_organizationId_barcode_idx" 
  ON "Product" ("organizationId", "barcode") 
  WHERE "barcode" IS NOT NULL;
