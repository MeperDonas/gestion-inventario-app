CREATE INDEX IF NOT EXISTS "Payment_saleId_idx" ON "Payment"("saleId");

CREATE INDEX IF NOT EXISTS "SaleItem_saleId_idx" ON "SaleItem"("saleId");

CREATE INDEX IF NOT EXISTS "SaleItem_productId_idx" ON "SaleItem"("productId");
