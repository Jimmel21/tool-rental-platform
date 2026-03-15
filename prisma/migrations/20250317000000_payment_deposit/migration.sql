-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('HELD', 'RELEASED', 'DEDUCTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENTAL', 'DEPOSIT');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "depositStatus" "DepositStatus";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "type" "PaymentType" NOT NULL DEFAULT 'RENTAL';
ALTER TABLE "Payment" ADD COLUMN "customerDeclaredPaidAt" TIMESTAMP(3);
