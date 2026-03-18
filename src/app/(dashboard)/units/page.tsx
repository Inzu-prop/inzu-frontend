"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Unit, UnitType } from "@/lib/api";
import { UNIT_TYPES } from "@/lib/api";
import { ApiError } from "@/lib/api";

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  studio: "Studio",
  one_bedroom: "1 Bed",
  two_bedroom: "2 Bed",
  three_bedroom: "3 Bed",
  four_plus_bedroom: "4+ Bed",
  commercial: "Commercial",
};

const UNIT_TYPE_LABELS_FULL: Record<UnitType, string> = {
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

function normalizeUnitsResponse(res: unknown): Unit[] {
  if (Array.isArray(res)) return res as Unit[];
  if (res && typeof res === "object" && "units" in res && Array.isArray((res as { units: unknown }).units))
    return (res as { units: Unit[] }).units;
  return [];
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function UnitsPageContent() {
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get("propertyId") ?? undefined;

  const [data, setData] = useState<Unit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUnits = useCallback(() => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    const params = propertyIdParam ? { propertyId: propertyIdParam } : undefined;
    api.units
      .list(params)
      .then((res) => setData(normalizeUnitsResponse(res)))
      .catch((err) => setError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [api.units, organizationId, propertyIdParam]);

  useEffect(() => {
    if (organizationId) fetchUnits();
    else setLoading(false);
  }, [organizationId, fetchUnits]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRent, setEditRent] = useState("");
  const [editType, setEditType] = useState<UnitType | "">("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (u: Unit) => {
    setEditingId(u._id);
    setEditRent(u.rentAmount != null ? String(u.rentAmount) : "");
    setEditType((u.type as UnitType) ?? "");
  };

  const handleEditSubmit = (e: React.FormEvent, unitId: string) => {
    e.preventDefault();
    setEditSubmitting(true);
    const body: { type?: UnitType; rentAmount?: number } = {};
    if (editType) body.type = editType;
    if (editRent.trim() !== "") body.rentAmount = parseFloat(editRent) || 0;
    api.units.update(unitId, body)
      .then(() => { setEditingId(null); fetchUnits(); })
      .finally(() => setEditSubmitting(false));
  };

  const handleDelete = (unitId: string) => {
    if (!confirm("Delete this unit? This cannot be undone.")) return;
    setDeletingId(unitId);
    api.units.delete(unitId).then(() => fetchUnits()).finally(() => setDeletingId(null));
  };

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Units</h1>
            {data && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.length} {data.length === 1 ? "unit" : "units"}
                {propertyIdParam && " in this property"}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/properties">Properties</Link>
          </Button>
        </div>

        {propertyIdParam && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing units for one property.{" "}
            <Link href="/units" className="text-primary hover:underline">Show all units</Link>
          </p>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md border border-border bg-muted/30" />
            ))}
          </div>
        )}
        {error && <p className="text-destructive" role="alert">{error}</p>}

        {!loading && !error && data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No units yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add units from a{" "}
              <Link href="/properties" className="text-primary hover:underline">property&apos;s units page</Link>.
            </p>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Rent</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Deposit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    {editingId === u._id ? (
                      <td colSpan={6} className="px-4 py-2">
                        <form
                          onSubmit={(e) => handleEditSubmit(e, u._id)}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <span className="font-medium w-16">{u.unitNumber}</span>
                          <select
                            value={editType}
                            onChange={(e) => setEditType((e.target.value || "") as UnitType | "")}
                            className={inputCls}
                            style={{ width: 140 }}
                          >
                            <option value="">— Type —</option>
                            {UNIT_TYPES.map((t) => (
                              <option key={t} value={t}>{UNIT_TYPE_LABELS_FULL[t]}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={editRent}
                            onChange={(e) => setEditRent(e.target.value)}
                            className={inputCls}
                            placeholder="Rent"
                            style={{ width: 100 }}
                          />
                          <Button type="submit" size="sm" disabled={editSubmitting}>Save</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <Link href={`/units/${u._id}`} className="font-medium text-primary hover:underline">
                            {u.unitNumber}
                          </Link>
                          {u.propertyId && (
                            <Link
                              href={`/properties/${u.propertyId}/units`}
                              className="ml-2 text-xs text-muted-foreground hover:underline"
                            >
                              property
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.type ? (UNIT_TYPE_LABELS[u.type as UnitType] ?? u.type) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.rentAmount != null ? formatCurrency(Number(u.rentAmount)) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {u.depositAmount != null ? formatCurrency(Number(u.depositAmount)) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {u.status ? (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[u.status] ?? "bg-muted text-muted-foreground"}`}>
                              {u.status}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>Edit</Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(u._id)}
                              disabled={deletingId === u._id}
                            >
                              {deletingId === u._id ? "…" : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </RequireOrganization>
  );
}

export default function UnitsPage() {
  return (
    <Suspense
      fallback={
        <RequireOrganization>
          <Container className="py-6">
            <h1 className="text-xl font-semibold tracking-tight">Units</h1>
            <p className="mt-4 text-muted-foreground">Loading…</p>
          </Container>
        </RequireOrganization>
      }
    >
      <UnitsPageContent />
    </Suspense>
  );
}
