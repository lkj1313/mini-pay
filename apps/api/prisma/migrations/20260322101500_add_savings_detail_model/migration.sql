-- Create enum for savings product type.
CREATE TYPE "SavingsProductType" AS ENUM ('FREE', 'FIXED');

-- Create detail table for savings wallets.
CREATE TABLE "SavingsDetail" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "productType" "SavingsProductType" NOT NULL,
    "annualInterestRate" DECIMAL(5,4) NOT NULL,
    "autoTransferAmount" BIGINT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityAt" TIMESTAMP(3),
    "lastInterestAppliedAt" TIMESTAMP(3),
    "lastAutoTransferAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsDetail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavingsDetail_walletId_key" ON "SavingsDetail"("walletId");

ALTER TABLE "SavingsDetail"
ADD CONSTRAINT "SavingsDetail_walletId_fkey"
FOREIGN KEY ("walletId") REFERENCES "Wallet"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
