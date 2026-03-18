"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import type { GeneratedInvoice, GenerateInvoicesResponse, InvoiceListItem } from "@/lib/api";

function currentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
} //

function formatAmount(amount?: number): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function statusClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "overdue":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}
//
type GenerateResult =
  | { type: "success"; data: GenerateInvoicesResponse }
  | { type: "error"; message: string };

function GeneratePanel({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const api = useInzuApi();
  const [period, setPeriod] = useState(currentYearMonth());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleGenerate() {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.invoices.generate({ period: period || undefined });
      setResult({ type: "success", data });
      onSuccess();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : String(err);
      setResult({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Generate invoices</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Creates rent invoices for all eligible tenants in the selected month.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="invoice-period" className="text-xs font-medium text-muted-foreground">
            Billing period
          </label>
          <input
            ref={inputRef}
            id="invoice-period"
            type="month"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setResult(null);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={submitting || !period}
        >
          {submitting ? "Generating…" : "Generate"}
        </Button>
      </div>

      {result?.type === "success" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {result.data.generated === 0
              ? "No new invoices were generated."
              : `Generated ${result.data.generated} invoice${result.data.generated === 1 ? "" : "s"} for ${period}.`}
          </p>

          {result.data.invoices.length > 0 && (
            <ul className="divide-y divide-border rounded-md border border-border text-sm">
              {result.data.invoices.map((inv: GeneratedInvoice) => (
                <li key={inv._id} className="flex items-center justify-between px-3 py-2">
                  <span className="font-medium">
                    {inv.invoiceNumber ?? inv._id}
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {inv.period && <span>{inv.period}</span>}
                    <span>
                      {formatAmount(inv.totalAmount ?? inv.amount)}
                    </span>
                    {inv.status && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {result.data.errors && result.data.errors.length > 0 && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Skipped ({result.data.errors.length})
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.data.errors.map((e, i) => (
                  <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result?.type === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {result.message}
        </p>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  const api = useInzuApi();
  const { organizationId, isLoaded } = useCurrentOrganizationId();
  const [data, setData] = useState<InvoiceListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);

  function fetchInvoices() {
    if (!organizationId) return;
    setLoading(true);
    setLoadError(null);
    api.invoices
      .list()
      .then((res: InvoiceListItem[] | { invoices?: InvoiceListItem[] }) => {
        setData(Array.isArray(res) ? res : res && Array.isArray(res.invoices) ? res.invoices : []);
      })
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isLoaded || !organizationId) {
      setLoading(false);
      return;
    }
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, organizationId]);

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invoices</h2>
          {!showGenerate && (
            <Button size="sm" onClick={() => setShowGenerate(true)}>
              Generate invoices
            </Button>
          )}
        </div>

        {showGenerate && (
          <GeneratePanel
            onClose={() => setShowGenerate(false)}
            onSuccess={fetchInvoices}
          />
        )}

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {loadError && (
          <p className="text-destructive" role="alert">
            {loadError}
          </p>
        )}

        {!loading && !loadError && data && data.length === 0 && (
          <p className="text-muted-foreground">No invoices yet.</p>
        )}

        {!loading && !loadError && data && data.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.map((item) => (
              <li
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-sm">
                    {item.invoiceNumber ?? item._id}
                  </span>
                  {item.period && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.period}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatAmount(item.totalAmount ?? item.amount)}</span>
                  {item.status && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(item.status)}`}>
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
