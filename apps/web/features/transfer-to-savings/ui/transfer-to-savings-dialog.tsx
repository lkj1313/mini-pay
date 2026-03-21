'use client';

import * as React from 'react';
import { PiggyBank } from 'lucide-react';

import { TransferToSavingsForm } from '@/features/transfer-to-savings/ui/transfer-to-savings-form';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type TransferToSavingsDialogProps = {
  children?: React.ReactNode;
};

export function TransferToSavingsDialog({
  children,
}: TransferToSavingsDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger className="group/button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50">
          <PiggyBank className="size-4" />
          적금 이체하기
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
            Savings transfer
          </div>
          <DialogTitle>메인 계좌에서 적금 계좌로 이체</DialogTitle>
          <DialogDescription>
            메인 계좌 잔액 안에서 적금 계좌로 금액을 옮깁니다. 이체가 끝나면 두 계좌
            잔액과 거래내역이 바로 갱신됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <TransferToSavingsForm onSuccess={() => setOpen(false)} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
