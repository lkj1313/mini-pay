"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-xl border border-input/80 bg-background/90 px-4 py-3 text-sm text-foreground shadow-[0_1px_2px_0_color-mix(in_oklab,var(--primary)_6%,transparent)] transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/90 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-ring/18 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/16",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
