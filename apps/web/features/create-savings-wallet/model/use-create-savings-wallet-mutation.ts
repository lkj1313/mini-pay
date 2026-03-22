'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createSavingsWallet } from '@/shared/api/wallet';

export function useCreateSavingsWalletMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavingsWallet,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['wallets', 'me'],
      });

      toast.success(
        variables?.productType === 'FIXED'
          ? '정기 적금 계좌가 생성되었습니다.'
          : '자유 적금 계좌가 생성되었습니다.',
      );
    },
  });
}
