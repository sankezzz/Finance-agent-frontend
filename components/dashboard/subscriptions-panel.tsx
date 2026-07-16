"use client";

import { RefreshCw } from "lucide-react";
import { ChartCard } from "./chart-card";
import { EmptyState } from "@/components/shared/states";
import { inr } from "@/lib/format";
import type { SubscriptionItem } from "@/lib/api/types";

export function SubscriptionsPanel({
  subscriptions,
  monthlyTotal,
}: {
  subscriptions: SubscriptionItem[];
  monthlyTotal: number;
}) {
  const items = subscriptions ?? [];
  return (
    <ChartCard
      title="Subscriptions"
      description={
        items.length > 0
          ? `${items.length} recurring · ${inr(monthlyTotal)}/mo`
          : "Recurring payments we detected"
      }
    >
      {items.length === 0 ? (
        <EmptyState
          className="py-10"
          icon={<RefreshCw className="size-5" />}
          title="No subscriptions found"
          description="No recurring payments were detected in your statements."
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((s, i) => (
            <li
              key={`${s.merchant}-${i}`}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium capitalize">
                  {s.merchant.toLowerCase()}
                </p>
                <p className="text-xs text-muted-foreground">{s.category}</p>
              </div>
              <span className="shrink-0 text-sm tabular-nums">
                {inr(s.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
