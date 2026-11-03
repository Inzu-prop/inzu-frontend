import test from "node:test";
import assert from "node:assert/strict";
import { filterPeriod, periodStart, trendMonthKey, metricValue, metricSummary, monthKey } from "../src/lib/reporting.ts";
const month = (key, expected, collected, occupancyRate) => ({ period: { period: key }, expected, collected, occupancyRate });
test("YTD uses January of the current year, excluding old and future months", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  const rows = [month("2026-11", 100, 80), month("2025-12", 100, 70), month("2026-01", 100, 90), month("2026-12", 100, 100)];
  assert.deepEqual(filterPeriod(rows, "ytd", trendMonthKey, now).map(trendMonthKey), ["2026-01", "2026-11"]);
});
test("rolling periods cross year boundaries and respect Nairobi timezone", () => {
  const now = new Date("2025-12-31T22:00:00Z");
  assert.equal(monthKey(now), "2026-01");
  assert.equal(periodStart("6m", now), "2025-08");
  assert.equal(periodStart("3m", now), "2025-11");
  assert.equal(periodStart("ytd", now), "2026-01");
});
test("collection rate uses weighted totals instead of averaging percentages", () => {
  assert.equal(metricSummary([month("2026-01", 100, 0), month("2026-02", 900, 900)], "collection-rate"), 90);
  assert.equal(metricSummary([month("2026-01", 0, 0)], "collection-rate"), null);
});
test("occupancy converts fractions, preserves percentages, and leaves missing values absent", () => {
  assert.equal(metricValue(month("2026-01", 100, 100, 0.75), "occupancy"), 75);
  assert.equal(metricValue(month("2026-01", 100, 100, 83), "occupancy"), 83);
  assert.equal(metricValue(month("2026-01", 100, 100, 1), "occupancy"), 100);
  assert.equal(metricSummary([month("2026-01", 100, 100), month("2026-02", 100, 100, 0.8)], "occupancy"), 80);
  assert.equal(metricSummary([month("2026-01", 100, 100)], "occupancy"), null);
});
test("monthly collection gaps exclude overpayments; empty periods stay absent", () => {
  assert.equal(metricSummary([month("2026-01", 100, 120), month("2026-02", 100, 80)], "gap"), 20);
  assert.equal(metricSummary([], "collected"), null);
  assert.equal(trendMonthKey({ period: { period: "month", start: "2026-03-01T00:00:00Z" } }), "2026-03");
  assert.equal(trendMonthKey(month("2026-13", 0, 0)), null);
});
