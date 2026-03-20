"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button } from "@/shared/ui/button";

export function MainErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const message =
    error instanceof Error
      ? error.message
      : "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">오류가 발생했습니다</p>
          <h2 className="text-xl font-semibold">화면을 불러오지 못했습니다.</h2>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={resetErrorBoundary}>다시 시도</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      </div>
    </div>
  );
}
