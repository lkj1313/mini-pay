'use client';

import { useQuery } from '@tanstack/react-query';

import { getMyTransactions } from '@/shared/api/transaction';

export function useTransactionsQuery() {
  return useQuery({
    queryKey: ['transactions', 'me'],
    queryFn: getMyTransactions,
  });
}
