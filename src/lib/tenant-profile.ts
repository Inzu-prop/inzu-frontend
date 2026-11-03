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
