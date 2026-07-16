"use client";

import type { ReactNode } from "react";
import { CountUp } from "@/components/shared/count-up";
import { inr } from "@/lib/format";
import type { Snapshot } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function Tile({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="surface rounded-xl border border-border/70 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {children}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function KpiTiles({ m }: { m: Snapshot }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Tile label="Monthly income">
        <CountUp value={m.monthly_income} format={(n) => inr(n)} />
      </Tile>
      <Tile label="Monthly expenses" hint="Consumption only">
        <CountUp value={m.monthly_expenses} format={(n) => inr(n)} />
      </Tile>
      <Tile label="Savings rate">
        <CountUp
          value={(m.savings_rate ?? 0) * 100}
          format={(n) => `${n.toFixed(0)}%`}
        />
      </Tile>
      <Tile label="Net cash flow">
        <span
          className={cn(m.net_cash_flow < 0 && "text-muted-foreground")}
        >
          <CountUp value={m.net_cash_flow} format={(n) => inr(n)} />
        </span>
      </Tile>
    </div>
  );
}
