'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';

import { useMeQuery } from '@/entities/user';
import { useLogoutMutation } from '@/features/logout';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const primaryCtaClassName =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--primary)_75%,black)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35';

const secondaryCtaClassName =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-transparent bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35';

const ghostCtaClassName =
  'group inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-foreground transition-all hover:bg-accent/70 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35';

const productHighlights = [
  {
    icon: ShieldCheck,
    title: '세션 기반 보안 흐름',
    description:
      '짧은 유휴 만료와 쿠키 세션 기반 인증으로 인증 흐름을 단순하고 안전하게 유지합니다.',
  },
  {
    icon: Landmark,
    title: '메인 계좌 중심 구조',
    description:
      '회원가입과 동시에 메인 계좌가 생성되고, 충전과 송금 흐름이 같은 규칙 안에서 이어집니다.',
  },
  {
    icon: PiggyBank,
    title: '적금 계좌 분리',
    description:
      '메인 계좌 잔액을 기준으로 적금 계좌를 별도로 운용해 자금 흐름을 더 명확하게 관리할 수 있습니다.',
  },
  {
    icon: ReceiptText,
    title: '거래내역 추적',
    description:
      '직접 충전, 사용자 간 송금, 메인-적금 이체 내역을 같은 기준으로 확인할 수 있습니다.',
  },
];

const productSteps = [
  '회원가입과 동시에 메인 계좌 생성',
  '직접 충전 또는 사용자 간 송금',
  '적금 계좌로 자금 분리 및 거래내역 확인',
];

export default function HomePage() {
  const meQuery = useMeQuery();
  const logoutMutation = useLogoutMutation();
  const user = meQuery.data?.user ?? null;

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_42%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-6 py-8 md:px-10 md:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.22em] uppercase text-primary"
            href="/"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_40px_-22px_color-mix(in_oklab,var(--primary)_75%,black)]">
              M
            </span>
            Mini Pay
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden rounded-full border border-primary/14 bg-primary/8 px-4 py-2 text-sm font-medium text-primary md:block">
                  {user.name}
                </div>
                <Link className={ghostCtaClassName} href="/wallets">
                  내 지갑
                </Link>
                <button
                  className={cn(secondaryCtaClassName, 'h-11 px-5')}
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                </button>
              </>
            ) : (
              <>
                <Link className={ghostCtaClassName} href="/login">
                  로그인
                </Link>
                <Link
                  className={cn(primaryCtaClassName, 'h-11 px-5')}
                  href="/signup"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-primary/14 bg-primary/8 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase text-primary">
              Public landing
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">
              자금 흐름을
              <br />
              더 단단하고
              <br />
              더 단순하게.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
              Mini Pay는 메인 계좌, 적금 계좌, 거래내역을 한 흐름으로 묶어
              충전과 송금, 자금 분리를 같은 규칙 안에서 관리할 수 있게
              설계된 개인 금융 서비스입니다.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <>
                  <Link className={primaryCtaClassName} href="/wallets">
                    내 지갑 열기
                    <ArrowRight className="size-4" />
                  </Link>
                  <button
                    className={secondaryCtaClassName}
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                    <ArrowUpRight className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link className={primaryCtaClassName} href="/signup">
                    회원가입 시작
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link className={secondaryCtaClassName} href="/login">
                    로그인
                    <ArrowUpRight className="size-4" />
                  </Link>
                </>
              )}
            </div>

            <ul className="mt-10 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              {productSteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-border/80 bg-card/80 px-4 py-4 shadow-[0_18px_40px_-34px_color-mix(in_oklab,var(--primary)_70%,black)]"
                >
                  <div className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                    Step {index + 1}
                  </div>
                  <p className="mt-2 leading-6 text-foreground/90">{step}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--accent)_55%,transparent),transparent_52%)] blur-2xl" />
            <Card className="overflow-hidden rounded-[32px] border-white/70 bg-card/92 shadow-[0_38px_110px_-54px_color-mix(in_oklab,var(--primary)_60%,black)]">
              <CardHeader className="border-b border-border/70 pb-6">
                <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
                  Service flow
                </div>
                <CardTitle className="mt-4 text-2xl leading-tight">
                  계좌와 거래가
                  <br />
                  같은 언어로 이어지도록.
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-6">
                {productHighlights.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-border/75 bg-background/88 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">
                          {title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
