'use client';

import { useForm } from 'react-hook-form';

import {
  transferToUserSchema,
  type TransferToUserFormValues,
} from '@/features/transfer-to-user/model/transfer-to-user-schema';
import { useTransferToUserMutation } from '@/features/transfer-to-user/model/use-transfer-to-user-mutation';
import { createZodResolver } from '@/shared/lib/zod-resolver';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type TransferToUserFormProps = {
  onSuccess?: () => void;
};

export function TransferToUserForm({
  onSuccess,
}: TransferToUserFormProps) {
  const transferToUserMutation = useTransferToUserMutation();
  const form = useForm<TransferToUserFormValues>({
    resolver: createZodResolver(transferToUserSchema),
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

  const isPending = isSubmitting || transferToUserMutation.isPending;
  const toEmailField = register('toEmail', {
    onChange: () => {
      clearErrors('toEmail');
    },
  });
  const amountField = register('amount', {
    onChange: () => {
      clearErrors('amount');
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await transferToUserMutation.mutateAsync(values);
    reset();
    onSuccess?.();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="transfer-to-user-email">받는 사용자 이메일</Label>
        <Input
          id="transfer-to-user-email"
          type="email"
          placeholder="예: friend@example.com"
          aria-invalid={Boolean(errors.toEmail)}
          disabled={isPending}
          {...toEmailField}
        />
        {errors.toEmail ? (
          <p className="text-sm font-medium text-destructive">
            {errors.toEmail.message}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            가입된 사용자의 이메일을 입력하면 메인 계좌로 바로 송금합니다.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-to-user-amount">송금 금액</Label>
        <Input
          id="transfer-to-user-amount"
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
            메인 계좌 잔액이 부족하면 송금이 실패합니다.
          </p>
        )}
      </div>

      <Button className="h-11 w-full text-sm" type="submit" disabled={isPending}>
        {isPending ? '송금 중...' : '사용자에게 송금하기'}
      </Button>
    </form>
  );
}
