'use client';

import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

import { useWalletsQuery } from '@/entities/wallet';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { SavingsEmptyState } from '@/widgets/wallets-overview/ui/savings-empty-state';
import { WalletActions } from '@/widgets/wallets-overview/ui/wallet-actions';
import { WalletCard } from '@/widgets/wallets-overview/ui/wallet-card';
import { WalletSkeleton } from '@/widgets/wallets-overview/ui/wallet-skeleton';

export default function WalletsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useWalletsQuery();

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_42%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-primary/12 bg-primary/8 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase text-primary">
              Protected wallets
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              내 메인 계좌와 적금 계좌를
              <br />
              한 화면에서 관리합니다.
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              로그인한 상태에서만 접근할 수 있는 지갑 대시보드입니다. 충전, 적금 이체,
              사용자 송금 같은 흐름의 출발점을 여기에서 확인할 수 있습니다.
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
              href="/"
            >
              홈으로
            </Link>
          </div>
        </header>

        {isError ? (
          <Card className="rounded-[28px] border-destructive/18 bg-card/94">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  지갑 정보를 불러오지 못했습니다.
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  세션이 만료됐거나 일시적인 네트워크 문제가 있을 수 있습니다. 다시 시도한
                  뒤에도 계속 실패하면 다시 로그인해 주세요.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  다시 시도
                </Button>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110"
                  href="/login"
                >
                  로그인으로
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          {isLoading ? <WalletSkeleton /> : data?.mainWallet ? <WalletCard wallet={data.mainWallet} /> : null}
          {isLoading ? (
            <WalletSkeleton />
          ) : data?.savingsWallet ? (
            <WalletCard wallet={data.savingsWallet} />
          ) : (
            <SavingsEmptyState />
          )}
        </section>

        <WalletActions />
      </div>
    </main>
  );
}
