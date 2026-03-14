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
    const toMonth = `${now.getUTCFullYear()}-${String(
      now.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const fromMonth = `${fromDate.getUTCFullYear()}-${String(
      fromDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

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
    raw
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim();

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
      return {
        primary: (entries[0] as [string, unknown]) ?? null,
        rest: entries.slice(1),
      };
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
    bar: { style: { cornerRadius: [4, 4, 0, 0] } },
    legends: { visible: true, orient: "top", padding: { bottom: 12 } },
    axes: [
      {
        orient: "left",
        label: {
          formatMethod: (val: unknown) =>
            `KES ${Number(val).toLocaleString()}`,
          style: { fontSize: 10 },
        },
      },
      {
        orient: "bottom",
        label: { style: { fontSize: 10 } },
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
    color: ["hsl(221,83%,53%)", "hsl(142,71%,45%)"],
  };

  return (
    <RequireOrganization>
      <Container className="space-y-8 py-8">
        <section className="space-y-2">
          <p className="text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground">
            Overview
          </p>
          <p className="max-w-xl text-sm text-muted-foreground">
            One primary truth about your portfolio, with supporting signals in
            the background.
          </p>
        </section>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        )}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
            {/* Summary panel */}
            <div className="space-y-6 rounded-3xl bg-card/80 px-6 py-5 shadow-none backdrop-blur-sm">
              <div className="space-y-2">
                <p className="text-[0.68rem] font-normal uppercase tracking-[0.25em] text-muted-foreground">
                  Primary truth
                </p>
                {primary ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {formatLabel(primary[0])}
                    </p>
                    <p className="mt-1 text-5xl font-semibold tracking-[-0.02em] tabular-nums">
                      {formatValue(primary[0], primary[1])}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No primary metric available yet.
                  </p>
                )}
              </div>

              {rest.length > 0 && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
                  {rest.slice(0, 6).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {formatLabel(key)}
                      </dt>
                      <dd className="font-normal">
                        {formatValue(key, value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Trends panel */}
            <div className="space-y-4 rounded-3xl bg-card/70 px-6 py-5 shadow-none">
              <p className="text-[0.68rem] font-normal uppercase tracking-[0.25em] text-muted-foreground">
                Monthly trends
              </p>

              {monthly.length > 0 ? (
                <>
                  <div className="h-52">
                    <VChart spec={chartSpec} options={{ autoFit: true }} />
                  </div>

                  <div className="space-y-2">
                    {monthly.map((m) => (
                      <div
                        key={m.period.period}
                        className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-3 text-xs"
                      >
                        <span className="font-medium text-muted-foreground">
                          {m.period.period}
                        </span>
                        <div className="flex gap-4 tabular-nums">
                          <span className="text-muted-foreground">
                            <span className="mr-1 opacity-60">Expected</span>
                            {formatKES(m.expected)}
                          </span>
                          <span className="text-emerald-500">
                            <span className="mr-1 opacity-60">Collected</span>
                            {formatKES(m.collected)}
                          </span>
                          {m.arrears > 0 && (
                            <span className="text-rose-500">
                              <span className="mr-1 opacity-60">Arrears</span>
                              {formatKES(m.arrears)}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            <span className="mr-1 opacity-60">Occ.</span>
                            {formatPct(m.occupancyRate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No trends data available yet.
                </p>
              )}
            </div>
          </section>
        )}
      </Container>
    </RequireOrganization>
  );
}
