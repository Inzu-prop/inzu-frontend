"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import type { PropertyListItem } from "@/lib/api";

const LIST_TIMEOUT_MS = 15000;

export default function PropertiesPage() {
  const api = useInzuApi();
  const [data, setData] = useState<PropertyListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timedOutRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    timedOutRef.current = false;
    setLoading(true);
    setError(null);
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        timedOutRef.current = true;
        setError("Request timed out. Check your connection and try again.");
        setLoading(false);
      }
    }, LIST_TIMEOUT_MS);
    api.properties
      .list()
      .then((res) => {
        if (!cancelled && !timedOutRef.current)
          setData(res.properties ?? []);
      })
      .catch((err) => {
        if (!cancelled && !timedOutRef.current)
          setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [api.properties]);

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Button size="sm" asChild>
            <Link href="/properties/new">Add property</Link>
          </Button>
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
            {data.map((item) => {
              const addr = item.address;
              const addressLine = [addr.street, addr.city, addr.state, addr.country]
                .filter(Boolean)
                .join(", ");
              return (
                <li
                  key={item._id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {item.type}
                    </span>
                    {addressLine && (
                      <span className="ml-2 block text-sm text-muted-foreground">
                        {addressLine}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.status}</span>
                    {item.totalUnits != null && (
                      <span>{item.totalUnits} units</span>
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
