"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Property, PropertyStatus, PropertyType, UpdatePropertyBody } from "@/lib/api";
import { ApiError } from "@/lib/api";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  active: "bg-[#90B494]/20 text-[#32533D] dark:bg-[#90B494]/15 dark:text-[#90B494]",
  inactive: "bg-muted text-muted-foreground",
  under_construction: "bg-[#825D42]/15 text-[#825D42] dark:bg-[#825D42]/20 dark:text-[#825D42]",
  for_sale: "bg-foreground/8 text-foreground/70",
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

const PROPERTY_TYPES: PropertyType[] = ["apartment", "house", "commercial", "mixed_use", "land"];
const PROPERTY_STATUSES: PropertyStatus[] = ["active", "inactive", "under_construction", "for_sale"];

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

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organizationId } = useCurrentOrganizationId();
  const api = useInzuApi();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<PropertyType>("apartment");
  const [editStatus, setEditStatus] = useState<PropertyStatus>("active");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPostal, setEditPostal] = useState("");
  const [editYearBuilt, setEditYearBuilt] = useState("");
  const [editFloors, setEditFloors] = useState("");
  const [editTotalUnits, setEditTotalUnits] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState(false);

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

  function startEdit() {
    if (!property) return;
    setEditName(property.name);
    setEditType(property.type);
    setEditStatus(property.status);
    setEditStreet(property.address.street ?? "");
    setEditCity(property.address.city ?? "");
    setEditState(property.address.state ?? "");
    setEditCountry(property.address.country ?? "");
    setEditPostal(property.address.postalCode ?? "");
    setEditYearBuilt(property.yearBuilt != null ? String(property.yearBuilt) : "");
    setEditFloors(property.totalFloors != null ? String(property.totalFloors) : "");
    setEditTotalUnits(property.totalUnits != null ? String(property.totalUnits) : "");
    setEditNotes(property.notes ?? "");
    setEditError(null);
    setEditing(true);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) { setEditError("Name is required."); return; }
    if (!editCity.trim()) { setEditError("City is required."); return; }
    if (!editCountry.trim()) { setEditError("Country is required."); return; }
    setEditSubmitting(true);
    setEditError(null);
    const body: UpdatePropertyBody = {
      name: editName.trim(),
      type: editType,
      status: editStatus,
      address: {
        city: editCity.trim(),
        country: editCountry.trim(),
        ...(editStreet.trim() && { street: editStreet.trim() }),
        ...(editState.trim() && { state: editState.trim() }),
        ...(editPostal.trim() && { postalCode: editPostal.trim() }),
      },
      ...(editYearBuilt.trim() !== "" && { yearBuilt: parseInt(editYearBuilt, 10) }),
      ...(editFloors.trim() !== "" && { totalFloors: parseInt(editFloors, 10) }),
      ...(editTotalUnits.trim() !== "" && { totalUnits: parseInt(editTotalUnits, 10) }),
      notes: editNotes.trim() || undefined,
    };
    api.properties
      .update(propertyId, body)
      .then((res) => {
        setProperty(res.property);
        setEditing(false);
      })
      .catch((err) => setEditError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setEditSubmitting(false));
  }

  function handleDelete() {
    if (!confirm(`Delete "${property?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    api.properties
      .delete(propertyId)
      .then(() => router.push("/properties"))
      .catch((err) => {
        alert(err instanceof ApiError ? err.message : String(err));
        setDeleting(false);
      });
  }

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

        {!loading && !error && property && !editing && (
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
                <Button size="sm" variant="outline" onClick={startEdit}>Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="flex flex-wrap gap-4">
              {property.totalUnits != null && (
                <div className="flex-1 min-w-[120px] rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{property.totalUnits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total units</p>
                </div>
              )}
              {property.totalFloors != null && (
                <div className="flex-1 min-w-[120px] rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{property.totalFloors}</p>
                  <p className="text-xs text-muted-foreground mt-1">Floors</p>
                </div>
              )}
              {property.yearBuilt != null && (
                <div className="flex-1 min-w-[120px] rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{property.yearBuilt}</p>
                  <p className="text-xs text-muted-foreground mt-1">Year built</p>
                </div>
              )}
              {property.purchasePrice != null && (
                <div className="flex-1 min-w-[140px] rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{formatCurrency(property.purchasePrice)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Purchase price</p>
                </div>
              )}
              {property.currentValue != null && (
                <div className="flex-1 min-w-[140px] rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold">{formatCurrency(property.currentValue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current value</p>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Details */}
              <section className="rounded-lg border border-border bg-card p-5">
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
              <section className="rounded-lg border border-border bg-card p-5">
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
              <section className="rounded-lg border border-border bg-card p-5">
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

        {/* Edit form */}
        {!loading && !error && property && editing && (
          <form onSubmit={handleEditSubmit} className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit property</h2>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Basic info</h3>

              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-type" className="mb-1 block text-sm font-medium">Type</label>
                  <select
                    id="edit-type"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as PropertyType)}
                    className={inputCls}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-status" className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PropertyStatus)}
                    className={inputCls}
                  >
                    {PROPERTY_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="edit-units" className="mb-1 block text-sm font-medium">Total units</label>
                  <input
                    id="edit-units"
                    type="number"
                    min={0}
                    value={editTotalUnits}
                    onChange={(e) => setEditTotalUnits(e.target.value)}
                    className={inputCls}
                    placeholder="—"
                  />
                </div>
                <div>
                  <label htmlFor="edit-floors" className="mb-1 block text-sm font-medium">Floors</label>
                  <input
                    id="edit-floors"
                    type="number"
                    min={0}
                    value={editFloors}
                    onChange={(e) => setEditFloors(e.target.value)}
                    className={inputCls}
                    placeholder="—"
                  />
                </div>
                <div>
                  <label htmlFor="edit-year" className="mb-1 block text-sm font-medium">Year built</label>
                  <input
                    id="edit-year"
                    type="number"
                    min={1800}
                    max={2100}
                    value={editYearBuilt}
                    onChange={(e) => setEditYearBuilt(e.target.value)}
                    className={inputCls}
                    placeholder="—"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Address</h3>

              <div>
                <label htmlFor="edit-street" className="mb-1 block text-sm font-medium">Street</label>
                <input
                  id="edit-street"
                  type="text"
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                  className={inputCls}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-city" className="mb-1 block text-sm font-medium">
                    City <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="edit-city"
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-state" className="mb-1 block text-sm font-medium">State / County</label>
                  <input
                    id="edit-state"
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-country" className="mb-1 block text-sm font-medium">
                    Country <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="edit-country"
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-postal" className="mb-1 block text-sm font-medium">Postal code</label>
                  <input
                    id="edit-postal"
                    type="text"
                    value={editPostal}
                    onChange={(e) => setEditPostal(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className={inputCls}
                rows={4}
                placeholder="Optional notes about this property…"
              />
            </div>

            {editError && <p className="text-sm text-destructive" role="alert">{editError}</p>}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={editSubmitting}>
                {editSubmitting ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Container>
    </RequireOrganization>
  );
}
