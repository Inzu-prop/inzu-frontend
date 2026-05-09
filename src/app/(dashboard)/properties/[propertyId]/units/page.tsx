"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

const STATUS_STYLES: Record<string, string> = {
  occupied: "bg-[#90B494]/20 text-[#32533D] dark:bg-[#90B494]/15 dark:text-[#90B494]",
  vacant: "bg-muted text-muted-foreground",
  maintenance: "bg-[#825D42]/15 text-[#825D42]",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);
}

function normalizeUnitsResponse(res: unknown): Unit[] {
  if (Array.isArray(res)) return res as Unit[];
  if (res && typeof res === "object" && "units" in res && Array.isArray((res as { units: unknown }).units))
    return (res as { units: Unit[] }).units;
  return [];
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type AddMode = "bulk" | "single" | null;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
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
      .catch((err) => setError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [api.units, api.properties, organizationId, propertyId]);

  useEffect(() => {
    if (organizationId) fetchUnits();
    else setLoading(false);
  }, [organizationId, fetchUnits]);

  // Add mode
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string[] | null>(null);

  // Bulk-add form
  const [bulkCount, setBulkCount] = useState("10");
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkStart, setBulkStart] = useState("1");
  const [bulkType, setBulkType] = useState<UnitType | "">("");
  const [bulkAddRent, setBulkAddRent] = useState("");
  const [bulkAddDeposit, setBulkAddDeposit] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkAddError, setBulkAddError] = useState<string | null>(null);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkAddError(null);
    const count = parseInt(bulkCount, 10);
    if (count < 1 || count > 500) { setBulkAddError("Count must be 1–500."); return; }
    setBulkSubmitting(true);
    api.units
      .createBulk(propertyId, {
        count,
        ...(bulkPrefix.trim() && { unitNumberPrefix: bulkPrefix.trim() }),
        ...(bulkStart.trim() && { unitNumberStart: parseInt(bulkStart, 10) }),
        ...(bulkType && { defaultType: bulkType }),
        ...(bulkAddRent.trim() !== "" && { defaultRent: parseFloat(bulkAddRent) || 0 }),
        ...(bulkAddDeposit.trim() !== "" && { defaultDeposit: parseFloat(bulkAddDeposit) }),
      })
      .then((res) => {
        setBulkSuccess(res.unitNumbers ?? []);
        setAddMode(null);
        fetchUnits();
      })
      .catch((err) => setBulkAddError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setBulkSubmitting(false));
  };

  // Single form
  const [singleNumber, setSingleNumber] = useState("");
  const [singleType, setSingleType] = useState<UnitType | "">("");
  const [singleRent, setSingleRent] = useState("");
  const [singleDeposit, setSingleDeposit] = useState("");
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);
    if (!singleNumber.trim()) { setSingleError("Unit number is required."); return; }
    setSingleSubmitting(true);
    api.units
      .createAtProperty(propertyId, {
        unitNumber: singleNumber.trim(),
        ...(singleType && { type: singleType }),
        ...(singleRent.trim() !== "" && { rentAmount: parseFloat(singleRent) || 0 }),
        ...(singleDeposit.trim() !== "" && { depositAmount: parseFloat(singleDeposit) }),
      })
      .then(() => {
        setSingleNumber(""); setSingleType(""); setSingleRent(""); setSingleDeposit("");
        setAddMode(null);
        fetchUnits();
      })
      .catch((err) => setSingleError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setSingleSubmitting(false));
  };

  // Single-row edit / delete
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRent, setEditRent] = useState("");
  const [editType, setEditType] = useState<UnitType | "">("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = units?.map((u) => u._id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEdit = (u: Unit) => {
    setEditingId(u._id);
    setEditRent(u.rentAmount != null ? String(u.rentAmount) : "");
    setEditType((u.type as UnitType) ?? "");
    setSelected(new Set());
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

  // Bulk edit rent modal
  const [showEditRentModal, setShowEditRentModal] = useState(false);
  const [bulkRent, setBulkRent] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const rentInputRef = useRef<HTMLInputElement>(null);

  const openEditRentModal = () => {
    setBulkRent("");
    setBulkResult(null);
    setShowEditRentModal(true);
    setTimeout(() => rentInputRef.current?.focus(), 50);
  };

  const handleBulkEditRent = async (e: React.FormEvent) => {
    e.preventDefault();
    const rent = parseFloat(bulkRent);
    if (isNaN(rent) || rent < 0) return;
    setBulkUpdating(true);
    const idsSnapshot = Array.from(selected);
    try {
      const payload = idsSnapshot.map((unitId) => ({ unitId, rentAmount: rent }));
      const res = await api.units.bulkUpdate({ units: payload });
      const failCount = res.failed?.length ?? 0;
      const successCount = res.updated?.length ?? 0;
      if (failCount > 0) {
        const failedLabels = res.failed
          .map((f) => {
            const unit = units?.find((u) => u._id === f.unitId);
            return unit?.unitNumber ?? f.unitId;
          })
          .join(", ");
        setBulkResult(`${successCount} updated, ${failCount} failed: ${failedLabels}`);
      } else {
        setShowEditRentModal(false);
        setSelected(new Set());
        fetchUnits();
      }
    } catch (err) {
      setBulkResult(err instanceof ApiError ? err.message : String(err));
    } finally {
      setBulkUpdating(false);
    }
  };

  // Bulk delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<string | null>(null);

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const idsSnapshot = Array.from(selected);
    try {
      const res = await api.units.bulkDelete({ unitIds: idsSnapshot });
      const failCount = res.failed?.length ?? 0;
      if (failCount > 0) {
        const failedLabels = res.failed
          .map((f) => {
            const unit = units?.find((u) => u._id === f.unitId);
            return unit?.unitNumber ?? f.unitId;
          })
          .join(", ");
        setBulkDeleteResult(`${res.deleted} deleted, ${failCount} failed: ${failedLabels}`);
      } else {
        setShowDeleteModal(false);
        setSelected(new Set());
        fetchUnits();
      }
    } catch (err) {
      setBulkDeleteResult(err instanceof ApiError ? err.message : String(err));
    } finally {
      setBulkDeleting(false);
    }
  };

  const occupied = units?.filter((u) => u.status === "occupied").length ?? 0;
  const vacant = units?.filter((u) => u.status === "vacant").length ?? 0;

  return (
    <RequireOrganization>
      <Container className="py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties">← Properties</Link>
          </Button>
          {propertyName && (
            <>
              <span className="text-muted-foreground">/</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/properties/${propertyId}`}>{propertyName}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {propertyName ? `${propertyName} — Units` : "Units"}
            </h1>
            {units && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {units.length} {units.length === 1 ? "unit" : "units"}
                {occupied > 0 && ` · ${occupied} occupied`}
                {vacant > 0 && ` · ${vacant} vacant`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={addMode === "single" ? "secondary" : "outline"}
              onClick={() => setAddMode(addMode === "single" ? null : "single")}
            >
              Add one unit
            </Button>
            <Button
              size="sm"
              variant={addMode === "bulk" ? "secondary" : "default"}
              onClick={() => setAddMode(addMode === "bulk" ? null : "bulk")}
            >
              Bulk add
            </Button>
          </div>
        </div>

        {bulkSuccess && bulkSuccess.length > 0 && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Created {bulkSuccess.length} units: {bulkSuccess.slice(0, 8).join(", ")}
            {bulkSuccess.length > 8 && ` and ${bulkSuccess.length - 8} more`}
          </p>
        )}

        {/* Add forms */}
        {addMode === "bulk" && (
          <form
            onSubmit={handleBulkSubmit}
            className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 max-w-lg"
          >
            <h3 className="font-semibold">Bulk add units</h3>
            <div>
              <label htmlFor="bulk-count" className="mb-1 block text-sm font-medium">
                Count (1–500) <span className="text-destructive">*</span>
              </label>
              <input id="bulk-count" type="number" min={1} max={500} value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)} className={inputCls} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bulk-prefix" className="mb-1 block text-sm font-medium">Prefix</label>
                <input id="bulk-prefix" type="text" value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)} className={inputCls} placeholder='e.g. "A" → A1, A2' />
              </div>
              <div>
                <label htmlFor="bulk-start" className="mb-1 block text-sm font-medium">Start number</label>
                <input id="bulk-start" type="number" min={0} value={bulkStart}
                  onChange={(e) => setBulkStart(e.target.value)} className={inputCls} placeholder="1" />
              </div>
            </div>
            <div>
              <label htmlFor="bulk-type" className="mb-1 block text-sm font-medium">Default type</label>
              <select id="bulk-type" value={bulkType}
                onChange={(e) => setBulkType((e.target.value || "") as UnitType | "")} className={inputCls}>
                <option value="">—</option>
                {UNIT_TYPES.map((t) => <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bulk-rent" className="mb-1 block text-sm font-medium">Default rent</label>
                <input id="bulk-rent" type="number" min={0} step="any" value={bulkAddRent}
                  onChange={(e) => setBulkAddRent(e.target.value)} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label htmlFor="bulk-deposit" className="mb-1 block text-sm font-medium">Default deposit</label>
                <input id="bulk-deposit" type="number" min={0} step="any" value={bulkAddDeposit}
                  onChange={(e) => setBulkAddDeposit(e.target.value)} className={inputCls} placeholder="0" />
              </div>
            </div>
            {bulkAddError && <p className="text-sm text-destructive" role="alert">{bulkAddError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={bulkSubmitting}>
                {bulkSubmitting ? "Creating…" : "Create units"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddMode(null)}>Cancel</Button>
            </div>
          </form>
        )}

        {addMode === "single" && (
          <form
            onSubmit={handleSingleSubmit}
            className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 max-w-lg"
          >
            <h3 className="font-semibold">Add one unit</h3>
            <div>
              <label htmlFor="single-number" className="mb-1 block text-sm font-medium">
                Unit number <span className="text-destructive">*</span>
              </label>
              <input id="single-number" type="text" value={singleNumber}
                onChange={(e) => setSingleNumber(e.target.value)} className={inputCls} placeholder="e.g. 101" required />
            </div>
            <div>
              <label htmlFor="single-type" className="mb-1 block text-sm font-medium">Type</label>
              <select id="single-type" value={singleType}
                onChange={(e) => setSingleType((e.target.value || "") as UnitType | "")} className={inputCls}>
                <option value="">—</option>
                {UNIT_TYPES.map((t) => <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="single-rent" className="mb-1 block text-sm font-medium">Rent</label>
                <input id="single-rent" type="number" min={0} step="any" value={singleRent}
                  onChange={(e) => setSingleRent(e.target.value)} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label htmlFor="single-deposit" className="mb-1 block text-sm font-medium">Deposit</label>
                <input id="single-deposit" type="number" min={0} step="any" value={singleDeposit}
                  onChange={(e) => setSingleDeposit(e.target.value)} className={inputCls} placeholder="0" />
              </div>
            </div>
            {singleError && <p className="text-sm text-destructive" role="alert">{singleError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={singleSubmitting}>
                {singleSubmitting ? "Saving…" : "Add unit"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddMode(null)}>Cancel</Button>
            </div>
          </form>
        )}

        {/* Bulk-action toolbar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={openEditRentModal}>
                Edit Rent
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive border-destructive/40"
                onClick={() => { setBulkDeleteResult(null); setShowDeleteModal(true); }}
              >
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md border border-border bg-muted/30" />
            ))}
          </div>
        )}
        {error && <p className="text-destructive" role="alert">{error}</p>}

        {!loading && !error && units && units.length === 0 && addMode === null && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No units yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add units in bulk or one at a time.</p>
          </div>
        )}

        {!loading && !error && units && units.length > 0 && (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleAll}
                      aria-label="Select all units"
                      className="h-4 w-4 cursor-pointer rounded border-input accent-[#32533D]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Rent</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Deposit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {units.map((u) => (
                  <tr
                    key={u._id}
                    className={`hover:bg-muted/30 transition-colors ${selected.has(u._id) ? "bg-[#32533D]/5" : ""}`}
                  >
                    {editingId === u._id ? (
                      <>
                        <td className="px-3 py-2" />
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
                              style={{ width: 150 }}
                            >
                              <option value="">— Type —</option>
                              {UNIT_TYPES.map((t) => (
                                <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>
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
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(u._id)}
                            onChange={() => toggleOne(u._id)}
                            aria-label={`Select unit ${u.unitNumber}`}
                            className="h-4 w-4 cursor-pointer rounded border-input accent-[#32533D]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/units/${u._id}`} className="font-medium text-primary hover:underline">
                            {u.unitNumber}
                          </Link>
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

      {/* Edit Rent Modal */}
      {showEditRentModal && (
        <Modal title={`Set rent for ${selected.size} unit${selected.size === 1 ? "" : "s"}`} onClose={() => setShowEditRentModal(false)}>
          <form onSubmit={handleBulkEditRent} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">New rent amount (KES)</label>
              <input
                ref={rentInputRef}
                type="number"
                min={0}
                step="any"
                value={bulkRent}
                onChange={(e) => setBulkRent(e.target.value)}
                className={inputCls}
                placeholder="e.g. 15000"
                required
              />
            </div>
            {bulkResult && (
              <p className="text-sm text-destructive">{bulkResult}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowEditRentModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={bulkUpdating || !bulkRent}>
                {bulkUpdating ? "Saving…" : "Apply"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal title="Delete units?" onClose={() => setShowDeleteModal(false)}>
          <p className="mb-4 text-sm text-muted-foreground">
            You are about to delete <strong>{selected.size} unit{selected.size === 1 ? "" : "s"}</strong>. This cannot be undone.
          </p>
          {bulkDeleteResult && (
            <p className="mb-4 text-sm text-destructive">{bulkDeleteResult}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
            >
              {bulkDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </RequireOrganization>
  );
}
