"use client";

import { useState } from "react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrearsReport } from "./arrears-report";
import { CashflowReport } from "./cashflow-report";

const REPORT_TABS = [
  { id: "pnl", label: "P&L" },
  { id: "arrears", label: "Arrears" },
  { id: "cashflow", label: "Cash flow" },
  { id: "comparative", label: "Comparative" },
] as const;

// Default date range: first day of current month to today
function getDefaultFrom() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function getDefaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const api = useInzuApi();
  const [activeTab, setActiveTab] = useState<(typeof REPORT_TABS)[number]["id"]>("pnl");
  const [from, setFrom] = useState(getDefaultFrom());
  const [to, setTo] = useState(getDefaultTo());
  const [data, setData] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = (reportId: (typeof REPORT_TABS)[number]["id"], fromDate: string, toDate: string) => {
    if (!fromDate) {
      setError("A start date (from) is required.");
      return;
    }
    setLoading(true);
    setError(null);
    const params: Record<string, string> = { from: fromDate };
    if (toDate) params.to = toDate;
    const method =
      reportId === "pnl"
        ? api.reports.pnl
        : reportId === "arrears"
          ? api.reports.arrears
          : reportId === "cashflow"
            ? api.reports.cashflow
            : api.reports.comparative;
    method(params)
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  };

  const handleTab = (id: (typeof REPORT_TABS)[number]["id"]) => {
    setActiveTab(id);
    loadReport(id, from, to);
  };

  const handleRun = () => loadReport(activeTab, from, to);

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
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="from-date">From</Label>
            <Input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="to-date">To</Label>
            <Input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={handleRun} disabled={loading || !from}>
            Run report
          </Button>
        </div>
        {loading && <p className="text-muted-foreground">Loading report…</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && data !== null && (
          activeTab === "arrears" ? (
            <ArrearsReport data={data as Parameters<typeof ArrearsReport>[0]["data"]} />
          ) : activeTab === "cashflow" ? (
            <CashflowReport data={data as Parameters<typeof CashflowReport>[0]["data"]} />
          ) : (
            <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-4 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          )
        )}
      </Container>
    </RequireOrganization>
  );
}
