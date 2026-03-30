-- Rollback strategy: This column is nullable, so it can be safely dropped with:
--   ALTER TABLE "Category" DROP COLUMN "defaultTaxRate";
-- No data dependencies exist since the column accepts NULL values.

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "defaultTaxRate" DECIMAL(5,2);
