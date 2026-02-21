"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Unit, UnitType } from "@/lib/api";
import { UNIT_TYPES } from "@/lib/api";
import { ApiError } from "@/lib/api";

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  studio: "Studio",
  one_bedroom: "1 Bedroom",
  two_bedroom: "2 Bedrooms",
  three_bedroom: "3 Bedrooms",
  four_plus_bedroom: "4+ Bedrooms",
  commercial: "Commercial",
};

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function normalizeUnitsResponse(res: unknown): Unit[] {
  if (Array.isArray(res)) return res as Unit[];
  if (res && typeof res === "object" && "units" in res && Array.isArray((res as { units: unknown }).units)) {
    return (res as { units: Unit[] }).units;
  }
  return [];
}

function UnitsPageContent() {
  const api = useInzuApi();
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get("propertyId") ?? undefined;

  const [data, setData] = useState<Unit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUnits = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = propertyIdParam ? { propertyId: propertyIdParam } : undefined;
    api.units
      .list(params)
      .then((res) => setData(normalizeUnitsResponse(res)))
      .catch((err) => setError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [api.units, propertyIdParam]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

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
    api.units
      .update(unitId, body)
      .then(() => {
        setEditingId(null);
        fetchUnits();
      })
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Units</h2>
          <Button size="sm" variant="outline" asChild>
            <Link href="/properties">Properties</Link>
          </Button>
        </div>
        {propertyIdParam && (
          <p className="mb-2 text-sm text-muted-foreground">
            Filtered by property.{" "}
            <Link href="/units" className="text-primary hover:underline">
              Show all units
            </Link>
          </p>
        )}
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data && data.length === 0 && (
          <p className="text-muted-foreground">No units yet. Add units from a property&apos;s Units page.</p>
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.map((u) => (
              <li
                key={u._id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                {editingId === u._id ? (
                  <form
                    onSubmit={(e) => handleEditSubmit(e, u._id)}
                    className="flex flex-1 flex-wrap items-center gap-2"
                  >
                    <span className="font-medium">{u.unitNumber}</span>
                    {u.propertyId && (
                      <Link
                        href={`/properties/${u.propertyId}/units`}
                        className="text-muted-foreground text-sm hover:underline"
                      >
                        Property
                      </Link>
                    )}
                    <select
                      value={editType}
                      onChange={(e) => setEditType((e.target.value || "") as UnitType | "")}
                      className={inputClassName}
                      style={{ width: "auto", minWidth: 120 }}
                    >
                      <option value="">—</option>
                      {UNIT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {UNIT_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={editRent}
                      onChange={(e) => setEditRent(e.target.value)}
                      className={inputClassName}
                      placeholder="Rent"
                      style={{ width: 100 }}
                    />
                    <Button type="submit" size="sm" disabled={editSubmitting}>
                      Save
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{u.unitNumber}</span>
                      {u.propertyId && (
                        <Button size="sm" variant="link" className="h-auto p-0" asChild>
                          <Link href={`/properties/${u.propertyId}/units`}>View property units</Link>
                        </Button>
                      )}
                      {u.type && (
                        <span className="text-muted-foreground text-sm">
                          {UNIT_TYPE_LABELS[u.type as UnitType] ?? u.type}
                        </span>
                      )}
                      {u.rentAmount != null && (
                        <span className="text-sm">Rent: {Number(u.rentAmount)}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>
                        Edit
                      </Button>
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
                  </>
                )}
              </li>
            ))}
          </ul>
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Units</h2>
            </div>
            <p className="text-muted-foreground">Loading…</p>
          </Container>
        </RequireOrganization>
      }
    >
      <UnitsPageContent />
    </Suspense>
  );
}
