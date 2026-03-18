"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Property, PropertyStatus, PropertyType } from "@/lib/api";
import { ApiError } from "@/lib/api";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-muted text-muted-foreground",
  under_construction: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  for_sale: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  under_construction: "Under construction",
  for_sale: "For sale",
};

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  house: "House",
  commercial: "Commercial",
  mixed_use: "Mixed use",
  land: "Land",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "—"}</dd>
    </>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !propertyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.properties
      .get(propertyId)
      .then((res) => setProperty(res.property))
      .catch((err) => setError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [api.properties, organizationId, propertyId]);

  const addr = property?.address;
  const addressLine = addr
    ? [addr.street, addr.city, addr.state, addr.country, addr.postalCode].filter(Boolean).join(", ")
    : "";

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties">← Properties</Link>
          </Button>
        </div>

        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
        )}
        {error && <p className="text-destructive" role="alert">{error}</p>}

        {!loading && !error && property && (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{property.name}</h1>
                {addressLine && (
                  <p className="mt-1 text-sm text-muted-foreground">{addressLine}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {TYPE_LABELS[property.type] ?? property.type}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[property.status]}`}>
                  {STATUS_LABELS[property.status]}
                </span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="flex flex-wrap gap-4">
              {property.totalUnits != null && (
                <div className="flex-1 min-w-[120px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{property.totalUnits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total units</p>
                </div>
              )}
              {property.totalFloors != null && (
                <div className="flex-1 min-w-[120px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{property.totalFloors}</p>
                  <p className="text-xs text-muted-foreground mt-1">Floors</p>
                </div>
              )}
              {property.yearBuilt != null && (
                <div className="flex-1 min-w-[120px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{property.yearBuilt}</p>
                  <p className="text-xs text-muted-foreground mt-1">Year built</p>
                </div>
              )}
              {property.purchasePrice != null && (
                <div className="flex-1 min-w-[140px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{formatCurrency(property.purchasePrice)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Purchase price</p>
                </div>
              )}
              {property.currentValue != null && (
                <div className="flex-1 min-w-[140px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{formatCurrency(property.currentValue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current value</p>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Details */}
              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Details
                </h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <InfoRow label="Type" value={TYPE_LABELS[property.type] ?? property.type} />
                  <InfoRow label="Status" value={STATUS_LABELS[property.status]} />
                  <InfoRow label="Year built" value={property.yearBuilt} />
                  <InfoRow label="Floors" value={property.totalFloors} />
                  <InfoRow label="Units" value={property.totalUnits} />
                  <InfoRow label="Photos" value={property.photos.length} />
                  <InfoRow
                    label="Created"
                    value={property.createdAt ? new Date(property.createdAt).toLocaleDateString() : null}
                  />
                  <InfoRow
                    label="Updated"
                    value={property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : null}
                  />
                </dl>
              </section>

              {/* Notes */}
              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {property.notes || "No notes added for this property yet."}
                </p>
              </section>
            </div>

            {/* Documents */}
            {property.documents.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Documents ({property.documents.length})
                </h2>
                <ul className="divide-y divide-border">
                  {property.documents.map((doc) => (
                    <li key={doc.r2Key} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium">{doc.name}</span>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="text-xs">{doc.type}</span>
                        <span className="text-xs">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href={`/properties/${property._id}/units`}>View units</Link>
              </Button>
            </div>
          </>
        )}
      </Container>
    </RequireOrganization>
  );
}
