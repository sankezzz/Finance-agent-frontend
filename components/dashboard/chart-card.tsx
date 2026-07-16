import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent framed container for a chart or panel. */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "surface flex flex-col rounded-2xl border border-border/70 p-5 sm:p-6",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}
