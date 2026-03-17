-- AlterTable: Rename invoicePrefix to receiptPrefix (data-preserving rename)
ALTER TABLE "Settings" RENAME COLUMN "invoicePrefix" TO "receiptPrefix";

-- Update default prefix value from INV- to REC- for existing rows
UPDATE "Settings" SET "receiptPrefix" = 'REC-' WHERE "receiptPrefix" = 'INV-';
