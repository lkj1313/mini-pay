import { z } from 'zod/v4';

export const transferToUserSchema = z.object({
  toEmail: z
    .string()
    .trim()
    .min(1, '받는 사용자 이메일을 입력해주세요.')
    .email('올바른 이메일 형식이어야 합니다.'),
  amount: z
    .string()
    .trim()
    .min(1, '송금 금액을 입력해주세요.')
    .refine((value) => /^\d+$/.test(value), {
      message: '송금 금액은 숫자만 입력해주세요.',
    })
    .transform((value) => Number(value))
    .refine(Number.isInteger, {
      message: '송금 금액은 정수여야 합니다.',
    })
    .refine((value) => value >= 1, {
      message: '송금 금액은 1원 이상이어야 합니다.',
    }),
});

export type TransferToUserFormValues = z.infer<typeof transferToUserSchema>;
