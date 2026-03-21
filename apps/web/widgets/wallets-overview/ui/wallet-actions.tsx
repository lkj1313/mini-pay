import * as React from 'react';
import { ArrowUpRight, PiggyBank, ShieldCheck, Wallet2 } from 'lucide-react';

import { DepositMainWalletDialog } from '@/features/deposit-main-wallet';
import { TransferToSavingsDialog } from '@/features/transfer-to-savings';
import { TransferToUserDialog } from '@/features/transfer-to-user';
import { cn } from '@/shared/lib/utils';
import { CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type ActionCardTriggerProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentLabel: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function ActionCardTrigger({
  icon,
  title,
  description,
  accentLabel,
  className,
  ...props
}: ActionCardTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        'group w-full cursor-pointer rounded-[28px] border border-white/70 bg-card/92 text-left shadow-[0_30px_80px_-42px_color-mix(in_oklab,var(--primary)_32%,black)] backdrop-blur-sm transition-all duration-200 ease-out',
        'hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_38px_100px_-42px_color-mix(in_oklab,var(--primary)_42%,black)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4',
        className,
      )}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105 group-hover:bg-primary/14">
            {icon}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary/80">
            <span>{accentLabel}</span>
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
        <CardTitle className="mt-4 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {description}
      </CardContent>
    </button>
  );
}

export function WalletActions() {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <DepositMainWalletDialog>
        <ActionCardTrigger
          icon={<Wallet2 className="size-5" />}
          title="직접 충전"
          description="본인 직접 충전은 하루 한도 안에서 메인 계좌에 반영됩니다. 충전이 끝나면 메인 계좌 잔액도 바로 갱신됩니다."
          accentLabel="Open"
        />
      </DepositMainWalletDialog>

      <TransferToSavingsDialog>
        <ActionCardTrigger
          icon={<PiggyBank className="size-5" />}
          title="적금 이체"
          description="메인 계좌에서 적금 계좌로 자금을 분리하는 흐름입니다. 적금 잔액을 따로 관리하고 싶을 때 바로 이체할 수 있습니다."
          accentLabel="Open"
        />
      </TransferToSavingsDialog>

      <TransferToUserDialog>
        <ActionCardTrigger
          icon={<ShieldCheck className="size-5" />}
          title="사용자 송금"
          description="다른 사용자 메인 계좌로 송금하는 흐름입니다. 이메일과 송금 금액만 입력하면 바로 보낼 수 있습니다."
          accentLabel="Open"
        />
      </TransferToUserDialog>
    </section>
  );
}
