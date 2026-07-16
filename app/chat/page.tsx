"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

import { PageShell } from "@/components/shared/page-shell";
import { FadeIn } from "@/components/shared/motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SAMPLE_QUESTIONS = [
  "How much do I spend on food?",
  "Can I afford a ₹15L car?",
  "How long will my emergency fund last?",
  "Where can I cut back this month?",
];

export default function ChatPage() {
  return (
    <PageShell
      width="lg"
      headerRight={
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
      }
    >
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FadeIn>
          <span className="mb-5 grid size-12 place-items-center rounded-full border border-border/70 bg-gradient-to-b from-white/10 to-transparent">
            <MessageSquare className="size-5" />
          </span>
        </FadeIn>

        <FadeIn delay={0.06}>
          <Badge
            variant="outline"
            className="mb-4 border-dashed text-muted-foreground"
          >
            Coming soon
          </Badge>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
            Your copilot is almost ready
          </h1>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Soon you&apos;ll be able to ask questions about your own money and
            get streamed, grounded answers — right here.
          </p>
        </FadeIn>

        <FadeIn delay={0.22} className="mt-8 w-full max-w-md">
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <span
                key={q}
                className="rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground"
              >
                {q}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* Inert composer preview */}
        <FadeIn delay={0.28} className="mt-10 w-full max-w-md">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 p-2 opacity-60">
            <Input
              disabled
              placeholder="Ask your copilot…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button size="icon" disabled aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Chat launches in phase 2.
          </p>
        </FadeIn>
      </div>
    </PageShell>
  );
}
