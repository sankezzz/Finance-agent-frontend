"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Persona, User } from "@/lib/api/types";

/**
 * Persona is the emotional hook of the dashboard. `persona` is null today
 * (reserved in the API), so we render a graceful placeholder and swap in the
 * real archetype the moment it's non-null — no other changes needed.
 */
export function PersonaCard({
  persona,
  user,
}: {
  persona: Persona | null;
  user: User;
}) {
  if (persona) {
    return (
      <div className="edge relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="glow-radial pointer-events-none absolute inset-0" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3.5" />
            Your financial persona
          </div>
          <h2 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
            {persona.title}
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
            {persona.description}
          </p>
          {persona.traits?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {persona.traits.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Placeholder — the dashboard is designed around this slot.
  const first = user.name?.split(" ")[0] || "there";
  return (
    <div className="edge relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <div className="glow-radial pointer-events-none absolute inset-0" />
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5" />
          Your financial persona
        </div>
        <h2 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
          Hello, {first}
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
          Your personalized financial personality is on its way. Soon this space
          will describe your money archetype — a title, a short story, and the
          traits that define how you spend, save, and grow.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Coming soon"].map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="border-dashed text-muted-foreground"
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
