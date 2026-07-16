"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/shared/page-shell";
import { FadeIn } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Pipeline, STAGE_CAPTIONS } from "@/components/processing/pipeline";
import { ErrorState } from "@/components/shared/states";
import { useRun, useCreateRun } from "@/lib/query/hooks";
import { useSession } from "@/lib/use-session";
import { ApiError } from "@/lib/api/client";
import type { Stage, StageState } from "@/lib/api/types";

const ALL_STAGES: Stage[] = ["parse", "categorize", "analyze", "recommend"];

function caption(run: { current_stage: Stage | null; stages: StageState[] } | undefined) {
  if (!run) return "Starting the pipeline…";
  const running = run.stages.find((s) => s.status === "running");
  if (running) return STAGE_CAPTIONS[running.stage];
  if (run.current_stage) return STAGE_CAPTIONS[run.current_stage];
  return "Starting the pipeline…";
}

export default function ProcessingPage() {
  const router = useRouter();
  const session = useSession();
  const createRun = useCreateRun();

  const [runId, setRunId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Resolve the run to poll once storage is readable.
  useEffect(() => {
    if (!session.ready) return;
    if (!session.userId) {
      router.replace("/onboarding");
      return;
    }
    const stored = session.runId;
    if (!stored) {
      router.replace("/upload");
      return;
    }
    setRunId(stored);
  }, [session.ready, session.userId, session.runId, router]);

  const runQuery = useRun(runId);
  const run = runQuery.data;

  const doneCount = run
    ? run.stages.filter((s) => s.status === "done").length
    : 0;

  // Transition to the dashboard shortly after completion.
  useEffect(() => {
    if (run?.status === "done" && !redirecting) {
      setRedirecting(true);
      const t = setTimeout(() => router.replace("/dashboard"), 1100);
      return () => clearTimeout(t);
    }
  }, [run?.status, redirecting, router]);

  async function retry() {
    if (!session.userId) return;
    try {
      const fresh = await createRun.mutateAsync({ user_id: session.userId });
      session.setRunId(fresh.id);
      setRunId(fresh.id);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not restart the analysis."
      );
    }
  }

  const failed = run?.status === "failed" || runQuery.isError;

  return (
    <PageShell width="lg">
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        {failed ? (
          <FadeIn className="w-full max-w-md">
            <ErrorState
              title="The analysis stopped"
              description={
                run?.error ??
                (runQuery.error instanceof ApiError
                  ? runQuery.error.message
                  : "Something interrupted the pipeline. You can try again.")
              }
              onRetry={retry}
            />
          </FadeIn>
        ) : (
          <>
            <FadeIn className="mb-2 text-center">
              <p className="text-sm text-muted-foreground">Step 3 of 3</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Analyzing your finances
              </h1>
            </FadeIn>

            {/* Caption */}
            <div className="mb-12 h-6 text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={caption(run)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35 }}
                  className="text-muted-foreground"
                >
                  {run?.status === "done"
                    ? "All done — building your dashboard…"
                    : caption(run)}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Pipeline */}
            <div className="w-full max-w-3xl">
              <Pipeline
                stages={
                  run?.stages ??
                  ALL_STAGES.map((stage) => ({
                    stage,
                    status: "pending" as const,
                    error: null,
                  }))
                }
              />
            </div>

            {/* Progress meter */}
            <div className="mt-14 w-full max-w-xs">
              <div className="h-1 overflow-hidden rounded-full bg-border/60">
                <motion.div
                  className="h-full bg-foreground/70"
                  animate={{ width: `${(doneCount / ALL_STAGES.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                {run?.status !== "done" && (
                  <Loader2 className="size-3 animate-spin" />
                )}
                {doneCount} of {ALL_STAGES.length} stages complete
              </p>
            </div>

            {redirecting && (
              <FadeIn delay={0.2} className="mt-8">
                <Button variant="ghost" onClick={() => router.replace("/dashboard")}>
                  Go to dashboard now
                </Button>
              </FadeIn>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
