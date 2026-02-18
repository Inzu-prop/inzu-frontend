"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

export default function TenantsPage() {
  const api = useInzuApi();
  const [data, setData] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.tenants
      .list()
      .then((res) => {
        if (!cancelled) setData(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api.tenants]);

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tenants</h2>
          <Button size="sm">Add tenant</Button>
        </div>
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
            {(data as { id?: string; name?: string; email?: string }[]).map(
              (item) => (
                <li
                  key={item.id ?? String(item)}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="font-medium">
                      {(item as { name?: string }).name ?? "Tenant"}
                    </span>
                    {(item as { email?: string }).email && (
                      <span className="ml-2 text-muted-foreground">
                        {(item as { email?: string }).email}
                      </span>
                    )}
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </Container>
    </RequireOrganization>
  );
}
