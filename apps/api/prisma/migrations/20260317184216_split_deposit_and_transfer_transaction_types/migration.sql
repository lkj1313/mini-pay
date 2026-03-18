-- Rename the existing self-charge transaction type and add a separate type
-- for wallet-to-wallet transfers between users.
ALTER TYPE "TransactionType" RENAME VALUE 'EXTERNAL_DEPOSIT' TO 'SELF_DEPOSIT';

ALTER TYPE "TransactionType" ADD VALUE 'USER_TRANSFER';
