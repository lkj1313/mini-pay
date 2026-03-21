import { api } from "@/shared/api/client";
import type { Transaction } from "@/shared/api/types";

export function getMyTransactions() {
  return api.get<Transaction[]>("/transactions/me");
}
