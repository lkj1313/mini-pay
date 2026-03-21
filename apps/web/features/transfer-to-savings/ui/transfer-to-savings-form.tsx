'use client';

import { useForm } from 'react-hook-form';

import {
  transferToSavingsSchema,
  type TransferToSavingsFormValues,
} from '@/features/transfer-to-savings/model/transfer-to-savings-schema';
import { useTransferToSavingsMutation } from '@/features/transfer-to-savings/model/use-transfer-to-savings-mutation';
import { createZodResolver } from '@/shared/lib/zod-resolver';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type TransferToSavingsFormProps = {
  onSuccess?: () => void;
};

export function TransferToSavingsForm({
  onSuccess,
}: TransferToSavingsFormProps) {
  const transferToSavingsMutation = useTransferToSavingsMutation();
  const form = useForm<TransferToSavingsFormValues>({
    resolver: createZodResolver(transferToSavingsSchema),
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

  const isPending = isSubmitting || transferToSavingsMutation.isPending;
  const amountField = register('amount', {
    onChange: () => {
      clearErrors('amount');
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await transferToSavingsMutation.mutateAsync(values);
    reset();
    onSuccess?.();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="transfer-to-savings-amount">이체 금액</Label>
        <Input
          id="transfer-to-savings-amount"
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
            메인 계좌에서 적금 계좌로 원하는 금액만큼 이체할 수 있습니다.
          </p>
        )}
      </div>

      <Button className="h-11 w-full text-sm" type="submit" disabled={isPending}>
        {isPending ? '이체 중...' : '적금 계좌로 이체하기'}
      </Button>
    </form>
  );
}
