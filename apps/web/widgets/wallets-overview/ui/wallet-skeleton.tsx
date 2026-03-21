import { Card, CardContent, CardHeader } from '@/shared/ui/card';

export function WalletSkeleton() {
  return (
    <Card className="rounded-[28px] border-white/70 bg-card/94">
      <CardHeader className="space-y-4 pb-4">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-44 animate-pulse rounded-2xl bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded-full bg-muted" />
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-border/70 pt-5">
        <div className="h-5 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-full animate-pulse rounded-full bg-muted" />
      </CardContent>
    </Card>
  );
}
