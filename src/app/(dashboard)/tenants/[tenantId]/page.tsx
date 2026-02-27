"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Unit } from "@/lib/api";
import { ApiError } from "@/lib/api";

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
        const raw = res as any;
        const t: TenantDetails = (raw?.tenant ?? raw) as TenantDetails;
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

            <div className="flex flex-wrap gap-2">
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

