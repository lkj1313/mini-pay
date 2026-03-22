-- Add snapshot columns for sender/receiver names at transaction creation time.
ALTER TABLE "Transaction"
ADD COLUMN "fromUserNameSnapshot" TEXT,
ADD COLUMN "toUserNameSnapshot" TEXT;
