"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

type TenantItem = { id?: string; name?: string; email?: string };

function normalizeTenantsResponse(res: unknown): TenantItem[] {
  if (!res || !Array.isArray(res)) return [];
  return res as TenantItem[];
}

export default function TenantsPage() {
  const api = useInzuApi();
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

  const fetchTenants = useCallback(() => {
    setLoading(true);
    setError(null);
    api.tenants
      .list()
      .then((res) => setData(normalizeTenantsResponse(res)))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [api.tenants]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

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
              return (
                <li
                  key={tenantId}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <span className="font-medium">
                      {item.name ?? "Tenant"}
                    </span>
                    {item.email && (
                      <span className="ml-2 text-muted-foreground">
                        {item.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
