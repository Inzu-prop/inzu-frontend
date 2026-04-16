"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { SkeletonCards } from "@/components/inzu-skeleton";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import type { PropertyListItem, PropertyStatus, PropertyType } from "@/lib/api";

const LIST_TIMEOUT_MS = 15000;

const STATUS_STYLES: Record<PropertyStatus, { bg: string; color: string }> = {
  active:           { bg: "rgba(144,180,148,0.12)", color: "#90B494" },
  inactive:         { bg: "rgba(144,180,148,0.06)", color: "rgba(245,247,246,0.4)" },
  under_construction: { bg: "rgba(130,93,66,0.12)", color: "#825D42" },
  for_sale:         { bg: "rgba(144,180,148,0.06)", color: "rgba(245,247,246,0.5)" },
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
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

  const filtered = (data ?? []).filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      formatAddress(p.address).toLowerCase().includes(q) ||
      (TYPE_LABELS[p.type] ?? p.type).toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusFilterOptions: Array<{ value: PropertyStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "under_construction", label: "Under construction" },
    { value: "for_sale", label: "For sale" },
  ];

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Properties</h1>
            {data && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {filtered.length} of {data.length} {data.length === 1 ? "property" : "properties"}
              </p>
            )}
          </div>
          <Button size="sm" asChild>
            <Link href="/properties/new">Add property</Link>
          </Button>
        </div>

        {/* Search + filter — only shown once data is loaded */}
        {data && data.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search properties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 200px",
                minWidth: 0,
                height: 34,
                borderRadius: 8,
                border: "1px solid rgba(144,180,148,0.15)",
                background: "rgba(144,180,148,0.05)",
                padding: "0 12px",
                fontSize: 13,
                outline: "none",
                color: "inherit",
              }}
            />
            <div className="flex gap-1 flex-wrap">
              {statusFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    transition: "background 180ms ease, color 180ms ease",
                    background: statusFilter === opt.value ? "rgba(144,180,148,0.18)" : "rgba(144,180,148,0.06)",
                    color: statusFilter === opt.value ? "#90B494" : "rgba(245,247,246,0.45)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <SkeletonCards count={3} />}

        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        {!loading && !error && data && data.length === 0 && (
          <div className="inzu-empty">
            <Building2 size={28} className="text-muted-foreground" style={{ opacity: 0.4 }} />
            <p className="text-sm text-muted-foreground">No properties yet.</p>
            <Button size="sm" asChild>
              <Link href="/properties/new">Add your first property</Link>
            </Button>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No properties match your search.</p>
        )}

        {!loading && !error && data && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => {
              const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.inactive;
              return (
                <div
                  key={item._id}
                  className={`inzu-card inzu-entrance inzu-entrance-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6} flex flex-col rounded-2xl`}
                  style={{ opacity: 0 }}
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
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "3px 9px",
                          borderRadius: 20,
                          flexShrink: 0,
                        }}
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

                    <div className="mt-4 flex items-center gap-3 text-sm">
                      {item.totalUnits != null && (
                        <span className="font-medium text-foreground">
                          {item.totalUnits} {item.totalUnits === 1 ? "unit" : "units"}
                        </span>
                      )}
                      {item.photos > 0 && (
                        <span className="text-muted-foreground">
                          {item.photos} {item.photos === 1 ? "photo" : "photos"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid rgba(144,180,148,0.08)",
                      display: "flex",
                      gap: 8,
                      padding: "10px 16px",
                    }}
                  >
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/properties/${item._id}`}>View</Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/properties/${item._id}/units`}>Units</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </RequireOrganization>
  );
}
