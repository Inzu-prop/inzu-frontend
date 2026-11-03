"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError, type PaymentListItem } from "@/lib/api";

function formatAmount(amount?: number): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PaymentsPage() {
  const api = useInzuApi();
  const [data, setData] = useState<PaymentListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.payments
      .list()
      .then((res) => {
        if (!cancelled) setData(res.payments ?? []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api.payments]);

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payments</h2>
          <Button size="sm">Request payment</Button>
        </div>
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data && data.length === 0 && (
          <p className="text-muted-foreground">No payments yet.</p>
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {item.paymentNumber ?? item._id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[item.method, formatDate(item.transactionDate), item.period]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-medium">{formatAmount(item.amount)}</span>
                  {item.status && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.status}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </RequireOrganization>
  );
}
