"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/shared/count-up";

/** Monochrome radial health-score gauge (0-100). */
export function HealthGauge({
  score,
  size = 208,
}: {
  score: number;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Health score ${Math.round(clamped)} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.99 0 0)" />
            <stop offset="100%" stopColor="oklch(0.62 0 0)" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 0.1)"
          strokeWidth={stroke}
        />
        {/* progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 10px oklch(1 0 0 / 0.25))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <CountUp
            value={clamped}
            decimals={0}
            className="text-5xl font-semibold tracking-tight"
          />
          <span className="ml-1 text-lg text-muted-foreground">/100</span>
        </div>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Health score
        </p>
      </div>
    </div>
  );
}

/** Small labelled 0-100 bar for the sub-scores. */
export function SubScore({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium tabular-nums">
          <CountUp value={clamped} />
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/50"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
