// Display formatting. Currency is INR (₹); percentages arrive as fractions.

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** ₹1,23,456 — rounded to whole rupees. Null-safe. */
export function inr(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return inrFormatter.format(value);
}

/** ₹1.2L — compact for tight tiles. Null-safe. */
export function inrShort(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return inrCompact.format(value);
}

/** Fraction (0.42) → "42%". Null-safe. */
export function pct(fraction: number | null | undefined, digits = 0): string {
  if (fraction == null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Plain number with grouping. Null-safe. */
export function num(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

/** "2025-04" → "Apr". For chart axes. */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short" });
}

/** "2025-04-01" → "Apr 2025". Null-safe. */
export function dateLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

/** Round runway months to 1 decimal. Null-safe → "—". */
export function months(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} mo`;
}
