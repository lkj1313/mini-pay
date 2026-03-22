'use client';

import * as React from 'react';
import { PiggyBank } from 'lucide-react';

import { CreateSavingsWalletForm } from '@/features/create-savings-wallet/ui/create-savings-wallet-form';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type CreateSavingsWalletDialogProps = {
  children?: React.ReactNode;
};

export function CreateSavingsWalletDialog({
  children,
}: CreateSavingsWalletDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger className="group/button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50">
          <PiggyBank className="size-4" />
          적금 계좌 만들기
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
            Savings wallet
          </div>
          <DialogTitle>적금 계좌 생성</DialogTitle>
          <DialogDescription>
            자유 적금과 정기 적금 중 원하는 상품을 고르고, 정기 적금이면 자동
            이체 금액까지 함께 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreateSavingsWalletForm onSuccess={() => setOpen(false)} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
