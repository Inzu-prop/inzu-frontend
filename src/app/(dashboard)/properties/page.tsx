"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import type { PropertyListItem, PropertyStatus, PropertyType } from "@/lib/api";

const LIST_TIMEOUT_MS = 15000;

const STATUS_STYLES: Record<PropertyStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-muted text-muted-foreground",
  under_construction: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  for_sale: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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

function formatAddress(addr: PropertyListItem["address"]) {
  return [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(", ");
}

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
        if (!cancelled && !timedOutRef.current) setData(res.properties ?? []);
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Properties</h1>
            {data && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.length} {data.length === 1 ? "property" : "properties"}
              </p>
            )}
          </div>
          <Button size="sm" asChild>
            <Link href="/properties/new">Add property</Link>
          </Button>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive" role="alert">{error}</p>
        )}

        {!loading && !error && data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No properties yet.</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/properties/new">Add your first property</Link>
            </Button>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <div
                key={item._id}
                className="flex flex-col rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/properties/${item._id}`}
                      className="text-base font-semibold leading-tight hover:underline"
                    >
                      {item.name}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </p>

                  {formatAddress(item.address) && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {formatAddress(item.address)}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    {item.totalUnits != null && (
                      <span className="font-medium text-foreground">
                        {item.totalUnits} {item.totalUnits === 1 ? "unit" : "units"}
                      </span>
                    )}
                    {item.photos > 0 && (
                      <span>{item.photos} {item.photos === 1 ? "photo" : "photos"}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border px-5 py-3">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/properties/${item._id}`}>View</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/properties/${item._id}/units`}>Units</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </RequireOrganization>
  );
}
