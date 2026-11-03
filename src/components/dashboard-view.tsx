"use client";

import Link from "next/link";
import {
  RiAddLine,
  RiArrowRightUpLine,
  RiBankCardLine,
  RiBarChartBoxLine,
  RiBuildingLine,
  RiFileList3Line,
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiPieChartLine,
  RiRefreshLine,
  RiToolsLine,
} from "@remixicon/react";
import { RevenueChartCard } from "@/components/application/dashboard/revenue-chart-card";
import {
  type Stat,
  StatCards,
} from "@/components/application/dashboard/stat-cards";
import { Button, ButtonLink } from "@/components/base/buttons/button";
import { ProgressBar } from "@/components/base/progress/progress";
import Container from "@/components/container";
import { type TrendMonth, monthLabel, trendMonthKey } from "@/lib/reporting";

export type MonthlyTrend = TrendMonth;
export type Summary = {
  totalExpected?: number;
  totalCollected?: number;
  totalArrears?: number;
  collectionRate?: number;
  occupancyRate?: number;
  totalProperties?: number;
  totalUnits?: number;
  totalTenants?: number;
  openTickets?: number;
};
const money = (amount: number) =>
  `KES ${Math.round(amount).toLocaleString("en-KE")}`;
const percent = (rate: number) => (rate <= 1 ? rate * 100 : rate);
const panel = "rounded-3xl bg-background-secondary-default p-5";

export function DashboardView({
  summary,
  monthly,
  loading = false,
  error = null,
  onRetry,
  basePath = "",
}: {
  summary: Summary | null;
  monthly: MonthlyTrend[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  basePath?: string;
}) {
  const href = (path: string) => `${basePath}${path}`;
  const collected = summary?.totalCollected ?? 0;
  const expected = summary?.totalExpected ?? 0;
  const arrears = summary?.totalArrears ?? 0;
  const collection = percent(
    summary?.collectionRate ?? (expected ? collected / expected : 0),
  );
  const occupancy = percent(summary?.occupancyRate ?? 0);
  const hasData =
    summary &&
    Object.values(summary).some(
      (value) => typeof value === "number" && value > 0,
    );
  const stats: Stat[] = [
    {
      icon: RiBankCardLine,
      label: "Rent collected",
      value: money(collected),
      delta: "",
      deltaColor: "neutral",
      caption: "Received this month",
      tone: "emerald",
    },
    {
      icon: RiMoneyDollarCircleLine,
      label: "Expected rent",
      value: money(expected),
      delta: "",
      deltaColor: "neutral",
      caption: "Total scheduled rent",
      tone: "blue",
    },
    {
      icon: RiFileList3Line,
      label: "Outstanding arrears",
      value: money(arrears),
      delta: "",
      deltaColor: "neutral",
      caption: "Balance awaiting payment",
      tone: "orange",
    },
    {
      icon: RiPieChartLine,
      label: "Occupancy rate",
      value: `${occupancy.toFixed(0)}%`,
      delta: "",
      deltaColor: "neutral",
      caption: `${summary?.totalUnits ?? 0} units in your portfolio`,
      tone: "purple",
    },
  ];

  return (
    <>
      <Container className="flex flex-col gap-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-body-regular text-text-secondary">
            {new Date().toLocaleDateString("en-KE", {
              month: "long",
              year: "numeric",
              timeZone: "Africa/Nairobi",
            })}{" "}
            / All properties
          </p>
          <div className="flex gap-2">
            <ButtonLink
              size="small"
              href={href("/reports")}
              variant="secondary"
              leadingIcon={RiBarChartBoxLine}
            >
              Reports
            </ButtonLink>
            <ButtonLink href={href("/properties/new")} leadingIcon={RiAddLine}>
              Add property
            </ButtonLink>
          </div>
        </div>
        {loading ? (
          <div
            role="status"
            aria-label="Loading portfolio"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-secondary-default h-48 rounded-3xl motion-safe:animate-pulse"
              />
            ))}
            <span className="sr-only">Loading portfolio...</span>
          </div>
        ) : error ? (
          <section className={panel} role="alert">
            <h2 className="text-headline-medium text-text-primary">
              Your dashboard is unavailable
            </h2>
            <p className="text-body-regular text-text-secondary mb-4 mt-2">
              {error}
            </p>
            <Button
              variant="secondary"
              leadingIcon={RiRefreshLine}
              onClick={onRetry}
            >
              Try again
            </Button>
          </section>
        ) : (
          <>
            {!hasData && (
              <section className="border-border-button-default bg-background-secondary-default flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-6">
                <div className="flex items-center gap-4">
                  <RiBuildingLine className="text-foreground-icon-secondary size-10 shrink-0" />
                  <div>
                    <h2 className="text-headline-medium text-text-primary">
                      Your portfolio starts here
                    </h2>
                    <p className="text-body-regular text-text-secondary mt-1">
                      Add your first property, then set up units and invite your
                      tenants.
                    </p>
                  </div>
                </div>
                <ButtonLink
                  size="small"
                  href={href("/properties/new")}
                  variant="secondary"
                  trailingIcon={RiArrowRightUpLine}
                >
                  Add your first property
                </ButtonLink>
              </section>
            )}
            <StatCards stats={stats} variant="plain" />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
              {monthly.length ? (
                <RevenueChartCard
                  title="Rent collected"
                  data={monthly.map((m) => ({
                    label: monthLabel(trendMonthKey(m) ?? m.period.period),
                    month: trendMonthKey(m),
                    current: m.collected,
                    previous: m.expected,
                  }))}
                  className="h-[340px]"
                />
              ) : (
                <section className={panel}>
                  <h2 className="text-headline-medium text-text-primary">
                    Rent collection
                  </h2>
                  <p className="text-body-regular text-text-tertiary mt-1">
                    Expected and collected rent over the last six months
                  </p>
                  <div className="text-text-tertiary flex h-64 flex-col items-center justify-center gap-3">
                    <RiBarChartBoxLine className="size-10" />
                    <p className="text-body-medium">
                      No collection history yet
                    </p>
                    <p className="text-body-2-regular max-w-xs text-center">
                      Your monthly trends will appear here as rent is invoiced
                      and payments arrive.
                    </p>
                  </div>
                </section>
              )}
              <section className={panel}>
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-headline-medium text-text-primary">
                      Collection health
                    </h2>
                    <p className="text-body-regular text-text-tertiary mt-1">
                      This month&apos;s rental income
                    </p>
                  </div>
                  <p className="text-display-4-semibold text-text-primary">
                    {collection.toFixed(0)}
                    <span className="text-title-2-medium text-text-tertiary">
                      %
                    </span>
                  </p>
                  <ProgressBar
                    label="Rent collected"
                    value={Math.min(100, Math.max(0, collection))}
                  />
                  <div className="border-separator-border flex flex-col gap-3 border-t pt-4">
                    <div className="text-body-regular text-text-secondary flex justify-between gap-2">
                      <span>Collected</span>
                      <span className="text-body-medium text-text-primary">
                        {money(collected)}
                      </span>
                    </div>
                    <div className="text-body-regular text-text-secondary flex justify-between gap-2">
                      <span>Outstanding</span>
                      <span className="text-body-medium text-text-primary">
                        {money(arrears)}
                      </span>
                    </div>
                  </div>
                  <ButtonLink
                    size="small"
                    href={href("/payments")}
                    variant="secondary"
                    trailingIcon={RiArrowRightUpLine}
                  >
                    Review payments
                  </ButtonLink>
                </div>
              </section>
            </div>
            <section className={panel}>
              <div className="flex items-center justify-between">
                <h2 className="text-headline-medium text-text-primary">
                  Portfolio
                </h2>
                <span className="text-body-2-regular text-text-tertiary hidden">
                  Your everyday essentials
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {[
                  {
                    href: "/properties",
                    label: "Properties",
                    value: summary?.totalProperties ?? 0,
                    description: "Buildings and rental units",
                    icon: RiBuildingLine,
                  },
                  {
                    href: "/tenants",
                    label: "Tenants",
                    value: summary?.totalTenants ?? 0,
                    description: "People who call them home",
                    icon: RiGroupLine,
                  },
                  {
                    href: "/maintenance",
                    label: "Open requests",
                    value: summary?.openTickets ?? 0,
                    description: "Maintenance to follow up",
                    icon: RiToolsLine,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={href(item.href)}
                    className="bg-background-secondary-default hover:bg-background-secondary-hover focus-visible:ring-border-focus-ring flex items-center gap-4 rounded-2xl p-3 outline-none focus-visible:ring-2"
                  >
                    <item.icon className="text-foreground-icon-secondary size-6" />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-medium text-text-primary">
                        {item.label}
                        <span className="text-text-tertiary ms-2">
                          {item.value}
                        </span>
                      </p>
                      <p className="text-caption-1-regular text-text-tertiary mt-1">
                        {item.description}
                      </p>
                    </div>
                    <RiArrowRightUpLine className="text-foreground-icon-tertiary size-5" />
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </Container>
    </>
  );
}
