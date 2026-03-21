export const queryConfig = {
  queries: {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  },
  mutations: {
    retry: false,
  },
} as const;
