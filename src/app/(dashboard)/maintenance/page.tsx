"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

export default function MaintenancePage() {
  const api = useInzuApi();
  const [data, setData] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.maintenance
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
  }, [api.maintenance]);

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <Button size="sm">New ticket</Button>
        </div>
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data && data.length === 0 && (
          <p className="text-muted-foreground">No maintenance tickets yet.</p>
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {(data as { id?: string; title?: string; status?: string }[]).map(
              (item) => (
                <li
                  key={item.id ?? String(item)}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="font-medium">
                    {(item as { title?: string }).title ?? "Ticket"}
                  </span>
                  <span className="text-muted-foreground">
                    {(item as { status?: string }).status ?? ""}
                  </span>
                </li>
              ),
            )}
          </ul>
        )}
      </Container>
    </RequireOrganization>
  );
}
