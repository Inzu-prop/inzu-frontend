import assert from "node:assert/strict";
import test from "node:test";
import { maintenanceDetailForRoute } from "../src/lib/maintenance-response.ts";

test("ticket detail accepts an exact ID in wrapped and unwrapped responses", () => {
  const ticket = { _id: "t1", title: "Repair" };
  assert.deepEqual(maintenanceDetailForRoute(ticket, "t1"), ticket);
  assert.deepEqual(maintenanceDetailForRoute({ ticket }, "t1"), ticket);
  assert.deepEqual(
    maintenanceDetailForRoute({ maintenance: { id: "t1" } }, "t1"),
    { id: "t1" },
  );
});

test("ticket detail rejects missing or mismatched IDs", () => {
  assert.throws(() => maintenanceDetailForRoute({}, "t1"));
  assert.throws(() =>
    maintenanceDetailForRoute({ ticket: { _id: "t2" } }, "t1"),
  );
});
