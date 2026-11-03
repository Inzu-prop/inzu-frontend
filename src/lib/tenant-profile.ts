export type ProfileRecord = Record<string, unknown>;
export function record(value: unknown): ProfileRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ProfileRecord)
    : {};
}
export function words(value: unknown): string {
  return typeof value === "string" ? value : "";
}
export function amount(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
export function money(value: unknown): string {
  const n = amount(value);
  return n === undefined
    ? "Not recorded"
    : `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
}
export function dateLabel(value: unknown): string {
  const s = words(value);
  const d = new Date(s);
  return !s || Number.isNaN(d.getTime())
    ? "Not recorded"
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      });
}
export function recordId(value: unknown): string {
  return typeof value === "string"
    ? value
    : words(record(value)._id) || words(record(value).id);
}

export type TenantDocumentRecord = {
  name: string;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
  expiresAt: string;
  url?: string;
};

export function safeDocumentUrl(value: unknown): string | undefined {
  const url = words(value).trim();
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reads document metadata defensively because tenant responses are currently
 * untyped. Missing or inaccessible files stay visible as metadata instead of
 * being mistaken for an empty document list.
 */
export function tenantDocuments(tenant: ProfileRecord): TenantDocumentRecord[] {
  const source = Array.isArray(tenant.documents)
    ? tenant.documents.map(record)
    : [];
  const legacy: ProfileRecord[] = [
    {
      name: "ID document",
      category: "Identification",
      url: tenant.idDocumentUrl,
    },
    {
      name: "Employment document",
      category: "Employment",
      url: tenant.employmentDocumentUrl,
    },
  ].filter((item) => words(item.url));

  const seen = new Set<string>();
  const documents: TenantDocumentRecord[] = [];
  [...source, ...legacy].forEach((item, index) => {
    const url = [item.signedUrl, item.url, item.publicUrl, item.downloadUrl]
      .map(safeDocumentUrl)
      .find((candidate) => candidate !== undefined);
    const name =
      words(item.name ?? item.filename ?? item.fileName) ||
      `Document ${index + 1}`;
    const key = words(item._id ?? item.id ?? item.r2Key) || url;
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    const uploader = record(item.uploadedBy ?? item.uploader);
    documents.push({
      name,
      category: words(item.category ?? item.type) || "Other",
      uploadedAt: words(item.uploadedAt ?? item.createdAt),
      uploadedBy:
        words(item.uploadedBy) ||
        words(uploader.name ?? uploader.email) ||
        words(item.uploadedByName ?? item.uploaderName),
      expiresAt: words(item.expiresAt ?? item.expiryDate),
      url,
    });
  });
  return documents;
}
export function listRecords(value: unknown, key: string): ProfileRecord[] {
  const source = Array.isArray(value) ? value : record(value)[key];
  if (!Array.isArray(source))
    throw new Error(`The ${key} response could not be read.`);
  return source.map(record);
}
export function tenantRecords(
  rows: ProfileRecord[],
  tenantId: string,
  invoiceIds: string[] = [],
): ProfileRecord[] {
  return rows.filter((row) => {
    const owner = recordId(row.tenantId);
    if (owner) return owner === tenantId;
    const invoice = recordId(row.invoiceId);
    return !!invoice && invoiceIds.includes(invoice);
  });
}
export type HistoryKind = "invoices" | "payments" | "tickets";
export type ProfileHistory = Record<
  HistoryKind,
  { rows: ProfileRecord[]; error?: string }
>;
export const emptyHistory = (): ProfileHistory => ({
  invoices: { rows: [] },
  payments: { rows: [] },
  tickets: { rows: [] },
});
