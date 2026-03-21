'use client';

import * as React from 'react';
import { ShieldCheck } from 'lucide-react';

import { TransferToUserForm } from '@/features/transfer-to-user/ui/transfer-to-user-form';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type TransferToUserDialogProps = {
  children?: React.ReactNode;
};

export function TransferToUserDialog({
  children,
}: TransferToUserDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger className="group/button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50">
          <ShieldCheck className="size-4" />
          사용자 송금하기
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
            User transfer
          </div>
          <DialogTitle>다른 사용자에게 송금</DialogTitle>
          <DialogDescription>
            가입된 다른 사용자의 이메일을 기준으로 메인 계좌에 송금합니다. 송금이 끝나면
            지갑 잔액과 거래내역이 바로 갱신됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <TransferToUserForm onSuccess={() => setOpen(false)} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
