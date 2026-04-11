"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Building2, Users, Wrench } from "lucide-react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/react-vchart";

/* ── Types ─────────────────────────────────────────────── */

type MonthlyTrend = {
  period: { period: string; start: string; end: string };
  expected: number;
  collected: number;
  arrears: number;
  occupancyRate: number;
};

type TrendsResponse = {
  monthly?: MonthlyTrend[];
};

type SummaryResponse = {
  totalExpected?: number;
  totalCollected?: number;
  totalArrears?: number;
  collectionRate?: number;
  occupancyRate?: number;
  totalProperties?: number;
  totalUnits?: number;
  totalTenants?: number;
  openTickets?: number;
  [key: string]: unknown;
};

/* ── Formatters ────────────────────────────────────────── */

const formatKES = (amount: number) =>
  `KES ${Number(amount).toLocaleString()}`;

const formatCompact = (amount: number) => {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
  return `KES ${amount.toLocaleString()}`;
};

const formatPct = (rate: number) =>
  `${(rate * (rate < 1 ? 100 : 1)).toFixed(0)}%`;

const currentMonthName = () =>
  new Date().toLocaleString("default", { month: "long", year: "numeric" });

/* ── Component ─────────────────────────────────────────── */

export default function DashboardClient() {
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const toMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const fromMonth = `${from.getUTCFullYear()}-${String(from.getUTCMonth() + 1).padStart(2, "0")}`;

    Promise.all([
      api.dashboard
        .getSummary()
        .then((res) => (!cancelled ? setSummary(res as SummaryResponse) : undefined)),
      api.dashboard
        .getTrends({ from: fromMonth, to: toMonth })
        .then((res) => (!cancelled ? setTrends(res as TrendsResponse) : undefined)),
    ])
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api.dashboard, organizationId]);

  const monthly = trends?.monthly ?? [];
  const collected = summary?.totalCollected ?? 0;
  const expected = summary?.totalExpected ?? 0;
  const arrears = summary?.totalArrears ?? 0;
  const collectionRate = summary?.collectionRate ?? (expected > 0 ? collected / expected : 0);
  const occupancyRate = summary?.occupancyRate ?? 0;

  // Derive month-over-month change from trends
  const prevCollected = monthly.length >= 2 ? monthly[monthly.length - 2].collected : 0;
  const momChange = prevCollected > 0
    ? ((collected - prevCollected) / prevCollected) * 100
    : 0;
  const momPositive = momChange >= 0;

  const chartSpec: IBarChartSpec = {
    type: "bar",
    data: [
      {
        id: "trends",
        values: monthly.flatMap((m) => [
          { month: m.period.period, category: "Expected", value: m.expected },
          { month: m.period.period, category: "Collected", value: m.collected },
        ]),
      },
    ],
    xField: "month",
    yField: "value",
    seriesField: "category",
    padding: { top: 4, bottom: 4, left: 0, right: 0 },
    background: "transparent",
    bar: { style: { cornerRadius: [3, 3, 0, 0] } },
    legends: {
      visible: true,
      orient: "top",
      position: "start",
      padding: { bottom: 8 },
      item: {
        shape: { style: { size: 6 } },
        label: { style: { fontSize: 10, fill: "rgba(245,247,246,0.4)" } },
      },
    },
    axes: [
      {
        orient: "left",
        domainLine: { visible: false },
        grid: { style: { stroke: "rgba(144,180,148,0.06)", lineDash: [] } },
        label: {
          formatMethod: (val: unknown) => formatCompact(Number(val)),
          style: { fontSize: 9, fill: "rgba(245,247,246,0.3)" },
        },
        tick: { visible: false },
      },
      {
        orient: "bottom",
        domainLine: { visible: false },
        grid: { visible: false },
        label: { style: { fontSize: 9, fill: "rgba(245,247,246,0.3)" } },
        tick: { visible: false },
      },
    ],
    tooltip: {
      mark: {
        content: [
          {
            key: (d: { category?: unknown } | undefined) => String(d?.category ?? ""),
            value: (d: { value?: unknown } | undefined) => formatKES(Number(d?.value ?? 0)),
          },
        ],
      },
    },
    color: ["#90B494", "#825D42"],
  };

  const totalProperties = (summary?.totalProperties as number) ?? 0;
  const hasData = summary && (totalProperties > 0 || collected > 0 || expected > 0);

  /* ── Skeleton ──────────────────────────────────────────── */
  if (loading) {
    return (
      <Container className="py-8">
        <div className="space-y-4">
          <div style={{ height: 14, width: 120, borderRadius: 6, background: "rgba(144,180,148,0.06)" }} />
          <div style={{ height: 80, borderRadius: 16, background: "rgba(144,180,148,0.05)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(144,180,148,0.08) 50%, transparent 100%)", animation: "inzu-shimmer 1.6s infinite" }} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 56, borderRadius: 12, background: "rgba(144,180,148,0.04)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(144,180,148,0.06) 50%, transparent 100%)", animation: "inzu-shimmer 1.6s infinite", animationDelay: `${i * 100}ms` }} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  /* ── Main render ───────────────────────────────────────── */
  return (
    <RequireOrganization>
      <Container className="space-y-6 py-8">

        {/* ── Page heading ─────────────────────────────────── */}
        <section
          className={visible ? "inzu-entrance inzu-entrance-1" : ""}
          style={{ opacity: 0 }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
            className="text-muted-foreground"
          >
            Overview
          </p>
        </section>

        {error && (
          <p className="text-destructive text-sm" role="alert">{error}</p>
        )}

        {!error && !hasData && (
          <div
            className={`inzu-empty ${visible ? "inzu-entrance inzu-entrance-2" : ""}`}
            style={{ opacity: 0 }}
          >
            <Building2 size={28} className="text-muted-foreground" style={{ opacity: 0.4 }} />
            <p className="text-sm text-muted-foreground">
              Add your first property to see your dashboard come alive.
            </p>
            <Link
              href="/properties/new"
              className="mt-1 text-xs font-medium text-[#90B494] underline underline-offset-4 hover:text-[#F5F7F6] transition-colors"
            >
              Add a property
            </Link>
          </div>
        )}

        {!error && hasData && (
          <>
            {/* ── Hero: Net Collection ──────────────────────── */}
            <section
              className={`inzu-card rounded-3xl px-7 py-7 ${visible ? "inzu-entrance inzu-entrance-2" : ""}`}
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                {/* Left: KPI */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 400,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                      }}
                      className="text-muted-foreground"
                    >
                      Net Collection
                    </p>
                    <span
                      style={{
                        fontSize: "0.55rem",
                        letterSpacing: "0.06em",
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "rgba(144,180,148,0.08)",
                      }}
                      className="text-muted-foreground"
                    >
                      {currentMonthName()}
                    </span>
                  </div>

                  <p className="inzu-kpi">{formatKES(collected)}</p>

                  {/* MoM indicator */}
                  {prevCollected > 0 && (
                    <div className="flex items-center gap-1.5">
                      {momPositive ? (
                        <ArrowUpRight size={14} style={{ color: "#90B494" }} />
                      ) : (
                        <ArrowDownRight size={14} style={{ color: "#E22026" }} />
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          fontFeatureSettings: '"tnum"',
                          color: momPositive ? "#90B494" : "#E22026",
                        }}
                      >
                        {momPositive ? "+" : ""}
                        {momChange.toFixed(1)}%
                      </span>
                      <span
                        style={{ fontSize: 11, marginLeft: 2 }}
                        className="text-muted-foreground"
                      >
                        vs last month
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: secondary KPIs */}
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <p
                      style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
                      className="text-muted-foreground"
                    >
                      Expected
                    </p>
                    <p
                      style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"' }}
                      className="text-foreground"
                    >
                      {formatKES(expected)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p
                      style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
                      className="text-muted-foreground"
                    >
                      Arrears
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        fontFeatureSettings: '"tnum"',
                        color: arrears > 0 ? "#E22026" : undefined,
                      }}
                      className={arrears > 0 ? "" : "text-foreground"}
                    >
                      {formatKES(arrears)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p
                      style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
                      className="text-muted-foreground"
                    >
                      Collection
                    </p>
                    <p
                      style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"' }}
                      className="text-foreground"
                    >
                      {formatPct(collectionRate)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Secondary row: quick stats + trends chart ── */}
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Occupancy"
                  value={formatPct(occupancyRate)}
                  visible={visible}
                  delay={3}
                />
                <StatCard
                  label="Properties"
                  value={String(summary?.totalProperties ?? 0)}
                  href="/properties"
                  visible={visible}
                  delay={4}
                />
                <StatCard
                  label="Tenants"
                  value={String(summary?.totalTenants ?? 0)}
                  icon={<Users size={14} style={{ opacity: 0.4 }} />}
                  href="/tenants"
                  visible={visible}
                  delay={5}
                />
                <StatCard
                  label="Open Tickets"
                  value={String(summary?.openTickets ?? 0)}
                  icon={<Wrench size={14} style={{ opacity: 0.4 }} />}
                  href="/maintenance"
                  visible={visible}
                  delay={6}
                />
              </div>

              {/* Monthly trends chart */}
              <div
                className={`inzu-card rounded-2xl px-6 py-5 ${visible ? "inzu-entrance inzu-entrance-3" : ""}`}
                style={{ opacity: 0 }}
              >
                <p
                  style={{
                    fontSize: "0.55rem",
                    fontWeight: 400,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                  className="text-muted-foreground"
                >
                  Monthly Trends
                </p>

                {monthly.length > 0 ? (
                  <div style={{ height: 200 }}>
                    <VChart spec={chartSpec} options={{ autoFit: true }} />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <p className="text-sm text-muted-foreground" style={{ opacity: 0.5 }}>
                      No trend data yet
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </Container>
    </RequireOrganization>
  );
}

/* ── Stat card sub-component ─────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  href,
  visible,
  delay,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  href?: string;
  visible: boolean;
  delay: number;
}) {
  const content = (
    <div
      className={`inzu-card rounded-2xl px-5 py-4 ${visible ? `inzu-entrance inzu-entrance-${Math.min(delay, 6)}` : ""}`}
      style={{
        opacity: 0,
        cursor: href ? "pointer" : "default",
        transition: "background 0.18s ease",
      }}
      onMouseEnter={(e) => {
        if (href) e.currentTarget.style.background = "rgba(50, 83, 61, 0.16)";
      }}
      onMouseLeave={(e) => {
        if (href) e.currentTarget.style.background = "";
      }}
    >
      <div className="flex items-center justify-between">
        <p
          style={{
            fontSize: "0.55rem",
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
          className="text-muted-foreground"
        >
          {label}
        </p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          fontFeatureSettings: '"tnum"',
          marginTop: 6,
        }}
        className="text-foreground"
      >
        {value}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}
