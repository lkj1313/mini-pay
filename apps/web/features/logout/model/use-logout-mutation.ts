'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { logout } from '@/shared/api/auth';

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.invalidateQueries({
        queryKey: ['auth', 'me'],
      });
      toast.success('로그아웃되었습니다.');
      router.push('/login');
    },
  });
}
