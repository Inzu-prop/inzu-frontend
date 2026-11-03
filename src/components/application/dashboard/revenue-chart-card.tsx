"use client";

import { useId, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PillTab, PillTabList } from "@/components/base/tabs/pill-tab";
import { type ReportingPeriod, filterPeriod } from "@/lib/reporting";
import { cx } from "@/utils/cx";

// Adapted from BoardUI's revenue-chart-card: INZU currency, real periods,
// and an optional expected-rent comparison in place of the demo year.
export type RevenuePoint = {
  label: string;
  month: string | null;
  current: number | null;
  previous: number;
};
const money = (value: number) =>
  `KES ${Math.round(value).toLocaleString("en-KE")}`;
const axisMoney = (value: number) =>
  value >= 1000000
    ? `${(value / 1000000).toFixed(1)}M`
    : value >= 1000
      ? `${Math.round(value / 1000)}k`
      : String(value);

export function RevenueChartCard({
  data,
  title = "Rent collected",
  showExpected = false,
  className,
  period: controlledPeriod,
  onPeriodChange,
  unit = "currency",
  summaryValue,
  summaryLabel,
}: {
  data: RevenuePoint[];
  title?: string;
  showExpected?: boolean;
  className?: string;
  period?: ReportingPeriod;
  onPeriodChange?: (period: ReportingPeriod) => void;
  unit?: "currency" | "percent";
  summaryValue?: number | null;
  summaryLabel?: string;
}) {
  const [localPeriod, setLocalPeriod] = useState<ReportingPeriod>("6m");
  const period = controlledPeriod ?? localPeriod;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = useId();
  const points = filterPeriod(data, period, (point) => point.month);
  const formatValue = (value: number | null) =>
    value === null
      ? "No data"
      : unit === "percent"
        ? `${value.toFixed(1)}%`
        : money(value);
  const active = activeIndex !== null ? points[activeIndex] : undefined;
  const total = points.reduce((sum, point) => sum + (point.current ?? 0), 0);
  const yMax = Math.max(
    1,
    ...points.map((point) =>
      Math.max(point.current ?? 0, showExpected ? point.previous : 0),
    ),
  );
  return (
    <section
      className={cx(
        "bg-background-secondary-default flex h-[340px] min-w-0 flex-col gap-4 rounded-3xl p-5",
        className,
      )}
      aria-label={title}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-body-regular text-text-secondary">
            {active ? `${title} / ${active.label}` : title}
          </h2>
          <p className="text-title-1-semibold text-text-primary tabular-nums">
            {formatValue(
              active
                ? active.current
                : summaryValue !== undefined
                  ? summaryValue
                  : total,
            )}
          </p>
          <p className="text-caption-1-regular text-text-tertiary">
            {active
              ? showExpected
                ? `${money(active.previous)} expected`
                : "Monthly value"
              : `${summaryLabel ?? "Total"} / ${points.length} months${period === "ytd" ? " year to date" : ""}`}
          </p>
        </div>
        <PillTabList aria-label="Chart period">
          {(
            [
              ["3m", "3 months"],
              ["6m", "6 months"],
              ["ytd", "YTD"],
            ] as const
          ).map(([value, label]) => (
            <PillTab
              key={value}
              variant="gray"
              isSelected={period === value}
              onSelect={() => {
                setLocalPeriod(value);
                onPeriodChange?.(value);
                setActiveIndex(null);
              }}
            >
              {label}
            </PillTab>
          ))}
        </PillTabList>
      </div>
      {showExpected && (
        <div className="text-caption-1-regular text-text-secondary flex gap-4">
          <span>Collected / solid</span>
          <span>Expected / dashed</span>
        </div>
      )}
      {points.some((point) => point.current !== null) ? (
        <div className="min-h-0 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={points}
              accessibilityLayer
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseMove={(state) => {
                const index = Number(state?.activeTooltipIndex);
                if (state?.isTooltipActive && Number.isFinite(index))
                  setActiveIndex(index);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis
                width={44}
                domain={
                  unit === "percent"
                    ? [0, Math.max(100, Math.ceil(yMax))]
                    : [0, yMax * 1.12]
                }
                tickCount={4}
                tickFormatter={
                  unit === "percent" ? (value) => `${value}%` : axisMoney
                }
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              />
              <Tooltip
                content={() => null}
                cursor={{
                  stroke: "var(--color-chart-cursor)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              {showExpected && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="var(--color-chart-neutral)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              )}
              <Area
                type="monotone"
                dataKey="current"
                stroke="var(--color-chart-2-active)"
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "var(--color-background-primary-default)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-body-regular text-text-tertiary flex flex-1 items-center justify-center">
          No data available for this metric and period
        </div>
      )}
    </section>
  );
}
