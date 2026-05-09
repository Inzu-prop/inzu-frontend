"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import type { GeneratedInvoice, GenerateInvoicesResponse, InvoiceListItem } from "@/lib/api";
import MpesaPaymentModal from "@/components/mpesa-payment-modal";

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatAmount(amount?: number): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/* ── Status badge — inzu brand tokens ────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase();
  let bg = "rgba(144,180,148,0.08)";
  let color = "rgba(245,247,246,0.45)";

  if (s === "paid") {
    bg = "rgba(144,180,148,0.12)";
    color = "#90B494";
  } else if (s === "overdue") {
    bg = "rgba(226,32,38,0.10)";
    color = "#E22026";
  } else if (s === "pending") {
    bg = "rgba(130,93,66,0.12)";
    color = "#825D42";
  }

  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 20,
      }}
    >
      {status ?? "—"}
    </span>
  );
}

/* ── Generate invoices panel ──────────────────────────────── */
function GeneratePanel({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const api = useInzuApi();
  const [period, setPeriod] = useState(currentYearMonth());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    | { type: "success"; data: GenerateInvoicesResponse }
    | { type: "error"; message: string }
    | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleGenerate() {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.invoices.generate({ period: period || undefined });
      setResult({ type: "success", data });
      onSuccess();
    } catch (err) {
      setResult({ type: "error", message: err instanceof ApiError ? err.message : String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(144,180,148,0.05)",
        border: "1px solid rgba(144,180,148,0.12)",
        borderRadius: 12,
        padding: "16px 18px",
      }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Generate invoices</h3>
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
            onChange={(e) => { setPeriod(e.target.value); setResult(null); }}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={() => void handleGenerate()} disabled={submitting || !period}>
          {submitting ? "Generating…" : "Generate"}
        </Button>
      </div>

      {result?.type === "success" && (
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: "#90B494" }}>
            {result.data.generated === 0
              ? "No new invoices were generated."
              : `Generated ${result.data.generated} invoice${result.data.generated === 1 ? "" : "s"} for ${period}.`}
          </p>
          {result.data.invoices.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border text-sm">
              {result.data.invoices.map((inv: GeneratedInvoice) => (
                <li key={inv._id} className="flex items-center justify-between px-3 py-2">
                  <span className="font-medium">{inv.invoiceNumber ?? inv._id}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {inv.period && <span>{inv.period}</span>}
                    <span>{formatAmount(inv.totalAmount ?? inv.amount)}</span>
                    {inv.status && <StatusBadge status={inv.status} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {result.data.errors && result.data.errors.length > 0 && (
            <div
              style={{
                background: "rgba(130,93,66,0.08)",
                border: "1px solid rgba(130,93,66,0.2)",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#825D42" }}>
                Skipped ({result.data.errors.length})
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.data.errors.map((e, i) => (
                  <li key={i} className="text-xs text-muted-foreground">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {result?.type === "error" && (
        <p className="text-sm text-destructive" role="alert">{result.message}</p>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function InvoicesPage() {
  const api = useInzuApi();
  const { organizationId, isLoaded } = useCurrentOrganizationId();
  const [data, setData] = useState<InvoiceListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* M-Pesa modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<{
    id: string;
    number?: string;
    period?: string;
    amount?: number;
  } | null>(null);

  function openPaymentModal(item: InvoiceListItem) {
    setActiveInvoice({
      id: item._id,
      number: item.invoiceNumber,
      period: item.period,
      amount: item.totalAmount ?? item.amount,
    });
    setModalOpen(true);
  }

  function fetchInvoices() {
    if (!organizationId) return;
    setLoading(true);
    setLoadError(null);
    api.invoices
      .list()
      .then((res: InvoiceListItem[] | { invoices?: InvoiceListItem[] }) => {
        setData(Array.isArray(res) ? res : res && Array.isArray(res.invoices) ? res.invoices : []);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : String(err)))
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

        {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {loadError && <p className="text-destructive text-sm" role="alert">{loadError}</p>}

        {/* Search + status filter */}
        {data && data.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 200px", minWidth: 0, height: 34,
                borderRadius: 8, border: "1px solid hsl(var(--border))",
                background: "hsl(var(--background))", padding: "0 12px",
                fontSize: 13, outline: "none", color: "inherit",
              }}
            />
            <div className="flex gap-1 flex-wrap">
              {(["all", "pending", "paid", "overdue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    fontSize: 11, fontWeight: 500, letterSpacing: "0.04em",
                    padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                    transition: "background 180ms ease, color 180ms ease",
                    background: statusFilter === s ? "rgba(144,180,148,0.15)" : "transparent",
                    color: statusFilter === s ? "#90B494" : "hsl(var(--muted-foreground))",
                    border: statusFilter === s ? "1px solid rgba(144,180,148,0.3)" : "1px solid hsl(var(--border))",
                  }}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !loadError && data && data.length === 0 && (
          <div className="inzu-empty">
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
            <button
              className="text-xs font-medium underline underline-offset-4"
              style={{ color: "#90B494" }}
              onClick={() => setShowGenerate(true)}
            >
              Generate invoices
            </button>
          </div>
        )}

        {!loading && !loadError && data && data.length > 0 && (() => {
          const q = search.toLowerCase();
          const filtered = data.filter((item) => {
            const matchesSearch = !q ||
              (item.invoiceNumber ?? "").toLowerCase().includes(q) ||
              (item.period ?? "").toLowerCase().includes(q);
            const matchesStatus = statusFilter === "all" || (item.status ?? "").toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
          });

          if (filtered.length === 0) {
            return <p className="text-sm text-muted-foreground">No invoices match your search.</p>;
          }

          return (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {filtered.map((item) => {
              const isPaid = item.status?.toLowerCase() === "paid";
              return (
                <li
                  key={item._id}
                  className="inzu-row flex flex-wrap items-center justify-between gap-2 px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium text-sm">
                        {item.invoiceNumber ?? item._id}
                      </span>
                      {item.period && (
                        <span className="ml-2 text-xs text-muted-foreground">{item.period}</span>
                      )}
                      {item.dueDate && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      style={{
                        fontFeatureSettings: '"tnum"',
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                      }}
                      className="text-foreground"
                    >
                      KES {formatAmount(item.totalAmount ?? item.amount)}
                    </span>
                    <StatusBadge status={item.status} />
                    {!isPaid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPaymentModal(item)}
                        style={{ fontSize: 12 }}
                      >
                        Request payment
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          );
        })()}
      </Container>

      <MpesaPaymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        invoice={activeInvoice}
        onPaymentConfirmed={() => {
          setModalOpen(false);
          fetchInvoices();
        }}
      />
    </RequireOrganization>
  );
}
