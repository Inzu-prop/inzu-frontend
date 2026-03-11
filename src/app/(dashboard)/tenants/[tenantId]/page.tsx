"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { GeneratedInvoice, GenerateInvoicesResponse, Unit } from "@/lib/api";
import { ApiError } from "@/lib/api";

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

type GenerateResult =
  | { type: "success"; data: GenerateInvoicesResponse }
  | { type: "error"; message: string };

function GenerateInvoicePanel({
  tenantId,
  onClose,
}: {
  tenantId: string;
  onClose: () => void;
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
      const data = await api.invoices.generate({
        period: period || undefined,
        tenantIds: [tenantId],
      });
      setResult({ type: "success", data });
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Generate invoice for this tenant</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Creates a rent invoice for this tenant for the selected month.
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
          <label htmlFor="tenant-invoice-period" className="text-xs font-medium text-muted-foreground">
            Billing period
          </label>
          <input
            ref={inputRef}
            id="tenant-invoice-period"
            type="month"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setResult(null);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={handleGenerate} disabled={submitting || !period}>
          {submitting ? "Generating…" : "Generate"}
        </Button>
      </div>

      {result?.type === "success" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {result.data.generated === 0
              ? "No invoice was generated. The tenant may already have an invoice for this period, or is missing a unit or rent amount."
              : `Invoice generated for ${period}.`}
          </p>
          {result.data.invoices.map((inv: GeneratedInvoice) => (
            <div
              key={inv._id}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{inv.invoiceNumber ?? inv._id}</span>
                <span className="text-muted-foreground">
                  {formatAmount(inv.totalAmount ?? inv.amount)}
                </span>
              </div>
              {inv.status && (
                <span className="mt-1 inline-block text-xs text-muted-foreground">
                  Status: {inv.status}
                </span>
              )}
            </div>
          ))}
          {result.data.errors && result.data.errors.length > 0 && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Skipped</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.data.errors.map((e, i) => (
                  <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400">{e}</li>
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

type TenantDetails = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  unitId?: string;
  propertyId?: string;
  monthlyRent?: number;
  [key: string]: unknown;
};

export default function TenantDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const tenantId = params.tenantId as string;

  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);

  useEffect(() => {
    if (!organizationId || !tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.tenants
      .get(tenantId)
      .then(async (res) => {
        const raw = res as
          | { tenant?: TenantDetails; unitId?: string }
          | TenantDetails;
        const fromEnvelope = (raw as { tenant?: TenantDetails }).tenant;
        const t: TenantDetails = fromEnvelope ?? (raw as TenantDetails);
        setTenant(t);

        const unitId = (t.unitId ?? raw?.unitId) as string | undefined;
        if (unitId) {
          try {
            const fetchedUnit = await api.units.get(unitId);
            setUnit(fetchedUnit);
          } catch {
            // ignore unit fetch errors; tenant details still useful
          }
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [api.tenants, api.units, organizationId, tenantId]);

  const displayName = (() => {
    const fromTenant =
      tenant?.name ??
      [tenant?.firstName, tenant?.lastName].filter(Boolean).join(" ");
    return fromTenant || "Tenant";
  })();

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tenants">← Tenants</Link>
          </Button>
        </div>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && tenant && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  ID: {tenant._id ?? tenantId}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                {tenant.email && (
                  <span className="text-muted-foreground">
                    Email: {tenant.email}
                  </span>
                )}
                {tenant.phoneNumber && (
                  <span className="text-muted-foreground">
                    Phone: {tenant.phoneNumber}
                  </span>
                )}
                {tenant.monthlyRent != null && (
                  <span className="text-muted-foreground">
                    Monthly rent: {Number(tenant.monthlyRent)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Tenancy
                </h2>
                <dl className="grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Unit</dt>
                  <dd>
                    {unit ? (
                      <>
                        <span>Unit {unit.unitNumber}</span>
                        {unit.status && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({unit.status})
                          </span>
                        )}
                      </>
                    ) : tenant?.unitId ? (
                      tenant.unitId
                    ) : (
                      "Unassigned"
                    )}
                  </dd>
                  <dt className="text-muted-foreground">Property</dt>
                  <dd>{tenant.propertyId ?? "—"}</dd>
                </dl>
              </section>

              <section className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Raw data
                </h2>
                <pre className="overflow-auto rounded bg-background/60 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(tenant, null, 2)}
                </pre>
              </section>
            </div>

            {showGenerateInvoice && (
              <GenerateInvoicePanel
                tenantId={tenantId}
                onClose={() => setShowGenerateInvoice(false)}
              />
            )}

            <div className="flex flex-wrap gap-2">
              {!showGenerateInvoice && (
                <Button size="sm" onClick={() => setShowGenerateInvoice(true)}>
                  Generate invoice
                </Button>
              )}
              {unit?.propertyId && (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/properties/${unit.propertyId}`}>
                      View property
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/properties/${unit.propertyId}/units`}>
                      View property units
                    </Link>
                  </Button>
                </>
              )}
              {unit && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/units/${unit._id}`}>View unit</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </Container>
    </RequireOrganization>
  );
}

