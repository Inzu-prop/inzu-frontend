import assert from "node:assert/strict";
import test from "node:test";
import {
  dashboardSummary,
  paginationTotal,
} from "../src/lib/dashboard-summary.ts";

test("current nested API data populates the redesigned dashboard", () => {
  const result = dashboardSummary(
    {
      financials: {
        expected: 50000,
        collected: 40000,
        arrears: 10000,
        collectionRate: 0.8,
      },
      occupancy: { totalUnits: 20, occupancyRate: 0.75 },
      byProperty: [{}, {}],
    },
    { totalProperties: 3, totalTenants: 15, openTickets: 4 },
  );
  assert.deepEqual(result, {
    totalExpected: 50000,
    totalCollected: 40000,
    totalArrears: 10000,
    collectionRate: 0.8,
    occupancyRate: 0.75,
    totalUnits: 20,
    totalProperties: 2,
    totalTenants: 15,
    openTickets: 4,
  });
});

test("recorded zeroes override legacy values and unavailable counts retain fallbacks", () => {
  const result = dashboardSummary(
    {
      totalCollected: 900,
      financials: { collected: 0 },
      totalTenants: 10,
    },
    { totalTenants: paginationTotal(undefined, "tenants") },
  );
  assert.equal(result.totalCollected, 0);
  assert.equal(result.totalTenants, 10);
});

test("list totals use pagination rather than the one-record page size", () => {
  assert.equal(
    paginationTotal({ pagination: { total: 42 }, tenants: [{}] }, "tenants"),
    42,
  );
  assert.equal(paginationTotal({ tenants: [] }, "tenants"), 0);
  assert.equal(paginationTotal(undefined, "tenants"), undefined);
});
