'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { transferToSavings } from '@/shared/api/wallet';

const currencyFormatter = new Intl.NumberFormat('ko-KR');

function formatMoney(value: string | number) {
  return `${currencyFormatter.format(Number(value))}원`;
}

export function useTransferToSavingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferToSavings,
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
        `적금 계좌로 ${formatMoney(response.transaction.amount)} 이체했습니다.`,
      );
    },
  });
}
