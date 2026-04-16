"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { SkeletonList } from "@/components/inzu-skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { Unit } from "@/lib/api";
import { ApiError } from "@/lib/api";

type TenantItem = {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  unitId?: string;
  propertyId?: string;
  monthlyRent?: number;
  status?: string;
  arrears?: number;
  daysOverdue?: number;
};

function normalizeUnitsResponse(res: unknown): Unit[] {
  if (Array.isArray(res)) return res as Unit[];
  if (res && typeof res === "object" && "units" in res && Array.isArray((res as { units: unknown }).units)) {
    return (res as { units: Unit[] }).units;
  }
  return [];
}

function normalizeTenantsResponse(res: unknown): TenantItem[] {
  let list: unknown[] = [];
  if (Array.isArray(res)) {
    list = res;
  } else if (res && typeof res === "object" && "tenants" in res && Array.isArray((res as { tenants: unknown }).tenants)) {
    list = (res as { tenants: unknown[] }).tenants;
  } else if (res && typeof res === "object" && "data" in res && Array.isArray((res as { data: unknown }).data)) {
    list = (res as { data: unknown[] }).data;
  }
  return list.map((item) => {
    const t = item as Record<string, unknown>;
    return {
      ...t,
      id: (t.id ?? t._id) as string | undefined,
      name:
        (t.name as string | undefined) ??
        ([t.firstName, t.lastName].filter(Boolean).join(" ").trim() || undefined),
    } as TenantItem;
  });
}

function StatusChip({ status }: { status?: string }) {
  const s = status?.toLowerCase();
  let bg = "rgba(144,180,148,0.07)";
  let color = "rgba(245,247,246,0.45)";
  if (s === "active") { bg = "rgba(144,180,148,0.12)"; color = "#90B494"; }
  else if (s === "blacklisted") { bg = "rgba(226,32,38,0.10)"; color = "#E22026"; }
  else if (s === "inactive") { bg = "rgba(144,180,148,0.06)"; color = "rgba(245,247,246,0.35)"; }
  else if (s === "prospective") { bg = "rgba(130,93,66,0.10)"; color = "#825D42"; }

  return (
    <span style={{
      background: bg, color,
      fontSize: 10, fontWeight: 500, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "2px 8px", borderRadius: 20,
    }}>
      {status ?? "—"}
    </span>
  );
}

export default function TenantsPage() {
  const api = useInzuApi();
  const { organizationId } = useCurrentOrganizationId();
  const [data, setData] = useState<TenantItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [unitsById, setUnitsById] = useState<Record<string, Unit>>({});
  const [assignTenantId, setAssignTenantId] = useState<string | null>(null);
  const [assignSelectedUnitId, setAssignSelectedUnitId] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [statusTenantId, setStatusTenantId] = useState<string | null>(null);
  const [statusSelectedValue, setStatusSelectedValue] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const fetchTenants = useCallback(() => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.tenants
      .list()
      .then((res) => setData(normalizeTenantsResponse(res)))
      .catch((err) => setError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [api.tenants, organizationId]);

  useEffect(() => {
    if (organizationId) fetchTenants();
    else setLoading(false);
  }, [organizationId, fetchTenants]);

  useEffect(() => {
    if (!organizationId) return;
    api.units.list()
      .then((res) => {
        const units = normalizeUnitsResponse(res);
        const map: Record<string, Unit> = {};
        for (const u of units) map[u._id] = u;
        setUnitsById(map);
      })
      .catch(() => { /* unit load failure is non-critical */ });
  }, [api.units, organizationId]);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = addFirstName.trim();
    const phoneNumber = addPhone.trim();
    if (!firstName) { setAddError("First name is required"); return; }
    if (!phoneNumber) { setAddError("Phone number is required"); return; }
    setAddError(null);
    setAddSubmitting(true);
    api.tenants
      .create({ firstName, lastName: addLastName.trim() || undefined, email: addEmail.trim() || undefined, phoneNumber })
      .then((res) => {
        setAddOpen(false);
        setAddFirstName(""); setAddLastName(""); setAddEmail(""); setAddPhone("");
        fetchTenants();
        const { inviteSent, whatsappSent } = res ?? {};
        let msg = "Tenant added.";
        if (inviteSent && whatsappSent) msg = "Tenant added. Invitation sent via email and WhatsApp.";
        else if (inviteSent) msg = "Tenant added. Email invite sent.";
        else if (whatsappSent) msg = "Tenant added. WhatsApp invite sent.";
        setToast({ type: "success", text: msg });
      })
      .catch((err) => setAddError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setAddSubmitting(false));
  };

  const handleSaveAssignUnit = () => {
    if (!assignTenantId) return;
    setAssignSubmitting(true);
    api.tenants
      .update(assignTenantId, { unitId: assignSelectedUnitId || null })
      .then(() => { setAssignTenantId(null); setAssignSelectedUnitId(""); fetchTenants(); })
      .catch((err) => setToast({ type: "error", text: err instanceof ApiError ? err.message : String(err) }))
      .finally(() => setAssignSubmitting(false));
  };

  const handleSaveStatus = () => {
    if (!statusTenantId) return;
    setStatusSubmitting(true);
    api.tenants
      .update(statusTenantId, { status: statusSelectedValue })
      .then(() => { setStatusTenantId(null); setStatusSelectedValue(""); fetchTenants(); })
      .catch((err) => setToast({ type: "error", text: err instanceof ApiError ? err.message : String(err) }))
      .finally(() => setStatusSubmitting(false));
  };

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <RequireOrganization>
      <Container className="py-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Tenants</h1>
            {data && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.length} {data.length === 1 ? "tenant" : "tenants"}
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>Add tenant</Button>
        </div>

        {/* Search + status filter */}
        {data && data.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search tenants…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 200px", minWidth: 0, height: 34,
                borderRadius: 8, border: "1px solid rgba(144,180,148,0.15)",
                background: "rgba(144,180,148,0.05)", padding: "0 12px",
                fontSize: 13, outline: "none", color: "inherit",
              }}
            />
            <div className="flex gap-1 flex-wrap">
              {(["all", "active", "inactive", "prospective", "blacklisted"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    fontSize: 11, fontWeight: 500, letterSpacing: "0.04em",
                    padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer",
                    transition: "background 180ms ease, color 180ms ease",
                    background: statusFilter === s ? "rgba(144,180,148,0.18)" : "rgba(144,180,148,0.06)",
                    color: statusFilter === s ? "#90B494" : "rgba(245,247,246,0.45)",
                  }}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <p
            className={`mb-4 text-sm ${toast.type === "error" ? "text-destructive" : "text-muted-foreground"}`}
            role="alert"
          >
            {toast.text}
          </p>
        )}

        {loading && <SkeletonList rows={5} />}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {!loading && !error && data && data.length === 0 && (
          <div className="inzu-empty">
            <Users size={28} className="text-muted-foreground" style={{ opacity: 0.4 }} />
            <p className="text-sm text-muted-foreground">No tenants yet.</p>
            <button
              className="text-xs font-medium underline underline-offset-4"
              style={{ color: "#90B494" }}
              onClick={() => setAddOpen(true)}
            >
              Add your first tenant
            </button>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (() => {
          const q = search.toLowerCase();
          const filtered = data.filter((t) => {
            const matchesSearch = !q ||
              (t.name ?? "").toLowerCase().includes(q) ||
              (t.email ?? "").toLowerCase().includes(q) ||
              (t.phoneNumber ?? "").toLowerCase().includes(q);
            const matchesStatus = statusFilter === "all" || (t.status ?? "").toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
          });

          if (filtered.length === 0) {
            return <p className="text-sm text-muted-foreground">No tenants match your search.</p>;
          }

          return (
          <ul
            style={{
              borderRadius: 12,
              border: "1px solid rgba(144,180,148,0.10)",
              overflow: "hidden",
            }}
          >
            {filtered.map((item) => {
              const tenantId = item.id ?? String(item._id);
              const assignedUnit = item.unitId ? unitsById[item.unitId] : undefined;
              const hasArrears = item.arrears && item.arrears > 0;
              const isOverdue30 = item.daysOverdue && item.daysOverdue >= 30;

              return (
                <li key={tenantId} className="inzu-row flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  {/* Left: identity + context */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/tenants/${tenantId}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {item.name ?? "Tenant"}
                      </Link>
                      <StatusChip status={item.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {item.email && <span>{item.email}</span>}
                      {item.phoneNumber && <span>{item.phoneNumber}</span>}
                      {assignedUnit ? (
                        <span>Unit {assignedUnit.unitNumber}</span>
                      ) : (
                        <span style={{ color: "rgba(245,247,246,0.3)" }}>Unassigned</span>
                      )}
                      {item.monthlyRent != null && (
                        <span style={{ fontFeatureSettings: '"tnum"' }}>
                          KES {item.monthlyRent.toLocaleString()}/mo
                        </span>
                      )}
                      {hasArrears && (
                        <span style={{ color: isOverdue30 ? "#E22026" : "#825D42", fontWeight: 500 }}>
                          KES {(item.arrears ?? 0).toLocaleString()} overdue
                          {item.daysOverdue ? ` (${item.daysOverdue}d)` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Assign unit */}
                    <Popover
                      open={assignTenantId === tenantId}
                      onOpenChange={(open) => {
                        if (open) {
                          setAssignTenantId(tenantId);
                          setAssignSelectedUnitId(item.unitId ?? "");
                        } else {
                          setAssignTenantId(null);
                          setAssignSelectedUnitId("");
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" disabled={assignSubmitting}>
                          {assignedUnit ? "Unit" : "Assign"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <p className="mb-2 text-xs text-muted-foreground">
                          Assign to a unit. Clearing it removes the assignment.
                        </p>
                        <select
                          value={assignSelectedUnitId}
                          onChange={(e) => setAssignSelectedUnitId(e.target.value)}
                          className={`mb-3 ${inputClass}`}
                        >
                          <option value="">Unassigned</option>
                          {Object.values(unitsById).map((u) => (
                            <option key={u._id} value={u._id}>
                              Unit {u.unitNumber}{u.status === "OCCUPIED" ? " (occupied)" : ""}
                            </option>
                          ))}
                        </select>
                        <Button size="sm" className="w-full" disabled={assignSubmitting} onClick={handleSaveAssignUnit}>
                          {assignSubmitting ? "Saving…" : "Save"}
                        </Button>
                      </PopoverContent>
                    </Popover>

                    {/* Change status */}
                    <Popover
                      open={statusTenantId === tenantId}
                      onOpenChange={(open) => {
                        if (open) {
                          setStatusTenantId(tenantId);
                          setStatusSelectedValue(item.status ?? "active");
                        } else {
                          setStatusTenantId(null);
                          setStatusSelectedValue("");
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" disabled={statusSubmitting}>Status</Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-56">
                        <select
                          value={statusSelectedValue}
                          onChange={(e) => setStatusSelectedValue(e.target.value)}
                          className={`mb-3 ${inputClass}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blacklisted">Blacklisted</option>
                          <option value="prospective">Prospective</option>
                        </select>
                        <Button size="sm" className="w-full" disabled={statusSubmitting} onClick={handleSaveStatus}>
                          {statusSubmitting ? "Saving…" : "Save"}
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </li>
              );
            })}
          </ul>
          );
        })()}

        {/* Add tenant dialog */}
        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddError(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="mt-2 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">First name <span className="text-destructive">*</span></label>
                <input type="text" placeholder="First name" value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Last name</label>
                <input type="text" placeholder="Last name" value={addLastName} onChange={(e) => setAddLastName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone number <span className="text-destructive">*</span></label>
                <input type="tel" placeholder="+254 700 000 000" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input type="email" placeholder="tenant@example.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} className={inputClass} />
              </div>
              {addError && <p className="text-sm text-destructive" role="alert">{addError}</p>}
              <Button type="submit" size="sm" className="w-full mt-1" disabled={addSubmitting}>
                {addSubmitting ? "Adding…" : "Add tenant"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Container>
    </RequireOrganization>
  );
}
