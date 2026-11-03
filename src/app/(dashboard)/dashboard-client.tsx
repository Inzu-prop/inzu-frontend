"use client";

import { useEffect, useState } from "react";
import {
  DashboardView,
  type MonthlyTrend,
  type Summary,
} from "@/components/dashboard-view";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import { monthKey, periodStart } from "@/lib/reporting";

export default function DashboardClient() {
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setMonthly([]);
    setError(null);
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const now = new Date();
    const fromMonth = [
      periodStart("6m", now),
      periodStart("ytd", now),
    ].sort()[0];
    Promise.all([
      api.dashboard.getSummary(),
      api.dashboard.getTrends({ from: fromMonth, to: monthKey(now) }),
    ])
      .then(([result, trends]) => {
        if (!cancelled) {
          setSummary(result as Summary);
          setMonthly((trends as { monthly?: MonthlyTrend[] }).monthly ?? []);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof ApiError
              ? err.message
              : "We could not load your dashboard. Please try again.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api.dashboard, organizationId, retry]);

  return (
    <RequireOrganization>
      <DashboardView
        summary={summary}
        monthly={monthly}
        loading={loading}
        error={error}
        onRetry={() => setRetry((n) => n + 1)}
      />
    </RequireOrganization>
  );
}
