import { Landmark, PiggyBank } from 'lucide-react';

import type { Wallet } from '@/shared/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  formatMoney,
  getStatusLabel,
  getWalletLabel,
} from '@/widgets/wallets-overview/wallet-overview.utils';

type WalletCardProps = {
  wallet: Wallet;
};

export function WalletCard({ wallet }: WalletCardProps) {
  const Icon = wallet.type === 'MAIN' ? Landmark : PiggyBank;

  return (
    <Card className="rounded-[28px] border-white/70 bg-card/94 shadow-[0_28px_90px_-56px_color-mix(in_oklab,var(--primary)_70%,black)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div>
          <div className="inline-flex rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
            {getWalletLabel(wallet.type)}
          </div>
          <CardTitle className="mt-4 text-2xl">{formatMoney(wallet.balance)}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {wallet.currency} · {getStatusLabel(wallet.status)}
          </p>
        </div>

        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-4">
          <span>계좌 ID</span>
          <span className="truncate font-medium text-foreground">{wallet.id}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>생성일</span>
          <span className="font-medium text-foreground">
            {new Date(wallet.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
