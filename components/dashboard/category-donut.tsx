"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState } from "@/components/shared/states";
import { inr } from "@/lib/format";

// Monochrome slice palette (light → dark). Cycled if there are more slices.
const SHADES = [
  "oklch(0.97 0 0)",
  "oklch(0.87 0 0)",
  "oklch(0.75 0 0)",
  "oklch(0.63 0 0)",
  "oklch(0.52 0 0)",
  "oklch(0.42 0 0)",
  "oklch(0.34 0 0)",
  "oklch(0.28 0 0)",
];

interface Slice {
  name: string;
  value: number;
  color: string;
}

function TooltipBox({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: Slice }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const share = total > 0 ? Math.round((d.value / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="flex items-center gap-2">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ background: d.color }}
        />
        {d.name}
      </p>
      <p className="mt-0.5 font-medium tabular-nums">
        {inr(d.value)} · {share}%
      </p>
    </div>
  );
}

/** Category breakdown — monochrome donut + legend. */
export function CategoryDonut({
  breakdown,
}: {
  breakdown: Record<string, number>;
}) {
  const entries = Object.entries(breakdown ?? {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No categories yet"
        description="Once your transactions are categorized they'll break down here."
      />
    );
  }

  const slices: Slice[] = entries.map(([name, value], i) => ({
    name,
    value,
    color: SHADES[i % SHADES.length],
  }));
  const total = slices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {slices.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip content={<TooltipBox total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total / mo</span>
          <span className="text-lg font-semibold tabular-nums">
            {inr(total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="truncate text-sm">{s.name}</span>
            </span>
            <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
              {inr(s.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
