import assert from "node:assert/strict";
import test from "node:test";
import {
  dateLabel,
  listRecords,
  money,
  tenantRecords,
} from "../src/lib/tenant-profile.ts";

test("tenant histories exclude other tenants and unlinked records", () => {
  const rows = [
    { tenantId: "a", _id: "own" },
    { tenantId: "b", _id: "other" },
    { _id: "unlinked" },
    { tenantId: { _id: "a" }, _id: "populated" },
  ];
  assert.deepEqual(
    tenantRecords(rows, "a").map((r) => r._id),
    ["own", "populated"],
  );
});
test("payments may link through an owned invoice but conflicting tenant IDs are excluded", () => {
  const rows = [
    { invoiceId: "invoice-a", _id: "linked" },
    { invoiceId: "invoice-a", tenantId: "b", _id: "conflict" },
    { invoiceId: "invoice-b", _id: "other" },
  ];
  assert.deepEqual(
    tenantRecords(rows, "a", ["invoice-a"]).map((r) => r._id),
    ["linked"],
  );
});
test("unreadable responses do not silently become an empty history", () => {
  assert.deepEqual(listRecords({ tickets: [] }, "tickets"), []);
  assert.throws(() => listRecords({ message: "unavailable" }, "tickets"));
});
test("unknown amounts remain distinct from a recorded zero", () => {
  assert.equal(money(undefined), "Not recorded");
  assert.equal(money(NaN), "Not recorded");
  assert.equal(money(0), "KES 0");
  assert.equal(dateLabel("invalid"), "Not recorded");
});
