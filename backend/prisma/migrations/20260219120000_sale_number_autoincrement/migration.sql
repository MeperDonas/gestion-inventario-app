-- CreateSequence
CREATE SEQUENCE "Sale_saleNumber_seq";

-- Set sequence value from current data
DO $$
DECLARE
  max_sale_number integer;
BEGIN
  SELECT MAX("saleNumber") INTO max_sale_number FROM "Sale";

  IF max_sale_number IS NULL THEN
    PERFORM setval('"Sale_saleNumber_seq"', 1, false);
  ELSE
    PERFORM setval('"Sale_saleNumber_seq"', max_sale_number, true);
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Sale"
ALTER COLUMN "saleNumber" SET DEFAULT nextval('"Sale_saleNumber_seq"');

-- Set sequence ownership
ALTER SEQUENCE "Sale_saleNumber_seq" OWNED BY "Sale"."saleNumber";
