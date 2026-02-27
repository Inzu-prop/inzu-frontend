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

export default function UnitDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !unitId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.units
      .get(unitId)
      .then((res) => {
        setUnit(res);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [api.units, organizationId, unitId]);

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/units">← Units</Link>
          </Button>
        </div>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && unit && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Unit {unit.unitNumber}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  ID: {unit._id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                {unit.type && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    Type: {unit.type}
                  </span>
                )}
                {unit.status && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    Status: {unit.status}
                  </span>
                )}
                {unit.rentAmount != null && (
                  <span className="text-muted-foreground">
                    Rent: {Number(unit.rentAmount)}
                  </span>
                )}
                {unit.depositAmount != null && (
                  <span className="text-muted-foreground">
                    Deposit: {Number(unit.depositAmount)}
                  </span>
                )}
              </div>
            </div>

            <section className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Metadata
              </h2>
              <pre className="overflow-auto rounded bg-background/60 p-3 text-xs text-muted-foreground">
                {JSON.stringify(unit, null, 2)}
              </pre>
            </section>

            {unit.propertyId && (
              <div className="flex flex-wrap gap-2">
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
              </div>
            )}
          </>
        )}
      </Container>
    </RequireOrganization>
  );
}

