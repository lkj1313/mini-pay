export type ApiMessage = string | string[];

export type ApiErrorPayload = {
  message?: ApiMessage;
  statusCode?: number;
  error?: string;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type Money = number | string;

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletType = "MAIN" | "SAVINGS";
export type WalletStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export type Wallet = {
  id: string;
  type: WalletType;
  balance: Money;
  currency: string;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
};

export type TransactionType =
  | "SELF_DEPOSIT"
  | "USER_TRANSFER"
  | "MAIN_TO_SAVINGS";

export type TransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELED";

export type Transaction = {
  id: string;
  fromWalletId: string | null;
  toWalletId: string;
  amount: Money;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  createdAt: string;
  fromUserName?: string | null;
  toUserName?: string | null;
  counterpartyName?: string;
};
