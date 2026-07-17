"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Brand } from "@/components/shared/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useChat, useDashboard } from "@/lib/query/hooks";
import { useRequireUser } from "@/lib/use-session";
import { ApiError } from "@/lib/api/client";
import type { ChatMessage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How much do I spend on food?",
  "How's my emergency fund?",
  "Where can I cut back this month?",
  "Can I afford a ₹15L car?",
];

// Server forwards the last 20; cap what we send to keep payloads sane.
const MAX_HISTORY = 40;

export default function ChatPage() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between px-5 py-5 sm:px-8">
        <Brand href="/" />
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
      </header>
      <Suspense fallback={<ChatSkeleton />}>
        <ChatGate />
      </Suspense>
    </div>
  );
}

function ChatGate() {
  const { ready, userId } = useRequireUser();
  const dash = useDashboard(userId, ready && !!userId);

  if (!ready || !userId || dash.isLoading) return <ChatSkeleton />;

  if (dash.isError) {
    const notReady =
      dash.error instanceof ApiError && dash.error.status === 404;
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 sm:px-8">
        {notReady ? (
          <EmptyState
            className="w-full"
            title="No analysis to chat about yet"
            description="Your copilot answers from your analyzed data. Upload your documents and run the analysis first."
            action={
              <Link href="/upload" className={cn(buttonVariants())}>
                Upload documents
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        ) : (
          <ErrorState
            className="w-full"
            title="Couldn't load your data"
            description={
              dash.error instanceof ApiError
                ? dash.error.message
                : "Please try again."
            }
            onRetry={() => dash.refetch()}
          />
        )}
      </main>
    );
  }

  const firstName = dash.data?.user.name?.split(" ")[0] || "there";
  return <ChatConversation userId={userId} firstName={firstName} />;
}

function ChatConversation({
  userId,
  firstName,
}: {
  userId: string;
  firstName: string;
}) {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [errored, setErrored] = useState(false);
  const chat = useChat();
  const started = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isSending = chat.isPending;

  async function ask(history: ChatMessage[]) {
    setErrored(false);
    try {
      const reply = await chat.mutateAsync({
        user_id: userId,
        messages: history.slice(-MAX_HISTORY),
      });
      setMessages([...history, { role: "assistant", content: reply.content }]);
    } catch (err) {
      setErrored(true);
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach your copilot. Please try again."
      );
    }
  }

  function submit(text: string) {
    const content = text.trim();
    if (!content || isSending) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");
    void ask(history);
  }

  // Fire the deep-linked question from the persona card (?q=…) once.
  useEffect(() => {
    if (initialQ && !started.current) {
      started.current = true;
      submit(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  // Keep the latest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const empty = messages.length === 0 && !isSending;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-5 sm:px-8">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-5 grid size-12 place-items-center rounded-full border border-border/70 bg-gradient-to-b from-white/10 to-transparent">
              <Sparkles className="size-5" />
            </span>
            <h1 className="text-gradient font-display text-3xl font-normal tracking-tight sm:text-4xl">
              Hi {firstName}, ask me anything
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              I&apos;m grounded in your analyzed data — spending, savings, debt,
              subscriptions and more.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submit(q)}
                  className="rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {isSending && <TypingBubble />}
            {errored && !isSending && (
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => ask(messages)}
                >
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border/60 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your money…"
            autoFocus
            disabled={isSending}
            className="h-11"
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0"
            disabled={isSending || !input.trim()}
            aria-label="Send"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Grounded in your data · history isn&apos;t saved after you leave
        </p>
      </div>
    </main>
  );
}

function Bubble({ role, content }: ChatMessage) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%]",
          isUser
            ? "rounded-br-sm bg-foreground text-background"
            : "rounded-bl-sm border border-border/70 bg-card/60 text-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border/70 bg-card/60 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <div className="flex-1 space-y-4 py-6">
        <Skeleton className="ml-auto h-10 w-52 rounded-2xl" />
        <Skeleton className="h-16 w-72 rounded-2xl" />
        <Skeleton className="ml-auto h-10 w-40 rounded-2xl" />
      </div>
      <Skeleton className="mb-6 h-11 w-full rounded-lg" />
    </main>
  );
}
