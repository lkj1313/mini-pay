'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { transferToUser } from '@/shared/api/wallet';

const currencyFormatter = new Intl.NumberFormat('ko-KR');

function formatMoney(value: string | number) {
  return `${currencyFormatter.format(Number(value))}원`;
}

export function useTransferToUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferToUser,
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['wallets', 'me'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactions', 'me'],
        }),
      ]);

      toast.success(
        `${variables.toEmail}로 ${formatMoney(response.transaction.amount)} 송금했습니다.`,
      );
    },
  });
}
