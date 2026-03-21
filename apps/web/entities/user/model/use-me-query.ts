'use client';

import { useQuery } from '@tanstack/react-query';

import { getMe } from '@/shared/api/auth';
import { ApiError } from '@/shared/api/types';

export function useMeQuery() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
  });
}
