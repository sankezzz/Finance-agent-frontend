"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/shared/page-shell";
import { FadeIn } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboard } from "@/lib/query/hooks";
import { ApiError } from "@/lib/api/client";
import type { LoanType, OnboardingRequest } from "@/lib/api/types";

const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "personal", label: "Personal" },
  { value: "auto", label: "Auto" },
  { value: "education", label: "Education" },
  { value: "credit_card", label: "Credit card" },
  { value: "other", label: "Other" },
];

interface LoanRow {
  type: LoanType;
  outstanding: string;
  monthly_emi: string;
}
interface GoalRow {
  name: string;
  target_amount: string;
  target_date: string;
}

const num = (s: string): number => {
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function OnboardingPage() {
  const router = useRouter();
  const onboardMut = useOnboard();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [dependents, setDependents] = useState("0");
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Enter your name.";
    const ageN = num(age);
    if (!age.trim() || ageN <= 0 || ageN > 120) e.age = "Enter a valid age.";
    if (dependents.trim() && num(dependents) < 0)
      e.dependents = "Cannot be negative.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    const body: OnboardingRequest = {
      name: name.trim(),
      age: num(age),
      monthly_income: income.trim() ? num(income) : null,
      dependents: dependents.trim() ? num(dependents) : 0,
      existing_loans: loans
        .filter((l) => num(l.outstanding) > 0 || num(l.monthly_emi) > 0)
        .map((l) => ({
          type: l.type,
          outstanding: num(l.outstanding),
          monthly_emi: num(l.monthly_emi),
        })),
      financial_goals: goals
        .filter((g) => g.name.trim())
        .map((g) => ({
          name: g.name.trim(),
          target_amount: num(g.target_amount),
          target_date: g.target_date.trim() || null,
        })),
    };

    try {
      await onboardMut.mutateAsync(body);
      router.push("/upload");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create your profile."
      );
    }
  }

  return (
    <PageShell width="md">
      <FadeIn>
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Step 1 of 3</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Tell us about yourself
          </h1>
          <p className="mt-2 text-muted-foreground">
            A few basics so your copilot can ground its analysis in your reality.
            Nothing here is shared.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basics */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              error={errors.name}
              className="sm:col-span-2"
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                autoFocus
              />
            </Field>

            <Field label="Age" error={errors.age}>
              <Input
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
              />
            </Field>

            <Field label="Dependents" error={errors.dependents}>
              <Input
                inputMode="numeric"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                placeholder="0"
              />
            </Field>

            <Field
              label="Monthly income"
              hint="Optional · ₹"
              className="sm:col-span-2"
            >
              <Input
                inputMode="numeric"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="97,500"
              />
            </Field>
          </section>

          <Separator />

          {/* Loans */}
          <RowSection
            title="Existing loans"
            description="Add any active loans or EMIs."
            addLabel="Add loan"
            onAdd={() =>
              setLoans((l) => [
                ...l,
                { type: "home", outstanding: "", monthly_emi: "" },
              ])
            }
            empty={loans.length === 0}
            emptyText="No loans added."
          >
            {loans.map((loan, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border/70 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div>
                  <MiniLabel>Type</MiniLabel>
                  <Select
                    value={loan.type}
                    onValueChange={(v) =>
                      setLoans((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, type: v as LoanType } : r
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <MiniLabel>Outstanding ₹</MiniLabel>
                  <Input
                    inputMode="numeric"
                    value={loan.outstanding}
                    onChange={(e) =>
                      setLoans((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, outstanding: e.target.value } : r
                        )
                      )
                    }
                    placeholder="250000"
                  />
                </div>
                <div>
                  <MiniLabel>Monthly EMI ₹</MiniLabel>
                  <Input
                    inputMode="numeric"
                    value={loan.monthly_emi}
                    onChange={(e) =>
                      setLoans((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, monthly_emi: e.target.value } : r
                        )
                      )
                    }
                    placeholder="5893"
                  />
                </div>
                <RemoveButton
                  onClick={() =>
                    setLoans((rows) => rows.filter((_, j) => j !== i))
                  }
                  label="Remove loan"
                />
              </div>
            ))}
          </RowSection>

          <Separator />

          {/* Goals */}
          <RowSection
            title="Financial goals"
            description="Optional. What are you saving toward?"
            addLabel="Add goal"
            onAdd={() =>
              setGoals((g) => [
                ...g,
                { name: "", target_amount: "", target_date: "" },
              ])
            }
            empty={goals.length === 0}
            emptyText="No goals added."
          >
            {goals.map((goal, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border/70 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <div>
                  <MiniLabel>Goal</MiniLabel>
                  <Input
                    value={goal.name}
                    onChange={(e) =>
                      setGoals((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, name: e.target.value } : r
                        )
                      )
                    }
                    placeholder="Car"
                  />
                </div>
                <div>
                  <MiniLabel>Target ₹</MiniLabel>
                  <Input
                    inputMode="numeric"
                    value={goal.target_amount}
                    onChange={(e) =>
                      setGoals((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, target_amount: e.target.value } : r
                        )
                      )
                    }
                    placeholder="1500000"
                  />
                </div>
                <div>
                  <MiniLabel>Target date</MiniLabel>
                  <Input
                    type="date"
                    value={goal.target_date}
                    onChange={(e) =>
                      setGoals((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, target_date: e.target.value } : r
                        )
                      )
                    }
                  />
                </div>
                <RemoveButton
                  onClick={() =>
                    setGoals((rows) => rows.filter((_, j) => j !== i))
                  }
                  label="Remove goal"
                />
              </div>
            ))}
          </RowSection>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={onboardMut.isPending}
              className="group"
            >
              {onboardMut.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating profile…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </FadeIn>
    </PageShell>
  );
}

/* --------------------------- small building blocks --------------------------- */

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <Label>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function RemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center self-end rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <X className="size-4" />
    </button>
  );
}

function RowSection({
  title,
  description,
  addLabel,
  onAdd,
  empty,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>
      {empty ? (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}
