-- AlterTable: add return condition fields to Booking
ALTER TABLE "Booking" ADD COLUMN "returnCondition" TEXT;
ALTER TABLE "Booking" ADD COLUMN "damageNotes" TEXT;
