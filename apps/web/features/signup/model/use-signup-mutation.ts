'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  signup,
  type SignupRequest,
  type SignupResponse,
} from '@/shared/api/auth';

export function useSignupMutation() {
  const router = useRouter();

  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: signup,
    onSuccess: (_, variables) => {
      toast.success('회원가입이 완료되었습니다.');
      router.push(`/login?email=${encodeURIComponent(variables.email)}`);
    },
  });
}
