import assert from "node:assert/strict";
import test from "node:test";
import {
  invoiceDetail,
  invoiceDetailForRoute,
} from "../src/lib/invoice-detail.ts";

test("invoice detail preserves zero amounts and explicit response snapshots", () => {
  const detail = invoiceDetail({
    _id: "invoice-1",
    invoiceNumber: "INV-1",
    totalAmount: 1000,
    paidAmount: 1000,
    balanceAmount: 0,
    tenantSnapshot: { name: "Historical Tenant" },
    propertySnapshot: { name: "Historical Property" },
    unitSnapshot: { unitNumber: "2B" },
  });
  assert.equal(detail.balanceAmount, 0);
  assert.equal(detail.tenantName, "Historical Tenant");
  assert.equal(detail.propertyName, "Historical Property");
  assert.equal(detail.unitNumber, "2B");
});

test("invoice detail does not calculate missing balance or paid values", () => {
  const detail = invoiceDetail({ amount: 2500 });
  assert.equal(detail.totalAmount, 2500);
  assert.equal(detail.paidAmount, undefined);
  assert.equal(detail.balanceAmount, undefined);
});

test("invoice detail unwraps invoice responses and preserves conditional line items", () => {
  const detail = invoiceDetail({
    invoice: {
      id: "invoice-2",
      items: [
        { description: "Rent", quantity: 1, unitPrice: 28000, total: 28000 },
      ],
    },
  });
  assert.equal(detail.id, "invoice-2");
  assert.deepEqual(detail.lineItems, [
    { description: "Rent", quantity: 1, unitAmount: 28000, totalAmount: 28000 },
  ]);
});

test("generic populated relations do not become historical invoice snapshots", () => {
  const detail = invoiceDetail({
    _id: "invoice-3",
    tenant: {
      _id: "tenant-1",
      name: "Current Tenant",
      email: "current@example.com",
    },
    property: { name: "Current Property" },
    unit: { unitNumber: "9Z" },
    issuer: { name: "Current Issuer" },
    createdAt: "2026-01-01",
  });
  assert.equal(detail.tenantId, "tenant-1");
  assert.equal(detail.tenantName, "");
  assert.equal(detail.tenantEmail, "");
  assert.equal(detail.propertyName, "");
  assert.equal(detail.unitNumber, "");
  assert.equal(detail.issuerName, "");
  assert.equal(detail.issueDate, "");
});

test("empty line item records are not presented as invoice facts", () => {
  const detail = invoiceDetail({
    _id: "invoice-4",
    lineItems: [{}, { description: "" }, { amount: 0 }],
  });
  assert.deepEqual(detail.lineItems, [
    {
      description: "",
      quantity: undefined,
      unitAmount: undefined,
      totalAmount: 0,
    },
  ]);
});

test("route normalization requires an exact returned invoice ID", () => {
  assert.equal(
    invoiceDetailForRoute({ _id: "invoice-5" }, "invoice-5").id,
    "invoice-5",
  );
  assert.throws(
    () => invoiceDetailForRoute({}, "invoice-5"),
    /did not include an ID/,
  );
  assert.throws(
    () => invoiceDetailForRoute({ _id: "invoice-6" }, "invoice-5"),
    /different invoice/,
  );
});
