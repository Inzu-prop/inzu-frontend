"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mail, Phone, Building2, Home, FileText, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
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

function formatCurrencyKES(n?: number) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);
}

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function getInitials(first?: string, last?: string, fallback?: string) {
  const a = first?.trim()?.[0];
  const b = last?.trim()?.[0];
  if (a || b) return `${a ?? ""}${b ?? ""}`.toUpperCase();
  return fallback?.trim()?.[0]?.toUpperCase() ?? "T";
}

function StatusChip({ status }: { status?: string }) {
  const s = status?.toLowerCase();
  let bg = "rgba(144,180,148,0.07)";
  let color = "rgba(120,120,120,0.6)";
  if (s === "active") { bg = "rgba(50,83,61,0.12)"; color = "#32533D"; }
  else if (s === "blacklisted") { bg = "rgba(226,32,38,0.10)"; color = "#E22026"; }
  else if (s === "inactive") { bg = "rgba(120,120,120,0.10)"; color = "rgba(120,120,120,0.7)"; }
  else if (s === "prospective") { bg = "rgba(130,93,66,0.10)"; color = "#825D42"; }
  return (
    <span
      style={{ background: bg, color }}
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider"
    >
      {status ?? "Unknown"}
    </span>
  );
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

type EmergencyContact = {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
};

type TenantDocument = {
  url?: string;
  name?: string;
  type?: string;
};

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
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  emergencyContacts?: EmergencyContact[];
  documents?: TenantDocument[];
  idDocumentUrl?: string | null;
  employmentDocumentUrl?: string | null;
  clerkUserId?: string;
  [key: string]: unknown;
};

export default function TenantDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const tenantId = params.tenantId as string;

  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);
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
        const propertyId = t.propertyId as string | undefined;
        await Promise.all([
          unitId
            ? api.units.get(unitId).then((u) => setUnit(u)).catch(() => {})
            : Promise.resolve(),
          propertyId
            ? api.properties
                .get(propertyId)
                .then((res) => {
                  const prop = (res as { property?: { name?: string } })?.property;
                  setPropertyName(prop?.name ?? null);
                })
                .catch(() => {})
            : Promise.resolve(),
        ]);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [api.tenants, api.units, api.properties, organizationId, tenantId]);

  const displayName = (() => {
    const fromTenant =
      tenant?.name ??
      [tenant?.firstName, tenant?.lastName].filter(Boolean).join(" ");
    return fromTenant || "Tenant";
  })();

  const memberSince = formatDate(tenant?.createdAt);
  const emergencyContacts = (tenant?.emergencyContacts ?? []).filter((c) => c && (c.name || c.phoneNumber || c.email));
  const documents: { label: string; url: string }[] = [];
  if (tenant?.idDocumentUrl) documents.push({ label: "ID Document", url: tenant.idDocumentUrl });
  if (tenant?.employmentDocumentUrl) documents.push({ label: "Employment Document", url: tenant.employmentDocumentUrl });
  (tenant?.documents ?? []).forEach((d, i) => {
    if (d?.url) documents.push({ label: d.name ?? d.type ?? `Document ${i + 1}`, url: d.url });
  });

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
            {/* Header card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-wrap items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#32533D]/10 text-lg font-semibold text-[#32533D] dark:bg-[#90B494]/15 dark:text-[#90B494]">
                  {getInitials(tenant.firstName, tenant.lastName, displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
                    <StatusChip status={tenant.status} />
                  </div>
                  {memberSince && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Member since {memberSince}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {tenant.email && (
                      <a
                        href={`mailto:${tenant.email}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {tenant.email}
                      </a>
                    )}
                    {tenant.phoneNumber && (
                      <a
                        href={`tel:${tenant.phoneNumber}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {tenant.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {!showGenerateInvoice && (
                  <Button size="sm" onClick={() => setShowGenerateInvoice(true)}>
                    Generate invoice
                  </Button>
                )}
                {unit?.propertyId && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/properties/${unit.propertyId}`}>View property</Link>
                  </Button>
                )}
                {unit && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/units/${unit._id}`}>View unit</Link>
                  </Button>
                )}
              </div>
            </div>

            {showGenerateInvoice && (
              <GenerateInvoicePanel
                tenantId={tenantId}
                onClose={() => setShowGenerateInvoice(false)}
              />
            )}

            {/* Tenancy + Rent */}
            <div className="grid gap-4 md:grid-cols-3">
              <section className="rounded-lg border border-border bg-card p-5 md:col-span-2">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tenancy
                </h2>
                <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Property</dt>
                      <dd className="mt-0.5 truncate text-sm">
                        {tenant.propertyId ? (
                          <Link
                            href={`/properties/${tenant.propertyId}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {propertyName ?? "View property"}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Home className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Unit</dt>
                      <dd className="mt-0.5 text-sm">
                        {unit ? (
                          <>
                            <Link
                              href={`/units/${unit._id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              Unit {unit.unitNumber}
                            </Link>
                            {unit.status && (
                              <span className="ml-2 text-xs text-muted-foreground">({unit.status})</span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </dd>
                    </div>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly rent
                </h2>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatCurrencyKES(tenant.monthlyRent != null ? Number(tenant.monthlyRent) : undefined)}
                </p>
                {tenant.monthlyRent == null && (
                  <p className="mt-1 text-xs text-muted-foreground">No rent set</p>
                )}
              </section>
            </div>

            {/* Documents */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Documents
              </h2>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {documents.map((doc, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm">{doc.label}</span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Emergency contacts */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                Emergency contacts
              </h2>
              {emergencyContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No emergency contacts on file.</p>
              ) : (
                <ul className="space-y-3">
                  {emergencyContacts.map((c, i) => (
                    <li key={i} className="rounded-md border border-border bg-muted/30 p-3">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-medium">{c.name ?? "Contact"}</span>
                        {c.relationship && (
                          <span className="text-xs text-muted-foreground">{c.relationship}</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {c.phoneNumber && (
                          <a href={`tel:${c.phoneNumber}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                            <Phone className="h-3.5 w-3.5" />
                            {c.phoneNumber}
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                            <Mail className="h-3.5 w-3.5" />
                            {c.email}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="text-xs text-muted-foreground">
              Tenant ID: <span className="font-mono">{tenant._id ?? tenantId}</span>
            </p>
          </>
        )}
      </Container>
    </RequireOrganization>
  );
}

