'use client';

import { useForm } from 'react-hook-form';

import {
  depositMainWalletSchema,
  type DepositMainWalletFormValues,
} from '@/features/deposit-main-wallet/model/deposit-main-wallet-schema';
import { useDepositMainWalletMutation } from '@/features/deposit-main-wallet/model/use-deposit-main-wallet-mutation';
import { createZodResolver } from '@/shared/lib/zod-resolver';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type DepositMainWalletFormProps = {
  onSuccess?: () => void;
};

export function DepositMainWalletForm({
  onSuccess,
}: DepositMainWalletFormProps) {
  const depositMainWalletMutation = useDepositMainWalletMutation();
  const form = useForm<DepositMainWalletFormValues>({
    resolver: createZodResolver(depositMainWalletSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    clearErrors,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const isPending = isSubmitting || depositMainWalletMutation.isPending;
  const amountField = register('amount', {
    onChange: () => {
      clearErrors('amount');
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await depositMainWalletMutation.mutateAsync(values);
    reset();
    onSuccess?.();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="deposit-amount">충전 금액</Label>
        <Input
          id="deposit-amount"
          type="text"
          inputMode="numeric"
          placeholder="예: 50000"
          aria-invalid={Boolean(errors.amount)}
          disabled={isPending}
          {...amountField}
        />
        {errors.amount ? (
          <p className="text-sm font-medium text-destructive">
            {errors.amount.message}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            하루 직접 충전 한도는 3,000,000원입니다.
          </p>
        )}
      </div>

      <Button className="h-11 w-full text-sm" type="submit" disabled={isPending}>
        {isPending ? '충전 중...' : '메인 계좌 충전하기'}
      </Button>
    </form>
  );
}
