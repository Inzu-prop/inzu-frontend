"use client";

import { useEffect, useState } from "react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

type SummaryResponse = Record<string, unknown>;
type TrendsResponse = Record<string, unknown>;

export default function DashboardPage() {
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

    Promise.all([
      api.dashboard
        .getSummary()
        .then((res) => (!cancelled ? setSummary(res as SummaryResponse) : undefined)),
      api.dashboard
        .getTrends()
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

  const renderKeyValue = (data: Record<string, unknown>) => {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground">No data available yet.</p>;
    }

    return (
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-0.5">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
            </dt>
            <dd className="font-medium">
              {typeof value === "number" || typeof value === "string"
                ? String(value)
                : Array.isArray(value)
                  ? `${value.length} items`
                  : value === null || value === undefined
                    ? "—"
                    : "Object"}
            </dd>
          </div>
        ))}
      </dl>
    );
  };

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-6">
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Organization-level summary and trends powered by your dashboard API.
          </p>
        </section>

        {loading && <p className="text-muted-foreground">Loading dashboard…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-3 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium">Summary</h2>
              {summary ? (
                renderKeyValue(summary)
              ) : (
                <p className="text-sm text-muted-foreground">
                  No summary data returned yet.
                </p>
              )}
            </section>

            <section className="space-y-3 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium">Trends</h2>
              {trends ? (
                <pre className="max-h-72 overflow-auto rounded bg-background/60 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(trends, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No trends data returned yet.
                </p>
              )}
            </section>
          </div>
        )}
      </Container>
    </RequireOrganization>
  );
}

export { default } from "./tenant/page";
