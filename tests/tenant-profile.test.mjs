import assert from "node:assert/strict";
import test from "node:test";
import {
  dateLabel,
  listRecords,
  money,
  safeDocumentUrl,
  tenantDocuments,
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

test("tenant document metadata remains visible when file access is unavailable", () => {
  assert.deepEqual(
    tenantDocuments({
      documents: [
        {
          name: "Lease summary",
          type: "Agreement",
          uploadedAt: "2026-01-02",
          signedUrl: "https://files.example.test/lease.pdf",
        },
        {
          name: "Employment note",
          url: "javascript:alert(1)",
        },
      ],
    }),
    [
      {
        name: "Lease summary",
        category: "Agreement",
        uploadedAt: "2026-01-02",
        uploadedBy: "",
        expiresAt: "",
        url: "https://files.example.test/lease.pdf",
      },
      {
        name: "Employment note",
        category: "Other",
        uploadedAt: "",
        uploadedBy: "",
        expiresAt: "",
        url: undefined,
      },
    ],
  );
});

test("tenant document links accept HTTPS only", () => {
  assert.equal(
    safeDocumentUrl("https://files.example.test/a.pdf"),
    "https://files.example.test/a.pdf",
  );
  assert.equal(safeDocumentUrl("http://files.example.test/a.pdf"), undefined);
  assert.equal(safeDocumentUrl("/private/a.pdf"), undefined);
});

test("tenant documents use the first safe URL candidate", () => {
  const [document] = tenantDocuments({
    documents: [
      {
        name: "Lease",
        signedUrl: "javascript:alert(1)",
        publicUrl: "https://files.example.test/lease.pdf",
      },
    ],
  });
  assert.equal(document.url, "https://files.example.test/lease.pdf");
});

test("tenant documents preserve uploader strings and distinct inaccessible records", () => {
  const documents = tenantDocuments({
    documents: [
      { name: "Note", uploadedBy: "Property manager" },
      { name: "Note", uploadedBy: "Property manager" },
    ],
  });
  assert.equal(documents.length, 2);
  assert.equal(documents[0].uploadedBy, "Property manager");
});

test("tenant documents deduplicate records with a strong identity", () => {
  const documents = tenantDocuments({
    documents: [
      { _id: "document-1", name: "Lease" },
      { _id: "document-1", name: "Lease copy" },
    ],
  });
  assert.equal(documents.length, 1);
  assert.equal(documents[0].name, "Lease");
});
