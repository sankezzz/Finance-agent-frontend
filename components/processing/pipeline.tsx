"use client";

import { motion } from "framer-motion";
import {
  ScanLine,
  Tags,
  Calculator,
  Lightbulb,
  Check,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { Stage, StageState, StageStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface StageMeta {
  stage: Stage;
  label: string;
  icon: LucideIcon;
}

const STAGE_META: StageMeta[] = [
  { stage: "parse", label: "Parse", icon: ScanLine },
  { stage: "categorize", label: "Categorize", icon: Tags },
  { stage: "analyze", label: "Analyze", icon: Calculator },
  { stage: "recommend", label: "Recommend", icon: Lightbulb },
];

export const STAGE_CAPTIONS: Record<Stage, string> = {
  parse: "Reading your statements…",
  categorize: "Understanding your spending…",
  analyze: "Crunching the numbers…",
  recommend: "Writing your recommendations…",
};

function statusFor(stages: StageState[], stage: Stage): StageStatus {
  return stages.find((s) => s.stage === stage)?.status ?? "pending";
}

function Node({
  meta,
  status,
  index,
}: {
  meta: StageMeta;
  status: StageStatus;
  index: number;
}) {
  const Icon = meta.icon;
  const done = status === "done";
  const running = status === "running";
  const failed = status === "failed";

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div className="relative">
        {/* soft glow ring while running */}
        {running && (
          <span
            aria-hidden
            className="animate-node-pulse absolute inset-0 rounded-2xl"
          />
        )}
        <div
          className={cn(
            "relative grid size-16 place-items-center rounded-2xl border transition-all duration-500 sm:size-20",
            done && "border-foreground/40 bg-foreground/[0.06]",
            running &&
              "border-foreground/60 bg-gradient-to-b from-white/12 to-transparent",
            failed && "border-destructive/60 bg-card",
            !done &&
              !running &&
              !failed &&
              "border-border/60 bg-card/30 opacity-45"
          )}
        >
          <AnimatedIcon
            done={done}
            failed={failed}
            running={running}
            Icon={Icon}
          />
        </div>
      </div>
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-medium transition-colors",
            done || running ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {meta.label}
        </p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
          {failed ? "failed" : status}
        </p>
      </div>
    </motion.div>
  );
}

function AnimatedIcon({
  done,
  failed,
  running,
  Icon,
}: {
  done: boolean;
  failed: boolean;
  running: boolean;
  Icon: LucideIcon;
}) {
  if (failed)
    return <AlertTriangle className="size-6 text-destructive sm:size-7" />;
  if (done)
    return (
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Check className="size-6 text-foreground sm:size-7" />
      </motion.span>
    );
  return (
    <Icon
      className={cn(
        "size-6 transition-colors sm:size-7",
        running ? "text-foreground" : "text-muted-foreground"
      )}
    />
  );
}

/** Connector with a light pulse that travels once the source stage is done. */
function Connector({
  active,
  vertical,
}: {
  active: boolean;
  vertical: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        vertical ? "my-1 h-8 w-px" : "mx-1 h-px flex-1"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          active ? "bg-foreground/30" : "bg-border/60"
        )}
      />
      {active && (
        <span
          aria-hidden
          className={cn(
            "absolute bg-foreground",
            vertical
              ? "left-0 h-4 w-px"
              : "top-0 h-px w-6",
          )}
          style={{
            animation: `${
              vertical ? "connector-flow-v" : "connector-flow"
            } 1.4s ease-in-out infinite`,
          }}
        />
      )}
    </div>
  );
}

export function Pipeline({ stages }: { stages: StageState[] }) {
  return (
    <>
      {/* Vertical keyframe injected once (paired with the horizontal one in globals). */}
      <style>{`@keyframes connector-flow-v {0%{transform:translateY(-100%);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(100%);opacity:0}}`}</style>

      {/* Horizontal (sm and up) */}
      <div className="hidden items-center justify-center sm:flex">
        {STAGE_META.map((meta, i) => {
          const status = statusFor(stages, meta.stage);
          return (
            <div key={meta.stage} className="flex flex-1 items-center last:flex-none">
              <Node meta={meta} status={status} index={i} />
              {i < STAGE_META.length - 1 && (
                <Connector active={status === "done"} vertical={false} />
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical (mobile) */}
      <div className="flex flex-col items-center sm:hidden">
        {STAGE_META.map((meta, i) => {
          const status = statusFor(stages, meta.stage);
          return (
            <div key={meta.stage} className="flex flex-col items-center">
              <Node meta={meta} status={status} index={i} />
              {i < STAGE_META.length - 1 && (
                <Connector active={status === "done"} vertical />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
