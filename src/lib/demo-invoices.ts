import { type InvoiceDetail, invoiceDetail } from "./invoice-detail";
import { monthKey } from "./reporting";

export type DemoInvoiceRecord = Record<string, unknown>;

export function demoTenantInvoices(
  tenantId: string,
  tenantIndex: number,
  rent: number,
  current = monthKey(new Date()),
): DemoInvoiceRecord[] {
  return Array.from({ length: 8 }, (_, offset) => {
    const date = new Date(`${current}-01T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - offset);
    const period = date.toISOString().slice(0, 7);
    return {
      _id: `${tenantId}-invoice-${period}`,
      tenantId,
      invoiceNumber: `DEMO-${tenantIndex + 1}-${period}`,
      period,
      amount: rent,
      dueDate: `${period}-05`,
      issueDate: `${period}-01`,
      status: offset > 0 || tenantIndex % 3 !== 0 ? "paid" : "pending",
    };
  });
}

export function demoInvoiceById(
  id: string,
  tenantNames: string[],
): InvoiceDetail | undefined {
  const tenantInvoice =
    /^(tenant-(\d+))-invoice-(\d{4}-(?:0[1-9]|1[0-2]))$/.exec(id);
  const registerInvoice = /^invoice-(\d+)$/.exec(id);
  let tenantIndex: number;
  let tenantId: string;
  let period: string;
  let amount: number;
  let status: string;
  let invoiceNumber: string;

  if (tenantInvoice) {
    tenantIndex = Number(tenantInvoice[2]);
    tenantId = tenantInvoice[1];
    period = tenantInvoice[3];
    amount = 24000 + (tenantIndex % 3) * 4000;
    const current = monthKey(new Date());
    status = period === current && tenantIndex % 3 === 0 ? "pending" : "paid";
    invoiceNumber = `DEMO-${tenantIndex + 1}-${period}`;
  } else if (registerInvoice) {
    tenantIndex = Number(registerInvoice[1]);
    tenantId = `tenant-${tenantIndex}`;
    period = monthKey(new Date());
    amount = 28000;
    status = tenantIndex < 8 ? "paid" : "pending";
    invoiceNumber = `INV-${1001 + tenantIndex}`;
  } else {
    return undefined;
  }
  const tenantName = tenantNames[tenantIndex];
  if (!tenantName) return undefined;
  const propertyNames = ["Acacia Court", "Cedar Heights", "Garden Residences"];

  return invoiceDetail({
    _id: id,
    invoiceNumber,
    tenantId,
    tenantName,
    tenantEmail: `${tenantName.toLowerCase().replace(" ", ".")}@example.com`,
    propertyName: propertyNames[tenantIndex % propertyNames.length],
    unitNumber: `${String.fromCharCode(65 + (tenantIndex % 3))}${Math.floor(tenantIndex / 3) + 1}`,
    period,
    issueDate: `${period}-01`,
    dueDate: `${period}-05`,
    amount,
    paidAmount: status === "paid" ? amount : 0,
    balanceAmount: status === "paid" ? 0 : amount,
    status,
    issuerSnapshot: {
      name: "INZU fictional preview workspace",
      email: "preview@example.com",
    },
    lineItems: [{ description: "Sample monthly rent", amount }],
    paymentInstructions:
      "Fictional preview only. No payment request or transaction is available.",
  });
}
