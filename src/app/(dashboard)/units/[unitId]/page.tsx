"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Unit, UnitType } from "@/lib/api";
import { ApiError } from "@/lib/api";

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  studio: "Studio",
  one_bedroom: "1 Bedroom",
  two_bedroom: "2 Bedrooms",
  three_bedroom: "3 Bedrooms",
  four_plus_bedroom: "4+ Bedrooms",
  commercial: "Commercial",
};

const STATUS_STYLES: Record<string, string> = {
  occupied: "bg-[#90B494]/20 text-[#32533D] dark:bg-[#90B494]/15 dark:text-[#90B494]",
  vacant: "bg-muted text-muted-foreground",
  maintenance: "bg-[#825D42]/15 text-[#825D42]",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default function UnitDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !unitId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.units
      .get(unitId)
      .then((res) => {
        const withUnit = res as { unit?: Unit };
        setUnit(withUnit.unit ?? (res as Unit));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [api.units, organizationId, unitId]);

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/units">← Units</Link>
          </Button>
          {unit?.propertyId && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/properties/${unit.propertyId}/units`}>← Property units</Link>
            </Button>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
        )}
        {error && <p className="text-destructive" role="alert">{error}</p>}

        {!loading && !error && unit && (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Unit {unit.unitNumber}</h1>
                <p className="mt-1 text-xs font-mono text-muted-foreground">{unit._id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {unit.type && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {UNIT_TYPE_LABELS[unit.type as UnitType] ?? unit.type}
                  </span>
                )}
                {unit.status && (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[unit.status] ?? "bg-muted text-muted-foreground"}`}>
                    {unit.status}
                  </span>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="flex flex-wrap gap-4">
              {unit.rentAmount != null && (
                <div className="flex-1 min-w-[130px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{formatCurrency(Number(unit.rentAmount))}</p>
                  <p className="text-xs text-muted-foreground mt-1">Monthly rent</p>
                </div>
              )}
              {unit.depositAmount != null && (
                <div className="flex-1 min-w-[130px] rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold">{formatCurrency(Number(unit.depositAmount))}</p>
                  <p className="text-xs text-muted-foreground mt-1">Deposit</p>
                </div>
              )}
            </div>

            {/* Details card */}
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Details
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Unit number</dt>
                  <dd className="font-medium mt-0.5">{unit.unitNumber || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium mt-0.5">
                    {unit.type ? (UNIT_TYPE_LABELS[unit.type as UnitType] ?? unit.type) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium mt-0.5 capitalize">{unit.status || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Rent</dt>
                  <dd className="font-medium mt-0.5">
                    {unit.rentAmount != null ? formatCurrency(Number(unit.rentAmount)) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Deposit</dt>
                  <dd className="font-medium mt-0.5">
                    {unit.depositAmount != null ? formatCurrency(Number(unit.depositAmount)) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium mt-0.5">
                    {"createdAt" in unit && unit.createdAt
                      ? new Date(unit.createdAt as string).toLocaleDateString()
                      : "—"}
                  </dd>
                </div>
              </dl>
            </section>

            {unit.propertyId && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/properties/${unit.propertyId}`}>View property</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/properties/${unit.propertyId}/units`}>All units in property</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </RequireOrganization>
  );
}
