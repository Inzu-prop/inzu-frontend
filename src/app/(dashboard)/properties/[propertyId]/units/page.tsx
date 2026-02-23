"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  one_bedroom: "1 Bedroom",
  two_bedroom: "2 Bedrooms",
  three_bedroom: "3 Bedrooms",
  four_plus_bedroom: "4+ Bedrooms",
  commercial: "Commercial",
};

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function normalizeUnitsResponse(res: unknown): Unit[] {
  if (Array.isArray(res)) return res as Unit[];
  if (res && typeof res === "object" && "units" in res && Array.isArray((res as { units: unknown }).units)) {
    return (res as { units: Unit[] }).units;
  }
  return [];
}

export default function PropertyUnitsPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const propertyId = params.propertyId as string;
  const api = useInzuApi();

  const [units, setUnits] = useState<Unit[] | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(() => {
    if (!propertyId || !organizationId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.units.list({ propertyId }),
      api.properties.get(propertyId).catch(() => ({ property: null })),
    ])
      .then(([unitsRes, propertyRes]) => {
        setUnits(normalizeUnitsResponse(unitsRes));
        const prop = (propertyRes as { property?: { name?: string } })?.property;
        setPropertyName(prop?.name ?? null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [api.units, api.properties, organizationId, propertyId]);

  useEffect(() => {
    if (organizationId) {
      fetchUnits();
    } else {
      setLoading(false);
    }
  }, [organizationId, fetchUnits]);

  const [showBulk, setShowBulk] = useState(false);
  const [showSingle, setShowSingle] = useState(false);

  // Bulk form state
  const [bulkCount, setBulkCount] = useState("10");
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkStart, setBulkStart] = useState("1");
  const [bulkType, setBulkType] = useState<UnitType | "">("");
  const [bulkRent, setBulkRent] = useState("");
  const [bulkDeposit, setBulkDeposit] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string[] | null>(null);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    setBulkSuccess(null);
    const count = parseInt(bulkCount, 10);
    if (count < 1 || count > 500) {
      setBulkError("Count must be between 1 and 500.");
      return;
    }
    setBulkSubmitting(true);
    const body = {
      count,
      ...(bulkPrefix.trim() && { unitNumberPrefix: bulkPrefix.trim() }),
      ...(bulkStart.trim() && { unitNumberStart: parseInt(bulkStart, 10) }),
      ...(bulkType && { defaultType: bulkType }),
      ...(bulkRent.trim() !== "" && { defaultRent: parseFloat(bulkRent) || 0 }),
      ...(bulkDeposit.trim() !== "" && { defaultDeposit: parseFloat(bulkDeposit) }),
    };
    api.units
      .createBulk(propertyId, body)
      .then((res) => {
        setBulkSuccess(res.unitNumbers ?? []);
        setShowBulk(false);
        fetchUnits();
      })
      .catch((err) => {
        setBulkError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => setBulkSubmitting(false));
  };

  // Single unit form state
  const [singleNumber, setSingleNumber] = useState("");
  const [singleType, setSingleType] = useState<UnitType | "">("");
  const [singleRent, setSingleRent] = useState("");
  const [singleDeposit, setSingleDeposit] = useState("");
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);
    if (!singleNumber.trim()) {
      setSingleError("Unit number is required.");
      return;
    }
    setSingleSubmitting(true);
    const body = {
      unitNumber: singleNumber.trim(),
      ...(singleType && { type: singleType }),
      ...(singleRent.trim() !== "" && { rentAmount: parseFloat(singleRent) || 0 }),
      ...(singleDeposit.trim() !== "" && { depositAmount: parseFloat(singleDeposit) }),
    };
    api.units
      .createAtProperty(propertyId, body)
      .then(() => {
        setSingleNumber("");
        setSingleType("");
        setSingleRent("");
        setSingleDeposit("");
        setShowSingle(false);
        fetchUnits();
      })
      .catch((err) => {
        setSingleError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => setSingleSubmitting(false));
  };

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
    api.units
      .delete(unitId)
      .then(() => fetchUnits())
      .finally(() => setDeletingId(null));
  };

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties">← Properties</Link>
          </Button>
        </div>
        <h2 className="mb-2 text-lg font-semibold">
          {propertyName ? `${propertyName} — Units` : "Units"}
        </h2>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && units && units.length === 0 && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              No units yet. Add units in bulk or one at a time.
            </p>
            {bulkSuccess && bulkSuccess.length > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Created: {bulkSuccess.join(", ")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={showBulk ? "secondary" : "default"}
                onClick={() => {
                  setShowBulk(!showBulk);
                  setShowSingle(false);
                  setBulkError(null);
                  setBulkSuccess(null);
                }}
              >
                Bulk add units
              </Button>
              <Button
                size="sm"
                variant={showSingle ? "secondary" : "outline"}
                onClick={() => {
                  setShowSingle(!showSingle);
                  setShowBulk(false);
                  setSingleError(null);
                }}
              >
                Add one unit
              </Button>
            </div>

            {showBulk && (
              <form
                onSubmit={handleBulkSubmit}
                className="max-w-md space-y-3 rounded-md border border-border bg-muted/30 p-4"
              >
                <h3 className="font-medium">Bulk add</h3>
                <div>
                  <label htmlFor="bulk-count" className="mb-1 block text-sm">
                    Count (1–500) <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="bulk-count"
                    type="number"
                    min={1}
                    max={500}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(e.target.value)}
                    className={inputClassName}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="bulk-prefix" className="mb-1 block text-sm">
                      Unit number prefix
                    </label>
                    <input
                      id="bulk-prefix"
                      type="text"
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      className={inputClassName}
                      placeholder='e.g. "A" → A1, A2'
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-start" className="mb-1 block text-sm">
                      Start number
                    </label>
                    <input
                      id="bulk-start"
                      type="number"
                      min={0}
                      value={bulkStart}
                      onChange={(e) => setBulkStart(e.target.value)}
                      className={inputClassName}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="bulk-type" className="mb-1 block text-sm">
                    Default type
                  </label>
                  <select
                    id="bulk-type"
                    value={bulkType}
                    onChange={(e) => setBulkType((e.target.value || "") as UnitType | "")}
                    className={inputClassName}
                  >
                    <option value="">—</option>
                    {UNIT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {UNIT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="bulk-rent" className="mb-1 block text-sm">
                      Default rent
                    </label>
                    <input
                      id="bulk-rent"
                      type="number"
                      min={0}
                      step="any"
                      value={bulkRent}
                      onChange={(e) => setBulkRent(e.target.value)}
                      className={inputClassName}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-deposit" className="mb-1 block text-sm">
                      Default deposit
                    </label>
                    <input
                      id="bulk-deposit"
                      type="number"
                      min={0}
                      step="any"
                      value={bulkDeposit}
                      onChange={(e) => setBulkDeposit(e.target.value)}
                      className={inputClassName}
                      placeholder="0"
                    />
                  </div>
                </div>
                {bulkError && (
                  <p className="text-sm text-destructive" role="alert">
                    {bulkError}
                  </p>
                )}
                <Button type="submit" size="sm" disabled={bulkSubmitting}>
                  {bulkSubmitting ? "Creating…" : "Create units"}
                </Button>
              </form>
            )}

            {showSingle && (
              <form
                onSubmit={handleSingleSubmit}
                className="max-w-md space-y-3 rounded-md border border-border bg-muted/30 p-4"
              >
                <h3 className="font-medium">Add one unit</h3>
                <div>
                  <label htmlFor="single-number" className="mb-1 block text-sm">
                    Unit number <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="single-number"
                    type="text"
                    value={singleNumber}
                    onChange={(e) => setSingleNumber(e.target.value)}
                    className={inputClassName}
                    placeholder="e.g. 101"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="single-type" className="mb-1 block text-sm">
                    Type
                  </label>
                  <select
                    id="single-type"
                    value={singleType}
                    onChange={(e) => setSingleType((e.target.value || "") as UnitType | "")}
                    className={inputClassName}
                  >
                    <option value="">—</option>
                    {UNIT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {UNIT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="single-rent" className="mb-1 block text-sm">
                      Rent
                    </label>
                    <input
                      id="single-rent"
                      type="number"
                      min={0}
                      step="any"
                      value={singleRent}
                      onChange={(e) => setSingleRent(e.target.value)}
                      className={inputClassName}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="single-deposit" className="mb-1 block text-sm">
                      Deposit
                    </label>
                    <input
                      id="single-deposit"
                      type="number"
                      min={0}
                      step="any"
                      value={singleDeposit}
                      onChange={(e) => setSingleDeposit(e.target.value)}
                      className={inputClassName}
                      placeholder="0"
                    />
                  </div>
                </div>
                {singleError && (
                  <p className="text-sm text-destructive" role="alert">
                    {singleError}
                  </p>
                )}
                <Button type="submit" size="sm" disabled={singleSubmitting}>
                  {singleSubmitting ? "Saving…" : "Add unit"}
                </Button>
              </form>
            )}
          </div>
        )}

        {!loading && !error && units && units.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowBulk(true);
                  setShowSingle(false);
                }}
              >
                Bulk add more
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowSingle(true);
                  setShowBulk(false);
                }}
              >
                Add one unit
              </Button>
            </div>
            <ul className="divide-y divide-border rounded-md border border-border">
              {units.map((u) => (
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{u.unitNumber}</span>
                        {u.type && (
                          <span className="text-muted-foreground text-sm">
                            {UNIT_TYPE_LABELS[u.type as UnitType] ?? u.type}
                          </span>
                        )}
                        {u.rentAmount != null && (
                          <span className="text-sm">
                            Rent: {typeof u.rentAmount === "number" ? u.rentAmount : String(u.rentAmount)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(u)}
                        >
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
          </div>
        )}
      </Container>
    </RequireOrganization>
  );
}
