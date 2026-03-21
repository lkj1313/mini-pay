'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { depositToMainWallet } from '@/shared/api/wallet';

const currencyFormatter = new Intl.NumberFormat('ko-KR');

function formatMoney(value: string | number) {
  return `${currencyFormatter.format(Number(value))}원`;
}

export function useDepositMainWalletMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: depositToMainWallet,
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['wallets', 'me'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactions', 'me'],
        }),
      ]);

      toast.success(
        `충전이 완료되었습니다. 남은 직접 충전 한도는 ${formatMoney(response.remainingDailyLimit)}입니다.`,
      );
    },
  });
}
