"use client";

import { useEffect, useState } from "react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

type SummaryResponse = Record<string, unknown>;
type TrendsResponse = Record<string, unknown>;

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
    const trendParams = {
      from: fromMonth,
      to: toMonth,
    };

    Promise.all([
      api.dashboard
        .getSummary()
        .then((res) => (!cancelled ? setSummary(res as SummaryResponse) : undefined)),
      api.dashboard
        .getTrends(trendParams)
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

    return {
      primary,
      rest: [...restNumeric, ...rest],
    };
  };

  const formatLabel = (raw: string) =>
    raw
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim();

  const formatValue = (value: unknown) => {
    if (typeof value === "number" || typeof value === "string") return String(value);
    if (Array.isArray(value)) return `${value.length} items`;
    if (value === null || value === undefined) return "—";
    return "Object";
  };

  const { primary, rest } = extractMetrics(summary);

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
                      {formatValue(primary[1])}
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
                        {formatValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="space-y-3 rounded-3xl bg-card/70 px-6 py-5 shadow-none">
              <p className="text-[0.68rem] font-normal uppercase tracking-[0.25em] text-muted-foreground">
                Trends (raw)
              </p>
              {trends ? (
                <pre className="max-h-72 overflow-auto rounded-xl bg-background/60 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(trends, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No trends data returned yet.
                </p>
              )}
            </div>
          </section>
        )}
      </Container>
    </RequireOrganization>
  );
}

