'use client';

import { useQuery } from '@tanstack/react-query';

import { getMyWallets } from '@/shared/api/wallet';

export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets', 'me'],
    queryFn: getMyWallets,
  });
}
