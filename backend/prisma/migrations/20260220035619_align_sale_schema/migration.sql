/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Sale` table. All the data in the column will be lost.
  - Made the column `amountPaid` on table `Sale` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "paymentMethod",
ALTER COLUMN "amountPaid" SET NOT NULL;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
