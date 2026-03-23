"use client";

import { useEffect, useState } from "react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/react-vchart";

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

type SummaryResponse = Record<string, unknown>;

const formatKES = (amount: number) =>
  `KES ${Number(amount).toLocaleString()}`;

const formatPct = (rate: number) =>
  `${(rate * 100).toFixed(0)}%`;

const CURRENCY_KEYS = new Set([
  "expected", "collected", "arrears", "totalExpected", "totalCollected",
  "totalArrears", "amount", "rent", "monthlyRent", "balance",
  "totalRent", "revenue", "income",
]);

const PERCENT_KEYS = new Set([
  "occupancyRate", "collectionRate", "occupancy", "rate",
]);

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
    const fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const toMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const fromMonth = `${fromDate.getUTCFullYear()}-${String(fromDate.getUTCMonth() + 1).padStart(2, "0")}`;

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

  const formatLabel = (raw: string) =>
    raw.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();

  const formatValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") {
      if (CURRENCY_KEYS.has(key)) return formatKES(value);
      if (PERCENT_KEYS.has(key)) return formatPct(value);
      return value.toLocaleString();
    }
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return `${value.length} items`;
    return "—";
  };

  const extractMetrics = (data: Record<string, unknown> | null) => {
    if (!data) return { primary: null as null | [string, unknown], rest: [] as [string, unknown][] };
    const entries = Object.entries(data);
    const numericEntries = entries.filter(
      ([, value]) => typeof value === "number",
    ) as [string, number][];

    if (numericEntries.length === 0) {
      return { primary: (entries[0] as [string, unknown]) ?? null, rest: entries.slice(1) };
    }

    const [primary, ...restNumeric] = numericEntries;
    const numericKeys = new Set(restNumeric.map(([key]) => key).concat(primary[0]));
    const rest = entries.filter(([key]) => !numericKeys.has(key));

    return { primary, rest: [...restNumeric, ...rest] };
  };

  const { primary, rest } = extractMetrics(summary);
  const monthly = trends?.monthly ?? [];

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
    padding: { top: 8, bottom: 8, left: 0, right: 0 },
    background: "transparent",
    bar: { style: { cornerRadius: [4, 4, 0, 0] } },
    legends: {
      visible: true,
      orient: "top",
      padding: { bottom: 12 },
      item: { label: { style: { fontSize: 11, fill: "rgba(245,247,246,0.5)" } } },
    },
    axes: [
      {
        orient: "left",
        domainLine: { visible: false },
        grid: { style: { stroke: "rgba(144,180,148,0.08)", lineDash: [] } },
        label: {
          formatMethod: (val: unknown) => `KES ${Number(val).toLocaleString()}`,
          style: { fontSize: 9, fill: "rgba(245,247,246,0.35)" },
        },
        tick: { visible: false },
      },
      {
        orient: "bottom",
        domainLine: { visible: false },
        grid: { visible: false },
        label: { style: { fontSize: 9, fill: "rgba(245,247,246,0.35)" } },
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
    color: ["#2D4B3E", "#90B494"],
  };

  // Skeleton shimmer bars
  if (loading) {
    return (
      <Container className="py-8">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: i === 1 ? 72 : 20,
                borderRadius: 12,
                background: "rgba(144,180,148,0.06)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(144,180,148,0.10) 50%, transparent 100%)",
                  animation: "inzu-shimmer 1.6s infinite",
                }}
              />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <RequireOrganization>
      <Container className="space-y-8 py-8">
        {/* Page label */}
        <section
          className={visible ? "inzu-entrance inzu-entrance-1" : ""}
          style={{ opacity: 0 }}
        >
          <p
            style={{
              fontSize: "0.62rem",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(245,247,246,0.35)",
            }}
            className="text-muted-foreground"
          >
            Overview
          </p>
        </section>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        {!error && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">

            {/* ── Primary truth panel ────────────────────────────── */}
            <div
              className={`inzu-card rounded-3xl px-7 py-6 space-y-6 ${visible ? "inzu-entrance inzu-entrance-2" : ""}`}
              style={{ opacity: 0 }}
            >
              <div className="space-y-3">
                <p
                  style={{
                    fontSize: "0.60rem",
                    fontWeight: 400,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                  }}
                  className="text-muted-foreground"
                >
                  Net Collection
                </p>
                {primary ? (
                  <>
                    <p
                      style={{
                        fontSize: "0.60rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                      }}
                      className="text-muted-foreground"
                    >
                      {formatLabel(primary[0])}
                    </p>
                    {/* Single truth — the KPI number */}
                    <p className="inzu-kpi">
                      {formatValue(primary[0], primary[1])}
                    </p>
                  </>
                ) : (
                  <div className="inzu-empty">
                    <p className="text-sm text-muted-foreground">No data yet</p>
                    <button className="mt-1 text-xs font-medium text-[#90B494] underline underline-offset-4">
                      Add a property to begin
                    </button>
                  </div>
                )}
              </div>

              {/* Supporting metrics — weight contrast, no grid lines */}
              {rest.length > 0 && (
                <dl
                  style={{ paddingTop: "20px", borderTop: "1px solid rgba(144,180,148,0.08)" }}
                  className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3"
                >
                  {rest.slice(0, 6).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`space-y-1 ${visible ? `inzu-entrance inzu-entrance-${Math.min(i + 3, 6)}` : ""}`}
                      style={{ opacity: 0 }}
                    >
                      <dt
                        style={{
                          fontSize: "0.60rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                        }}
                        className="text-muted-foreground"
                      >
                        {formatLabel(key)}
                      </dt>
                      <dd
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          fontFeatureSettings: '"tnum"',
                        }}
                        className="text-foreground"
                      >
                        {formatValue(key, value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* ── Monthly trends panel ───────────────────────────── */}
            <div
              className={`inzu-card rounded-3xl px-7 py-6 space-y-5 ${visible ? "inzu-entrance inzu-entrance-3" : ""}`}
              style={{ opacity: 0 }}
            >
              <p
                style={{
                  fontSize: "0.60rem",
                  fontWeight: 400,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                }}
                className="text-muted-foreground"
              >
                Monthly trends
              </p>

              {monthly.length > 0 ? (
                <>
                  {/* Chart — floats in bg, no fill */}
                  <div className="h-52">
                    <VChart spec={chartSpec} options={{ autoFit: true }} />
                  </div>

                  {/* Row list — no grid lines, hover breath */}
                  <div>
                    {monthly.map((m) => (
                      <div
                        key={m.period.period}
                        className="inzu-row flex items-center justify-between px-2 py-3 text-xs"
                        style={{ paddingTop: 14, paddingBottom: 14 }}
                      >
                        <span
                          style={{ fontWeight: 500, letterSpacing: "0.02em" }}
                          className="text-muted-foreground"
                        >
                          {m.period.period}
                        </span>
                        <div
                          className="flex gap-5 tabular-nums"
                          style={{ fontFeatureSettings: '"tnum"' }}
                        >
                          <span className="text-muted-foreground">
                            <span style={{ opacity: 0.45, marginRight: 4 }}>Exp</span>
                            {formatKES(m.expected)}
                          </span>
                          <span style={{ color: "#90B494", fontWeight: 500 }}>
                            <span style={{ opacity: 0.55, marginRight: 4, fontWeight: 400 }}>Col</span>
                            {formatKES(m.collected)}
                          </span>
                          {m.arrears > 0 && (
                            <span className="status-overdue">
                              {formatKES(m.arrears)}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            <span style={{ opacity: 0.45, marginRight: 4 }}>Occ</span>
                            {formatPct(m.occupancyRate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="inzu-empty">
                  <p className="text-sm text-muted-foreground">No trends data yet</p>
                </div>
              )}
            </div>
          </section>
        )}
      </Container>
    </RequireOrganization>
  );
}
