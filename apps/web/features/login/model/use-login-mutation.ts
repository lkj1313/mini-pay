'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  login,
  type LoginRequest,
  type LoginResponse,
} from '@/shared/api/auth';

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['auth', 'me'],
      });
      toast.success('로그인되었습니다.');
      router.push('/');
    },
  });
}
