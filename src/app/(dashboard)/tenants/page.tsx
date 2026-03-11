"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  unitId?: string;
  propertyId?: string;
  monthlyRent?: number;
};

function normalizeUnitsResponse(res: unknown): Unit[] {
  if (Array.isArray(res)) return res as Unit[];
  if (
    res &&
    typeof res === "object" &&
    "units" in res &&
    Array.isArray((res as { units: unknown }).units)
  ) {
    return (res as { units: Unit[] }).units;
  }
  return [];
}

function normalizeTenantsResponse(res: unknown): TenantItem[] {
  let list: unknown[] = [];
  if (Array.isArray(res)) {
    list = res;
  } else if (
    res &&
    typeof res === "object" &&
    "tenants" in res &&
    Array.isArray((res as { tenants: unknown }).tenants)
  ) {
    list = (res as { tenants: unknown[] }).tenants;
  } else if (
    res &&
    typeof res === "object" &&
    "data" in res &&
    Array.isArray((res as { data: unknown }).data)
  ) {
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

export default function TenantsPage() {
  const api = useInzuApi();
  const { organizationId } = useCurrentOrganizationId();
  const [data, setData] = useState<TenantItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitingTenantId, setInvitingTenantId] = useState<string | null>(null);
  const [tenantIdsWithAccess, setTenantIdsWithAccess] = useState<Set<string>>(
    () => new Set(),
  );
  const [inviteMessage, setInviteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [invitePopoverOpen, setInvitePopoverOpen] = useState<string | null>(
    null,
  );
  const [redirectUrl, setRedirectUrl] = useState("");
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [addTenantFirstName, setAddTenantFirstName] = useState("");
  const [addTenantLastName, setAddTenantLastName] = useState("");
  const [addTenantEmail, setAddTenantEmail] = useState("");
  const [addTenantPhone, setAddTenantPhone] = useState("");
  const [addTenantSubmitting, setAddTenantSubmitting] = useState(false);
  const [addTenantError, setAddTenantError] = useState<string | null>(null);
  const [unitsById, setUnitsById] = useState<Record<string, Unit>>({});
  const [assignTenantId, setAssignTenantId] = useState<string | null>(null);
  const [assignSelectedUnitId, setAssignSelectedUnitId] = useState<string>("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const fetchTenants = useCallback(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.tenants
      .list()
      .then((res) => {
        // eslint-disable-next-line no-console
        console.log("Raw tenants response:", JSON.stringify(res, null, 2));
        const normalized = normalizeTenantsResponse(res);
        // eslint-disable-next-line no-console
        console.log("Normalized tenants info:", JSON.stringify(normalized, null, 2));
        setData(normalized);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [api.tenants, organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchTenants();
    } else {
      setLoading(false);
    }
  }, [organizationId, fetchTenants]);

  useEffect(() => {
    if (!organizationId) return;
    api.units
      .list()
      .then((res) => {
        const units = normalizeUnitsResponse(res);
        const map: Record<string, Unit> = {};
        for (const u of units) {
          map[u._id] = u;
        }
        setUnitsById(map);
      })
      .catch(() => {
        // Ignore unit loading errors for now; assignment UI will just have no options
      });
  }, [api.units, organizationId]);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = addTenantFirstName.trim();
    const phoneNumber = addTenantPhone.trim();
    if (!firstName) {
      setAddTenantError("First name is required");
      return;
    }
    if (!phoneNumber) {
      setAddTenantError("Phone number is required");
      return;
    }
    setAddTenantError(null);
    setAddTenantSubmitting(true);
    api.tenants
      .create({
        firstName,
        lastName: addTenantLastName.trim() || undefined,
        email: addTenantEmail.trim() || undefined,
        phoneNumber,
      })
      .then(() => {
        setAddTenantOpen(false);
        setAddTenantFirstName("");
        setAddTenantLastName("");
        setAddTenantEmail("");
        setAddTenantPhone("");
        fetchTenants();
      })
      .catch((err) => {
        setAddTenantError(
          err instanceof ApiError ? err.message : String(err),
        );
      })
      .finally(() => setAddTenantSubmitting(false));
  };

  const sendPortalInvite = (tenant: TenantItem, customRedirectUrl?: string) => {
    const tenantId = tenant.id;
    if (!tenantId) return;
    setInvitingTenantId(tenantId);
    setInviteMessage(null);
    const url = customRedirectUrl?.trim();
    const body = url ? { redirectUrl: url } : undefined;
    api.tenants
      .sendPortalInvite(tenantId, body)
      .then((res) => {
        if (res.alreadyHasAccess) {
          setTenantIdsWithAccess((prev) => new Set(prev).add(tenantId));
          setInviteMessage({
            type: "success",
            text: "Tenant already has portal access",
          });
        } else {
          const email = tenant.email ?? "the tenant";
          setInviteMessage({
            type: "success",
            text: `Invitation sent to ${email}. They will receive an email to set their password.`,
          });
        }
        setInvitePopoverOpen(null);
        setRedirectUrl("");
      })
      .catch((err) => {
        setInviteMessage({
          type: "error",
          text: err instanceof ApiError ? err.message : String(err),
        });
      })
      .finally(() => setInvitingTenantId(null));
  };

  const handleOpenAssignUnit = (tenant: TenantItem) => {
    const tenantId = tenant.id ?? tenant._id;
    if (!tenantId) return;
    const currentUnitId = tenant.unitId ?? "";
    setAssignTenantId(tenantId);
    setAssignSelectedUnitId(currentUnitId);
  };

  const handleSaveAssignUnit = () => {
    if (!assignTenantId) return;
    setAssignSubmitting(true);
    const body: { unitId: string | null } = {
      unitId: assignSelectedUnitId || null,
    };
    api.tenants
      .update(assignTenantId, body)
      .then(() => {
        setAssignTenantId(null);
        setAssignSelectedUnitId("");
        fetchTenants();
      })
      .catch((err) => {
        setInviteMessage({
          type: "error",
          text: err instanceof ApiError ? err.message : String(err),
        });
      })
      .finally(() => setAssignSubmitting(false));
  };

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tenants</h2>
          <Popover
            open={addTenantOpen}
            onOpenChange={(open) => {
              setAddTenantOpen(open);
              if (!open) setAddTenantError(null);
            }}
          >
            <PopoverTrigger asChild>
              <Button size="sm">Add tenant</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <h3 className="mb-3 font-medium">Add tenant</h3>
              <form onSubmit={handleAddTenant}>
                <label className="mb-1 block text-sm font-medium">
                  First name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  value={addTenantFirstName}
                  onChange={(e) => setAddTenantFirstName(e.target.value)}
                  className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <label className="mb-1 block text-sm font-medium">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={addTenantLastName}
                  onChange={(e) => setAddTenantLastName(e.target.value)}
                  className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <label className="mb-1 block text-sm font-medium">
                  Phone number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={addTenantPhone}
                  onChange={(e) => setAddTenantPhone(e.target.value)}
                  className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="tenant@example.com"
                  value={addTenantEmail}
                  onChange={(e) => setAddTenantEmail(e.target.value)}
                  className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {addTenantError && (
                  <p className="mb-2 text-sm text-destructive" role="alert">
                    {addTenantError}
                  </p>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={addTenantSubmitting}
                >
                  {addTenantSubmitting ? "Adding…" : "Add tenant"}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
        {inviteMessage && (
          <p
            className={
              inviteMessage.type === "error"
                ? "mb-4 text-destructive"
                : "mb-4 text-muted-foreground"
            }
            role="alert"
          >
            {inviteMessage.text}
          </p>
        )}
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data && data.length === 0 && (
          <p className="text-muted-foreground">No tenants yet.</p>
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.map((item) => {
              const tenantId = item.id ?? String(item);
              const hasAccess = tenantIdsWithAccess.has(tenantId);
              const isInviting = invitingTenantId === tenantId;
              const tenantUnitId = item.unitId;
              const assignedUnit = tenantUnitId ? unitsById[tenantUnitId] : undefined;
              return (
                <li
                  key={tenantId}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <Link
                      href={`/tenants/${tenantId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.name ?? "Tenant"}
                    </Link>
                    {item.email && (
                      <span className="ml-2 text-muted-foreground">
                        {item.email}
                      </span>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {assignedUnit
                        ? `Unit ${assignedUnit.unitNumber}`
                        : "Unassigned"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover
                      open={assignTenantId === tenantId}
                      onOpenChange={(open) => {
                        if (open) {
                          handleOpenAssignUnit(item);
                        } else {
                          setAssignTenantId(null);
                          setAssignSelectedUnitId("");
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" disabled={assignSubmitting}>
                          {assignedUnit ? "Change unit" : "Assign unit"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80">
                        <p className="mb-2 text-sm text-muted-foreground">
                          Assign this tenant to a unit. Setting it to
                          &ldquo;Unassigned&rdquo; will clear their unit.
                        </p>
                        <label className="mb-1 block text-sm font-medium">
                          Unit
                        </label>
                        <select
                          value={assignSelectedUnitId}
                          onChange={(e) => setAssignSelectedUnitId(e.target.value)}
                          className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Unassigned (no unit)</option>
                          {Object.values(unitsById).map((u) => (
                            <option key={u._id} value={u._id}>
                              {`Unit ${u.unitNumber}`}
                              {u.status === "OCCUPIED" ? " (occupied)" : ""}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={assignSubmitting}
                          onClick={handleSaveAssignUnit}
                        >
                          {assignSubmitting ? "Saving…" : "Save"}
                        </Button>
                      </PopoverContent>
                    </Popover>
                    {hasAccess ? (
                      <span className="text-sm text-muted-foreground">
                        Already has portal access
                      </span>
                    ) : (
                      <Popover
                        open={invitePopoverOpen === tenantId}
                        onOpenChange={(open) => {
                          setInvitePopoverOpen(open ? tenantId : null);
                          if (!open) setRedirectUrl("");
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isInviting}
                          >
                            {isInviting ? "Sending…" : "Invite to portal"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80">
                          <p className="mb-2 text-sm text-muted-foreground">
                            Send an invitation email so the tenant can set their
                            password and access the portal.
                          </p>
                          <label className="mb-1 block text-sm font-medium">
                            Redirect URL (optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={redirectUrl}
                            onChange={(e) => setRedirectUrl(e.target.value)}
                            className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={isInviting}
                            onClick={() =>
                              sendPortalInvite(item, redirectUrl || undefined)
                            }
                          >
                            {isInviting ? "Sending…" : "Send invite"}
                          </Button>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </RequireOrganization>
  );
}
