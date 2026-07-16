import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";

/** Centered page container with a quiet header row. */
export function PageShell({
  children,
  className,
  headerRight,
  width = "md",
}: {
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}) {
  const max = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  }[width];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        {headerRight}
      </header>
      <main
        className={cn(
          "mx-auto w-full flex-1 px-5 pb-24 pt-4 sm:px-8",
          max,
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
