"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

export default function PropertiesPage() {
  const api = useInzuApi();
  const [data, setData] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.properties
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
  }, [api.properties]);

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Button size="sm">Add property</Button>
        </div>
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data && data.length === 0 && (
          <p className="text-muted-foreground">No properties yet.</p>
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {(data as { id?: string; name?: string; address?: string }[]).map(
              (item) => (
                <li
                  key={item.id ?? String(item)}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="font-medium">
                      {(item as { name?: string }).name ?? "Property"}
                    </span>
                    {(item as { address?: string }).address && (
                      <span className="ml-2 text-muted-foreground">
                        {(item as { address?: string }).address}
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
