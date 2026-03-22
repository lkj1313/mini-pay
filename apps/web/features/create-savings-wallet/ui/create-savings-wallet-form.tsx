'use client';

import { useForm, useWatch } from 'react-hook-form';

import {
  createSavingsWalletSchema,
  type CreateSavingsWalletFormValues,
} from '@/features/create-savings-wallet/model/create-savings-wallet-schema';
import { useCreateSavingsWalletMutation } from '@/features/create-savings-wallet/model/use-create-savings-wallet-mutation';
import { createZodResolver } from '@/shared/lib/zod-resolver';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type CreateSavingsWalletFormProps = {
  onSuccess?: () => void;
};

export function CreateSavingsWalletForm({
  onSuccess,
}: CreateSavingsWalletFormProps) {
  const createSavingsWalletMutation = useCreateSavingsWalletMutation();
  const form = useForm<CreateSavingsWalletFormValues>({
    resolver: createZodResolver(createSavingsWalletSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      productType: 'FREE',
      autoTransferAmount: '',
    },
  });

  const {
    register,
    reset,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = form;

  const productType = useWatch({
    control: form.control,
    name: 'productType',
  });
  const isPending = isSubmitting || createSavingsWalletMutation.isPending;
  const autoTransferAmountField = register('autoTransferAmount', {
    onChange: () => {
      clearErrors('autoTransferAmount');
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createSavingsWalletMutation.mutateAsync({
      productType: values.productType,
      autoTransferAmount:
        values.productType === 'FIXED'
          ? Number(values.autoTransferAmount)
          : undefined,
    });

    reset({
      productType: 'FREE',
      autoTransferAmount: '',
    });
    onSuccess?.();
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-3">
        <Label>적금 상품</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="group cursor-pointer rounded-2xl border border-border/70 bg-card px-4 py-4 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/6">
            <input
              type="radio"
              value="FREE"
              className="sr-only"
              disabled={isPending}
              {...register('productType')}
            />
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">자유 적금</p>
              <p className="text-sm leading-6 text-muted-foreground">
                원할 때마다 메인 계좌에서 적금 계좌로 직접 이체할 수 있습니다.
              </p>
              <p className="text-xs font-medium text-primary">연 3%</p>
            </div>
          </label>

          <label className="group cursor-pointer rounded-2xl border border-border/70 bg-card px-4 py-4 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/6">
            <input
              type="radio"
              value="FIXED"
              className="sr-only"
              disabled={isPending}
              {...register('productType')}
            />
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">정기 적금</p>
              <p className="text-sm leading-6 text-muted-foreground">
                매일 오전 8시에 정해진 금액이 메인 계좌에서 자동으로 이체됩니다.
              </p>
              <p className="text-xs font-medium text-primary">연 5%</p>
            </div>
          </label>
        </div>
      </div>

      {productType === 'FIXED' ? (
        <div className="space-y-2">
          <Label htmlFor="savings-auto-transfer-amount">자동 이체 금액</Label>
          <Input
            id="savings-auto-transfer-amount"
            type="text"
            inputMode="numeric"
            placeholder="예: 10000"
            aria-invalid={Boolean(errors.autoTransferAmount)}
            disabled={isPending}
            {...autoTransferAmountField}
          />
          {errors.autoTransferAmount ? (
            <p className="text-sm font-medium text-destructive">
              {errors.autoTransferAmount.message}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              정기 적금은 매일 같은 금액이 메인 계좌에서 자동으로 빠져나갑니다.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
          자유 적금은 적금 계좌를 만든 뒤, 필요할 때마다 메인 계좌에서 직접 이체해
          넣는 방식입니다.
        </div>
      )}

      <Button className="h-11 w-full text-sm" type="submit" disabled={isPending}>
        {isPending ? '적금 계좌 생성 중...' : '적금 계좌 만들기'}
      </Button>
    </form>
  );
}
