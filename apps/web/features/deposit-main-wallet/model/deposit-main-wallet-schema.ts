import { z } from 'zod/v4';

export const depositMainWalletSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, '충전 금액을 입력해주세요.')
    .regex(/^\d+$/, '충전 금액은 숫자만 입력해주세요.')
    .refine((value) => BigInt(value) >= BigInt(1), {
      message: '충전 금액은 1원 이상이어야 합니다.',
    }),
});

export type DepositMainWalletFormValues = z.infer<
  typeof depositMainWalletSchema
>;
