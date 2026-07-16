import Link from "next/link";
import { cn } from "@/lib/utils";

/** Restrained monochrome wordmark. */
export function Brand({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium tracking-tight text-foreground/90 transition-opacity hover:opacity-70",
        className
      )}
    >
      <span
        aria-hidden
        className="grid size-6 place-items-center rounded-md border border-white/15 bg-gradient-to-b from-white/10 to-transparent text-[11px] font-mono"
      >
        ₹
      </span>
      Finance&nbsp;Agent
    </Link>
  );
}
