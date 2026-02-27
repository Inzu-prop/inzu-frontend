"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Property } from "@/lib/api";
import { ApiError } from "@/lib/api";

export default function PropertyDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !propertyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.properties
      .get(propertyId)
      .then((res) => {
        setProperty(res.property);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [api.properties, organizationId, propertyId]);

  const addr = property?.address;
  const addressLine = addr
    ? [addr.street, addr.city, addr.state, addr.country, addr.postalCode]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties">← Properties</Link>
          </Button>
        </div>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && property && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {property.name}
                </h1>
                {addressLine && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addressLine}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {property.type}
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  Status: {property.status}
                </span>
                {property.totalUnits != null && (
                  <span className="text-muted-foreground">
                    {property.totalUnits} units
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Details
                </h2>
                <dl className="grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Year built</dt>
                  <dd>{property.yearBuilt ?? "—"}</dd>
                  <dt className="text-muted-foreground">Floors</dt>
                  <dd>{property.totalFloors ?? "—"}</dd>
                  <dt className="text-muted-foreground">Purchase price</dt>
                  <dd>
                    {property.purchasePrice != null
                      ? property.purchasePrice
                      : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Current value</dt>
                  <dd>
                    {property.currentValue != null
                      ? property.currentValue
                      : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Created at</dt>
                  <dd>
                    {property.createdAt
                      ? new Date(property.createdAt).toLocaleString()
                      : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Updated at</dt>
                  <dd>
                    {property.updatedAt
                      ? new Date(property.updatedAt).toLocaleString()
                      : "—"}
                  </dd>
                </dl>
              </section>

              <section className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {property.notes || "No notes added for this property yet."}
                </p>
              </section>
            </div>

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

