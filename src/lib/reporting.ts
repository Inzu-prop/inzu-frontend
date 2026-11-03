export type ReportingPeriod = "3m" | "6m" | "ytd";
export type ReportMetric =
  | "collected"
  | "occupancy"
  | "collection-rate"
  | "gap";
export type TrendMonth = {
  period: { period: string; start?: string };
  expected: number;
  collected: number;
  occupancyRate?: number | null;
};

export function monthKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
}
export function trendMonthKey(month: TrendMonth): string | null {
  const value = month.period.start ?? month.period.period;
  const match = /^(\d{4})-(\d{2})(?:$|-|T)/.exec(value);
  return match && Number(match[2]) >= 1 && Number(match[2]) <= 12
    ? `${match[1]}-${match[2]}`
    : null;
}
export function monthLabel(key: string): string {
  if (!/^\d{4}-\d{2}$/.test(key)) return key;
  return new Date(`${key}-01T12:00:00Z`).toLocaleDateString("en-KE", {
    month: "short",
    timeZone: "Africa/Nairobi",
  });
}
export function periodStart(period: ReportingPeriod, now = new Date()): string {
  const [year, month] = monthKey(now).split("-").map(Number);
  if (period === "ytd") return `${year}-01`;
  const first = new Date(
    Date.UTC(year, month - (period === "3m" ? 3 : 6), 1, 12),
  );
  return `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function filterPeriod<T>(
  items: T[],
  period: ReportingPeriod,
  keyOf: (item: T) => string | null,
  now = new Date(),
): T[] {
  const start = periodStart(period, now),
    end = monthKey(now);
  return items
    .filter((item) => {
      const key = keyOf(item);
      return key !== null && key >= start && key <= end;
    })
    .sort((a, b) => keyOf(a)!.localeCompare(keyOf(b)!));
}
export function metricValue(
  month: TrendMonth,
  metric: ReportMetric,
): number | null {
  if (metric === "collected") return month.collected;
  if (metric === "gap") return Math.max(0, month.expected - month.collected);
  if (metric === "collection-rate")
    return month.expected > 0 ? (month.collected / month.expected) * 100 : null;
  const rate = month.occupancyRate;
  return typeof rate === "number" && Number.isFinite(rate)
    ? Math.min(100, Math.max(0, rate <= 1 ? rate * 100 : rate))
    : null;
}
export function metricSummary(
  months: TrendMonth[],
  metric: ReportMetric,
): number | null {
  if (metric === "collection-rate") {
    const expected = months.reduce((sum, month) => sum + month.expected, 0);
    return expected > 0
      ? (months.reduce((sum, month) => sum + month.collected, 0) / expected) *
          100
      : null;
  }
  const values = months
    .map((month) => metricValue(month, metric))
    .filter((value): value is number => value !== null);
  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return metric === "occupancy" ? total / values.length : total;
}
