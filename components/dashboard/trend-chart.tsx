"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/shared/states";
import { inr, inrShort, monthLabel } from "@/lib/format";
import type { TrendPoint } from "@/lib/api/types";

interface Datum {
  month: string;
  label: string;
  expenses: number;
}

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Datum }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-muted-foreground">{d.label}</p>
      <p className="mt-0.5 font-medium tabular-nums">{inr(d.expenses)}</p>
    </div>
  );
}

/** Spending trend — a single, quiet expenses line. */
export function TrendChart({ trend }: { trend: TrendPoint[] }) {
  const data: Datum[] = (trend ?? []).map((t) => ({
    month: t.month,
    label: monthLabel(t.month),
    expenses: t.expenses ?? 0,
  }));

  if (data.length === 0) {
    return (
      <EmptyState
        title="No trend yet"
        description="We need at least one month of statements to plot your spending over time."
      />
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="oklch(1 0 0)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="oklch(1 0 0 / 0.08)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "oklch(0.708 0 0)", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "oklch(0.708 0 0)", fontSize: 12 }}
            tickFormatter={(v) => inrShort(v)}
          />
          <Tooltip
            content={<TooltipBox />}
            cursor={{ stroke: "oklch(1 0 0 / 0.2)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="oklch(0.98 0 0)"
            strokeWidth={2}
            fill="url(#trend-fill)"
            dot={{ r: 2.5, fill: "oklch(0.98 0 0)", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "oklch(1 0 0)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
