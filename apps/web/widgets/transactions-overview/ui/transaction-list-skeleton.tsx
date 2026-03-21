import { Card, CardContent } from '@/shared/ui/card';

export function TransactionListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="rounded-[24px] border-white/70 bg-card/94"
        >
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="size-12 animate-pulse rounded-2xl bg-muted" />
              <div className="space-y-3">
                <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-56 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-44 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
            <div className="space-y-3 md:text-right">
              <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded-full bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
