"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { ReportsView } from "@/components/reports-view";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { type TrendMonth, monthKey, periodStart } from "@/lib/reporting";

export function PerformanceReport() {
  const api = useInzuApi();
  const { organizationId } = useCurrentOrganizationId();
  const [monthly, setMonthly] = useState<TrendMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setMonthly([]);
    setError(null);
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const now = new Date();
    api.dashboard
      .getTrends({
        from: [periodStart("6m", now), periodStart("ytd", now)].sort()[0],
        to: monthKey(now),
      })
      .then((result) => {
        if (!cancelled)
          setMonthly((result as { monthly?: TrendMonth[] }).monthly ?? []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "Could not load performance data.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api.dashboard, organizationId, retry]);
  if (loading)
    return (
      <p role="status" className="text-body-regular text-text-secondary py-8">
        Loading performance data...
      </p>
    );
  if (error)
    return (
      <div className="flex flex-col items-start gap-3 py-6">
        <p role="alert" className="text-body-regular text-text-error-primary">
          {error}
        </p>
        <Button variant="secondary" onClick={() => setRetry((n) => n + 1)}>
          Try again
        </Button>
      </div>
    );
  return <ReportsView monthly={monthly} embedded />;
}
