"use client";

import { useState } from "react";
import { RevenueChartCard } from "@/components/application/dashboard/revenue-chart-card";
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/tabs/tabs";
import Container from "@/components/container";
import {
  type ReportMetric,
  type ReportingPeriod,
  type TrendMonth,
  filterPeriod,
  metricSummary,
  metricValue,
  monthLabel,
  trendMonthKey,
} from "@/lib/reporting";
import { cx } from "@/utils/cx";

const metrics: {
  id: ReportMetric;
  label: string;
  summary: string;
  description: string;
  unit: "currency" | "percent";
}[] = [
  {
    id: "collected",
    label: "Rent collected",
    summary: "Total received",
    description: "Monthly collections against expected rent",
    unit: "currency",
  },
  {
    id: "occupancy",
    label: "Occupancy",
    summary: "Monthly average",
    description: "Occupied units as a share of the portfolio",
    unit: "percent",
  },
  {
    id: "collection-rate",
    label: "Collection rate",
    summary: "Weighted by rent due",
    description: "Collected rent as a percentage of expected rent",
    unit: "percent",
  },
  {
    id: "gap",
    label: "Collection gap",
    summary: "Total monthly shortfall",
    description: "Expected rent less collections, excluding overpayments",
    unit: "currency",
  },
];
const format = (value: number | null, unit: "currency" | "percent") =>
  value === null
    ? "No data"
    : unit === "percent"
      ? `${value.toFixed(1)}%`
      : `KES ${Math.round(value).toLocaleString("en-KE")}`;

export function ReportsView({
  monthly,
  embedded = false,
}: {
  monthly: TrendMonth[];
  embedded?: boolean;
}) {
  const [metric, setMetric] = useState<ReportMetric>("collected");
  const [period, setPeriod] = useState<ReportingPeriod>("ytd");
  const selectedMonths = filterPeriod(monthly, period, trendMonthKey);
  const selected = metrics.find((item) => item.id === metric)!;
  const Frame = embedded ? "div" : Container;
  const series = monthly.map((month) => ({
    month: trendMonthKey(month),
    label: monthLabel(trendMonthKey(month) ?? month.period.period),
    current: metricValue(month, metric),
    previous: month.expected,
  }));
  const start = selectedMonths[0],
    end = selectedMonths.at(-1);
  const firstValue = start ? metricValue(start, metric) : null,
    lastValue = end ? metricValue(end, metric) : null;
  const change =
    firstValue !== null && lastValue !== null ? lastValue - firstValue : null;
  return (
    <Frame className="flex flex-col gap-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-regular text-text-secondary">
          Portfolio performance
        </p>
        <span className="text-caption-1-regular text-text-tertiary">
          Select a metric to explore its trend
        </span>
      </div>
      <Tabs
        selectedKey={metric}
        onSelectionChange={(key) => setMetric(key as ReportMetric)}
        className="gap-0"
      >
        <TabList
          aria-label="Report metric"
          className="bg-background-secondary-default grid grid-cols-2 items-stretch gap-0 rounded-t-2xl border-0 lg:grid-cols-4"
        >
          {metrics.map((item) => (
            <Tab
              key={item.id}
              id={item.id}
              aria-label={item.label}
              className={({ isSelected }) =>
                cx(
                  "min-w-0 whitespace-normal border-t-2 p-4",
                  isSelected
                    ? "border-accent-500 bg-background-primary-default"
                    : "hover:bg-background-secondary-hover border-transparent",
                )
              }
            >
              <span className="flex min-w-0 flex-col gap-2">
                <span className="text-body-regular text-text-secondary">
                  {item.label}
                </span>
                <span className="text-title-2-semibold text-text-primary tabular-nums">
                  {format(metricSummary(selectedMonths, item.id), item.unit)}
                </span>
                <span className="text-caption-1-regular text-text-tertiary">
                  {item.summary}
                </span>
              </span>
            </Tab>
          ))}
        </TabList>
        {metrics.map((item) => (
          <TabPanel
            id={item.id}
            key={item.id}
            className="bg-background-primary-default rounded-b-2xl p-3"
          >
            <RevenueChartCard
              key={metric}
              data={series}
              title={selected.label}
              unit={selected.unit}
              summaryValue={metricSummary(selectedMonths, metric)}
              summaryLabel={selected.summary}
              period={period}
              onPeriodChange={setPeriod}
              showExpected={metric === "collected"}
              className="bg-background-primary-default h-[340px] rounded-xl p-2"
            />
            <div className="border-separator-border flex flex-wrap items-center justify-between gap-3 border-t px-2 pt-3">
              <p className="text-caption-1-regular text-text-secondary">
                {selected.description}
              </p>
              <p className="text-caption-1-regular text-text-secondary">
                {change === null
                  ? "Change unavailable"
                  : `${change >= 0 ? "+" : ""}${selected.unit === "percent" ? `${change.toFixed(1)} percentage points` : format(change, selected.unit)} from first to latest month`}
              </p>
            </div>
          </TabPanel>
        ))}
      </Tabs>
      <section className="bg-background-secondary-default rounded-2xl p-4">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="text-body-semibold text-text-primary">
            Monthly detail / {selected.label}
          </h2>
          <span className="text-caption-1-regular text-text-tertiary">
            {start && end
              ? `${monthLabel(trendMonthKey(start) ?? "")} to ${monthLabel(trendMonthKey(end) ?? "")}`
              : "No months in this period"}
          </span>
        </div>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {selectedMonths.map((month) => (
            <li
              key={trendMonthKey(month) ?? month.period.period}
              className="border-separator-border border-s ps-3"
            >
              <dl>
                <dt className="text-caption-1-regular text-text-tertiary">
                  {monthLabel(trendMonthKey(month) ?? month.period.period)}
                </dt>
                <dd className="text-body-semibold text-text-primary mt-1 tabular-nums">
                  {format(metricValue(month, metric), selected.unit)}
                </dd>
              </dl>
            </li>
          ))}
        </ol>
      </section>
    </Frame>
  );
}
