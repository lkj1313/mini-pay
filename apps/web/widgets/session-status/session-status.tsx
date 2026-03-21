'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Clock3, LogOut } from 'lucide-react';

import { useMeQuery } from '@/entities/user';
import { useLogoutMutation } from '@/features/logout';
import { Button } from '@/shared/ui/button';

const SESSION_IDLE_TTL_MS = 10 * 60 * 1000;
const PROTECTED_PREFIXES = ['/wallets', '/transactions'] as const;

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SessionStatus() {
  const pathname = usePathname();
  const { data } = useMeQuery();
  const logoutMutation = useLogoutMutation();
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [activityExpiresAt, setActivityExpiresAt] = useState<number | null>(null);

  const sessionExpiresAt = data?.session?.expiresAt
    ? Date.parse(data.session.expiresAt)
    : null;
  const expiresAt =
    sessionExpiresAt === null
      ? activityExpiresAt
      : activityExpiresAt === null
        ? sessionExpiresAt
        : Math.max(sessionExpiresAt, activityExpiresAt);

  useEffect(() => {
    if (!data?.user) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [data?.user]);

  useEffect(() => {
    if (!data?.user) {
      return;
    }

    const handleSessionActivity = () => {
      setActivityExpiresAt(Date.now() + SESSION_IDLE_TTL_MS);
      setCurrentTime(Date.now());
    };

    const handleSessionUnauthorized = () => {
      if (!logoutMutation.isPending) {
        logoutMutation.mutate();
      }
    };

    window.addEventListener('mini-pay:session-activity', handleSessionActivity);
    window.addEventListener(
      'mini-pay:session-unauthorized',
      handleSessionUnauthorized,
    );

    return () => {
      window.removeEventListener('mini-pay:session-activity', handleSessionActivity);
      window.removeEventListener(
        'mini-pay:session-unauthorized',
        handleSessionUnauthorized,
      );
    };
  }, [data?.user, logoutMutation]);

  useEffect(() => {
    if (!data?.user || expiresAt === null) {
      return;
    }

    if (expiresAt <= currentTime && isProtectedPath(pathname)) {
      logoutMutation.mutate();
    }
  }, [currentTime, data?.user, expiresAt, logoutMutation, pathname]);

  const remainingLabel =
    data?.user && expiresAt !== null
      ? formatRemainingTime(expiresAt - currentTime)
      : null;

  if (!data?.user || !remainingLabel) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/70 bg-card/95 px-4 py-3 shadow-[0_24px_80px_-42px_color-mix(in_oklab,var(--primary)_65%,black)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Clock3 className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] uppercase text-primary">
              Session
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {data.user.name} · {remainingLabel}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="size-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
