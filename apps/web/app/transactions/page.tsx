'use client';

import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

import { useTransactionsQuery } from '@/entities/transaction';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { TransactionListItem } from '@/widgets/transactions-overview/ui/transaction-list-item';
import { TransactionListSkeleton } from '@/widgets/transactions-overview/ui/transaction-list-skeleton';

export default function TransactionsPage() {
  const { data, isLoading, isError, isFetching, refetch } = useTransactionsQuery();

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_42%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-primary/12 bg-primary/8 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase text-primary">
              Protected transactions
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              직접 충전과 이체 내역을
              <br />
              한 곳에서 확인합니다.
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              메인 계좌 충전, 적금 이체, 사용자 송금처럼 지금까지 만든 거래 흐름이 최신순으로
              쌓입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-11 px-4 text-sm"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
            >
              <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
              새로고침
            </Button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110"
              href="/wallets"
            >
              지갑으로
            </Link>
          </div>
        </header>

        {isError ? (
          <Card className="rounded-[28px] border-destructive/18 bg-card/94">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  거래내역을 불러오지 못했습니다.
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  세션이 만료됐거나 일시적인 네트워크 문제가 있을 수 있습니다. 다시 시도해
                  주세요.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void refetch();
                }}
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? <TransactionListSkeleton /> : null}

        {!isLoading && data?.length === 0 ? (
          <Card className="rounded-[28px] border-dashed border-primary/18 bg-card/92">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground">
                아직 거래내역이 없습니다.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                지갑 페이지에서 직접 충전, 적금 이체, 사용자 송금을 시작하면 이곳에 최신
                내역이 표시됩니다.
              </p>
              <div className="mt-6">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110"
                  href="/wallets"
                >
                  지갑에서 거래 시작하기
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && data?.length ? (
          <section className="grid gap-4">
            {data.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
