"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Brand } from "@/components/shared/brand";
import { FadeIn } from "@/components/shared/motion";
import { useSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

const STAGES = ["Parse", "Categorize", "Analyze", "Recommend"];

export default function Home() {
  const { ready, userId } = useSession();

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* faint radial glow behind hero */}
      <div
        aria-hidden
        className="glow-radial pointer-events-none absolute inset-0 -z-10"
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand href="/" />
        {ready && userId && (
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-24 text-center sm:px-8">
        {/* <FadeIn>
          <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
            Personal Finance Copilot
          </span>
        </FadeIn> */}

        <FadeIn delay={0.08}>
          <h1 className="text-gradient mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Understand your money,
            <br />
            effortlessly.
          </h1>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-base text-muted-foreground sm:text-lg">
            Upload your financial documents and watch a team of AI agents read,
            categorize, and analyze them — then land on a dashboard built around
            you.
          </p>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={userId ? "/dashboard" : "/onboarding"}
              className={cn(buttonVariants({ size: "lg" }), "group")}
            >
              {userId ? "Continue" : "Get started"}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            {ready && userId && (
              <Link
                href="/upload"
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
              >
                Upload documents
              </Link>
            )}
          </div>
        </FadeIn>

        {/* quiet pipeline motif */}
        <FadeIn delay={0.34} className="mt-16">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:gap-3">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-md border border-border/70 bg-card/40 px-2.5 py-1 font-mono">
                  {s}
                </span>
                {i < STAGES.length - 1 && (
                  <span aria-hidden className="text-border">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
