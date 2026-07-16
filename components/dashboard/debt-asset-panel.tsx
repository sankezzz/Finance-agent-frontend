"use client";

import { PiggyBank, Landmark } from "lucide-react";
import { ChartCard } from "./chart-card";
import { inr, num } from "@/lib/format";
import type { FinancialFact } from "@/lib/api/types";

function prettyLabel(f: FinancialFact): string {
  if (f.label) return f.label;
  return f.subtype
    ? f.subtype.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Item";
}

function Column({
  icon,
  heading,
  total,
  facts,
  emptyText,
}: {
  icon: React.ReactNode;
  heading: string;
  total: number;
  facts: FinancialFact[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md border border-border/70 text-muted-foreground">
            {icon}
          </span>
          <span className="text-sm text-muted-foreground">{heading}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums">{inr(total)}</span>
      </div>
      {facts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/60 px-3 py-5 text-center text-xs text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {facts.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm">{prettyLabel(f)}</span>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {inr(f.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DebtAssetPanel({
  assets,
  liabilities,
  totalAssets,
  totalLiabilities,
}: {
  assets: FinancialFact[];
  liabilities: FinancialFact[];
  totalAssets: number;
  totalLiabilities: number;
}) {
  const netWorth = totalAssets - totalLiabilities;
  return (
    <ChartCard
      title="Assets & liabilities"
      description={`Net worth ${inr(netWorth)}`}
      action={
        <span className="text-right text-xs text-muted-foreground">
          {num((assets?.length ?? 0) + (liabilities?.length ?? 0))} items
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Column
          icon={<PiggyBank className="size-4" />}
          heading="Assets"
          total={totalAssets}
          facts={assets ?? []}
          emptyText="No assets detected."
        />
        <Column
          icon={<Landmark className="size-4" />}
          heading="Liabilities"
          total={totalLiabilities}
          facts={liabilities ?? []}
          emptyText="No liabilities detected."
        />
      </div>
    </ChartCard>
  );
}
