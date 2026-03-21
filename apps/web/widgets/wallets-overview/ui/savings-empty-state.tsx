'use client';

import { PiggyBank } from 'lucide-react';

import { useCreateSavingsWalletMutation } from '@/features/create-savings-wallet';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function SavingsEmptyState() {
  const createSavingsWalletMutation = useCreateSavingsWalletMutation();

  return (
    <Card className="rounded-[28px] border-dashed border-primary/18 bg-card/92 shadow-[0_24px_72px_-52px_color-mix(in_oklab,var(--primary)_65%,black)]">
      <CardHeader className="pb-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PiggyBank className="size-5" />
        </div>
        <CardTitle className="mt-4 text-2xl">적금 계좌가 아직 없습니다.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 border-t border-border/70 pt-5">
        <p className="text-sm leading-6 text-muted-foreground">
          메인 계좌 자금을 따로 분리해서 관리하려면 적금 계좌를 먼저 개설해야 합니다.
          생성이 끝나면 이 자리에 바로 적금 계좌 카드가 표시됩니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            className="h-11 px-5 text-sm"
            disabled={createSavingsWalletMutation.isPending}
            onClick={() => {
              createSavingsWalletMutation.mutate();
            }}
          >
            {createSavingsWalletMutation.isPending
              ? '적금 계좌 생성 중...'
              : '적금 계좌 만들기'}
          </Button>
          <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
            사용자당 적금 계좌는 하나만 만들 수 있습니다.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
