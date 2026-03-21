import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type AuthHighlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type AuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  highlights: AuthHighlight[];
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  highlights,
  children,
}: AuthShellProps) {
  return (
    <main className="relative overflow-hidden px-6 py-10 md:px-10 md:py-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_38%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[34px] border border-white/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_95%,white)_0%,color-mix(in_oklab,var(--primary)_78%,black)_100%)] px-7 py-8 text-white shadow-[0_36px_100px_-50px_color-mix(in_oklab,var(--primary)_80%,black)] md:px-10 md:py-12">
          <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,white_16%,transparent),transparent_62%)]" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] uppercase text-white/80">
              {eyebrow}
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight text-balance md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/72 md:text-lg">
              {description}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description: itemDescription }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white/12">
                    <Icon className="size-5 text-white" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {itemDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">{children}</section>
      </div>
    </main>
  );
}
