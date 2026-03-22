'use client';

import { PiggyBank } from 'lucide-react';

import { CreateSavingsWalletDialog } from '@/features/create-savings-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function SavingsEmptyState() {
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
          메인 계좌 자금을 따로 분리해 관리하려면 적금 계좌를 먼저 개설해야 합니다.
          자유 적금과 정기 적금 중 하나를 선택해 바로 시작할 수 있습니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CreateSavingsWalletDialog />
          <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
            사용자당 적금 계좌는 하나만 만들 수 있습니다.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
