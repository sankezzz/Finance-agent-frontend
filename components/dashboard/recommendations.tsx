"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { StaggerItem } from "@/components/shared/motion";
import type { Priority, Recommendation } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function PriorityBadge({ priority }: { priority: Priority }) {
  const label =
    priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low";
  return (
    <Badge
      variant={
        priority === "high"
          ? "default"
          : priority === "medium"
            ? "secondary"
            : "outline"
      }
      className={cn(priority === "low" && "text-muted-foreground")}
    >
      {label} priority
    </Badge>
  );
}

function prettyCategory(c: string): string {
  return c.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="surface flex flex-col rounded-xl border border-border/70 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="text-base font-medium">{rec.title}</h4>
        <PriorityBadge priority={rec.priority} />
      </div>
      <p className="text-sm text-muted-foreground">{rec.rationale}</p>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/60 bg-background/40 p-3">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm">{rec.action}</p>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
        {prettyCategory(rec.category)}
      </p>
    </div>
  );
}

export function Recommendations({
  summary,
  items,
  limit = 4,
}: {
  summary?: string;
  items: Recommendation[];
  limit?: number;
}) {
  const sorted = [...(items ?? [])].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
  const top = sorted.slice(0, limit);

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-medium">Recommendations</h3>
        {summary && (
          <p className="mt-1 max-w-2xl text-muted-foreground">{summary}</p>
        )}
      </div>

      {top.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="When the analysis produces advice, your prioritized actions will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {top.map((rec, i) => (
            <StaggerItem key={`${rec.title}-${i}`}>
              <RecommendationCard rec={rec} />
            </StaggerItem>
          ))}
        </div>
      )}
    </div>
  );
}
