'use client';

import { z } from 'zod';

export const createSavingsWalletSchema = z
  .object({
    productType: z.enum(['FREE', 'FIXED']),
    autoTransferAmount: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.productType !== 'FIXED') {
      return;
    }

    const normalizedAmount = values.autoTransferAmount?.trim() ?? '';

    if (normalizedAmount.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['autoTransferAmount'],
        message: '정기 적금은 자동 이체 금액을 입력해주세요.',
      });
      return;
    }

    if (!/^\d+$/.test(normalizedAmount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['autoTransferAmount'],
        message: '자동 이체 금액은 숫자만 입력해주세요.',
      });
      return;
    }

    if (Number(normalizedAmount) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['autoTransferAmount'],
        message: '자동 이체 금액은 1원 이상이어야 합니다.',
      });
    }
  });

export type CreateSavingsWalletFormValues = z.infer<
  typeof createSavingsWalletSchema
>;
