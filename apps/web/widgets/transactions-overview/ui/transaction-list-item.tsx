import {
  ArrowDownToLine,
  ArrowRightLeft,
  Coins,
  PiggyBank,
} from 'lucide-react';

import type { Transaction, TransactionType } from '@/shared/api/types';
import { Card, CardContent } from '@/shared/ui/card';
import {
  formatMoney,
  getTransactionCounterparty,
  getTransactionDescription,
  getTransactionStatusLabel,
  getTransactionTypeLabel,
} from '@/widgets/transactions-overview/transaction-overview.utils';

type TransactionListItemProps = {
  transaction: Transaction;
};

const TRANSACTION_ICON_MAP: Record<TransactionType, typeof ArrowRightLeft> = {
  SELF_DEPOSIT: ArrowDownToLine,
  MAIN_TO_SAVINGS: PiggyBank,
  USER_TRANSFER: ArrowRightLeft,
  SAVINGS_INTEREST: Coins,
};

export function TransactionListItem({
  transaction,
}: TransactionListItemProps) {
  const Icon = TRANSACTION_ICON_MAP[transaction.type] ?? ArrowRightLeft;

  return (
    <Card className="rounded-[24px] border-white/70 bg-card/94 shadow-[0_24px_80px_-52px_color-mix(in_oklab,var(--primary)_38%,black)]">
      <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase text-primary">
                {getTransactionTypeLabel(transaction.type)}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {getTransactionStatusLabel(transaction.status)}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {getTransactionDescription(transaction)}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              상대: {getTransactionCounterparty(transaction)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(transaction.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        <div className="md:text-right">
          <div className="text-2xl font-semibold text-foreground">
            {formatMoney(transaction.amount)}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            거래 ID: {transaction.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
