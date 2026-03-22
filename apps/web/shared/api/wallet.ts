import { api } from "@/shared/api/client";
import type { Transaction, Wallet } from "@/shared/api/types";

export type MyWalletsResponse = {
  mainWallet: Wallet | null;
  savingsWallet: Wallet | null;
};

export type DepositMainWalletRequest = {
  amount: number;
};

export type DepositMainWalletResponse = {
  wallet: Wallet;
  transaction: Omit<Transaction, "fromWalletId" | "toWalletId">;
  remainingDailyLimit: number | string;
};

export type CreateSavingsWalletResponse = {
  wallet: Wallet;
};

export type CreateSavingsWalletRequest = {
  productType?: "FREE" | "FIXED";
  autoTransferAmount?: number;
};

export type TransferToSavingsRequest = {
  amount: number;
};

export type TransferToSavingsResponse = {
  mainWallet: Wallet;
  savingsWallet: Wallet;
  transaction: Omit<Transaction, "fromUserName" | "toUserName" | "counterpartyName">;
};

export type TransferToUserRequest = {
  toEmail: string;
  amount: number;
};

export type TransferToUserResponse = {
  fromWallet: Wallet;
  toWallet: Wallet;
  transaction: Omit<Transaction, "fromUserName" | "toUserName" | "counterpartyName">;
};

export function getMyWallets() {
  return api.get<MyWalletsResponse>("/wallets/me");
}

export function createSavingsWallet(body?: CreateSavingsWalletRequest) {
  return api.post<CreateSavingsWalletResponse>("/wallets/savings", body);
}

export function depositToMainWallet(body: DepositMainWalletRequest) {
  return api.post<DepositMainWalletResponse>("/wallets/main/deposit", body);
}

export function transferToSavings(body: TransferToSavingsRequest) {
  return api.post<TransferToSavingsResponse>("/wallets/savings/transfer", body);
}

export function transferToUser(body: TransferToUserRequest) {
  return api.post<TransferToUserResponse>("/wallets/transfer", body);
}
