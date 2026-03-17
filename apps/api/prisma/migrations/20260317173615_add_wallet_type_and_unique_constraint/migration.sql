-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('MAIN', 'SAVINGS');

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN "type" "WalletType";

-- Backfill existing rows before enforcing NOT NULL
UPDATE "Wallet" SET "type" = 'MAIN' WHERE "type" IS NULL;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "type" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_type_key" ON "Wallet"("userId", "type");
