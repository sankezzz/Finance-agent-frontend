"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight, Plus } from "lucide-react";

import { PageShell } from "@/components/shared/page-shell";
import { FadeIn, Stagger, StaggerItem } from "@/components/shared/motion";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PersonaCard } from "@/components/dashboard/persona-card";
import { HealthGauge, SubScore } from "@/components/dashboard/health-gauge";
import { KpiTiles } from "@/components/dashboard/kpi-tiles";
import { ChartCard } from "@/components/dashboard/chart-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { SubscriptionsPanel } from "@/components/dashboard/subscriptions-panel";
import { DebtAssetPanel } from "@/components/dashboard/debt-asset-panel";
import { Recommendations } from "@/components/dashboard/recommendations";
import { useDashboard } from "@/lib/query/hooks";
import { useRequireUser } from "@/lib/use-session";
import { ApiError } from "@/lib/api/client";
import { pct, months, inr } from "@/lib/format";

export default function DashboardPage() {
  const { ready, userId } = useRequireUser();
  const dash = useDashboard(userId, ready && !!userId);

  return (
    <PageShell
      width="xl"
      headerRight={
        <Link
          href="/upload"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Plus className="size-4" />
          New analysis
        </Link>
      }
    >
      {!ready || !userId || dash.isLoading ? (
        <DashboardSkeleton />
      ) : dash.isError ? (
        dash.error instanceof ApiError && dash.error.status === 404 ? (
          <EmptyState
            className="mt-10"
            title="No analysis yet"
            description="Upload your documents and run the analysis to see your dashboard."
            action={
              <Link href="/upload" className={cn(buttonVariants())}>
                Upload documents
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        ) : (
          <ErrorState
            className="mt-10"
            title="Couldn't load your dashboard"
            description={
              dash.error instanceof ApiError
                ? dash.error.message
                : "Please try again."
            }
            onRetry={() => dash.refetch()}
          />
        )
      ) : dash.data ? (
        <DashboardContent data={dash.data} />
      ) : null}
    </PageShell>
  );
}

function DashboardContent({
  data,
}: {
  data: NonNullable<ReturnType<typeof useDashboard>["data"]>;
}) {
  const m = data.metrics;

  return (
    <div className="space-y-8">
      {/* Persona + health score */}
      <FadeIn>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PersonaCard persona={data.persona} user={data.user} />
          </div>
          <div className="surface flex flex-col items-center rounded-2xl border border-border/70 p-6">
            <HealthGauge score={m.health_score ?? 0} />
            <div className="mt-6 w-full space-y-4">
              <SubScore label="Savings" value={m.savings_score ?? 0} />
              <SubScore label="Debt" value={m.debt_score ?? 0} />
              <SubScore label="Runway" value={m.runway_score ?? 0} />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* KPI tiles */}
      <FadeIn delay={0.05}>
        <KpiTiles m={m} />
      </FadeIn>

      {/* Secondary metrics strip */}
      <FadeIn delay={0.08}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <MiniStat label="Debt-to-income" value={pct(m.debt_to_income)} />
          <MiniStat
            label="Emergency runway"
            value={months(m.emergency_runway_months)}
          />
          <MiniStat label="Monthly investments" value={inr(m.monthly_investments)} />
          <MiniStat label="Monthly debt" value={inr(m.monthly_debt_payments)} />
        </div>
      </FadeIn>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.05}>
          <ChartCard
            title="Spending trend"
            description="Monthly expenses over time"
            className="h-full"
          >
            <TrendChart trend={m.monthly_trend} />
          </ChartCard>
        </FadeIn>
        <FadeIn delay={0.1}>
          <ChartCard
            title="Category breakdown"
            description="Where your money goes each month"
            className="h-full"
          >
            <CategoryDonut breakdown={m.expense_breakdown} />
          </ChartCard>
        </FadeIn>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.05}>
          <SubscriptionsPanel
            subscriptions={data.subscriptions}
            monthlyTotal={m.subscriptions_monthly ?? 0}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <DebtAssetPanel
            assets={data.assets}
            liabilities={data.liabilities}
            totalAssets={m.total_assets ?? 0}
            totalLiabilities={m.total_liabilities ?? 0}
          />
        </FadeIn>
      </div>

      {/* Recommendations */}
      <FadeIn delay={0.05}>
        <Stagger>
          <Recommendations
            summary={data.recommendations_summary}
            items={data.recommendations}
          />
        </Stagger>
      </FadeIn>

      {/* Chat CTA */}
      <FadeIn delay={0.05}>
        <div className="edge relative overflow-hidden rounded-2xl p-6 text-center sm:p-10">
          <div className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-center">
            <span className="mb-4 grid size-11 place-items-center rounded-full border border-border/70 bg-gradient-to-b from-white/10 to-transparent">
              <MessageSquare className="size-5" />
            </span>
            <h3 className="text-xl font-semibold tracking-tight">
              Chat with your copilot
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Ask anything about your money — grounded in your own data.
            </p>
            <Link
              href="/chat"
              className={cn(buttonVariants({ size: "lg" }), "group mt-6")}
            >
              Start chatting
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
