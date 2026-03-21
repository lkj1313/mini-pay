'use client';

import * as React from 'react';
import { Wallet2 } from 'lucide-react';

import { DepositMainWalletForm } from '@/features/deposit-main-wallet/ui/deposit-main-wallet-form';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type DepositMainWalletDialogProps = {
  children?: React.ReactNode;
};

export function DepositMainWalletDialog({
  children,
}: DepositMainWalletDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger className="group/button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50">
          <Wallet2 className="size-4" />
          충전하기
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
            Main wallet
          </div>
          <DialogTitle>메인 계좌 직접 충전</DialogTitle>
          <DialogDescription>
            입력한 금액만큼 메인 계좌를 직접 충전합니다. 충전이 끝나면 남은 일일 직접
            충전 한도도 함께 안내합니다.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <DepositMainWalletForm onSuccess={() => setOpen(false)} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
