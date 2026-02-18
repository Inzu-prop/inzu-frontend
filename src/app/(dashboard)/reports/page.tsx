"use client";

import { useState } from "react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

const REPORT_TABS = [
  { id: "pnl", label: "P&L" },
  { id: "arrears", label: "Arrears" },
  { id: "cashflow", label: "Cash flow" },
  { id: "comparative", label: "Comparative" },
] as const;

export default function ReportsPage() {
  const api = useInzuApi();
  const [activeTab, setActiveTab] = useState<(typeof REPORT_TABS)[number]["id"]>("pnl");
  const [data, setData] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = (reportId: (typeof REPORT_TABS)[number]["id"]) => {
    setLoading(true);
    setError(null);
    const method =
      reportId === "pnl"
        ? api.reports.pnl
        : reportId === "arrears"
          ? api.reports.arrears
          : reportId === "cashflow"
            ? api.reports.cashflow
            : api.reports.comparative;
    method()
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  };

  const handleTab = (id: (typeof REPORT_TABS)[number]["id"]) => {
    setActiveTab(id);
    loadReport(id);
  };

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex gap-2 border-b border-border pb-2">
          {REPORT_TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <p className="mb-4 text-muted-foreground">
          Select a report above to load it. Data is loaded from the API when you
          switch tabs.
        </p>
        {loading && <p className="text-muted-foreground">Loading report…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data !== null && (
          <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </Container>
    </RequireOrganization>
  );
}
