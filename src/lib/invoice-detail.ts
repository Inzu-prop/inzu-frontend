export type InvoiceRecord = Record<string, unknown>;

function record(value: unknown): InvoiceRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as InvoiceRecord)
    : {};
}

function words(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteAmount(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function firstAmount(...values: unknown[]): number | undefined {
  return values.map(finiteAmount).find((value) => value !== undefined);
}

function firstWords(...values: unknown[]): string {
  return values.map(words).find(Boolean) ?? "";
}

export type InvoiceLineItem = {
  description: string;
  quantity?: number;
  unitAmount?: number;
  totalAmount?: number;
};

export type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  period: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totalAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  propertyName: string;
  unitNumber: string;
  issuerName: string;
  issuerContact: string;
  paymentInstructions: string;
  lineItems: InvoiceLineItem[];
  raw: InvoiceRecord;
};

/**
 * Normalizes only values present in the invoice response. It deliberately does
 * not derive historical billing details from current tenant or property data.
 */
export function invoiceDetail(value: unknown): InvoiceDetail {
  const outer = record(value);
  const invoice = record(outer.invoice ?? outer);
  const tenantSnapshot = record(
    invoice.tenantSnapshot ?? invoice.billingTenant ?? invoice.billTo,
  );
  const tenantRelation = record(invoice.tenant);
  const propertySnapshot = record(
    invoice.propertySnapshot ?? invoice.billingProperty,
  );
  const unitSnapshot = record(invoice.unitSnapshot ?? invoice.billingUnit);
  const issuerSnapshot = record(invoice.issuerSnapshot);
  const sourceItems = Array.isArray(invoice.lineItems)
    ? invoice.lineItems
    : Array.isArray(invoice.items)
      ? invoice.items
      : [];
  const lineItems = sourceItems
    .map(record)
    .map((item) => ({
      description: firstWords(item.description, item.name, item.label),
      quantity: firstAmount(item.quantity),
      unitAmount: firstAmount(item.unitAmount, item.unitPrice, item.rate),
      totalAmount: firstAmount(item.totalAmount, item.amount, item.total),
    }))
    .filter(
      (item) =>
        Boolean(item.description) ||
        item.quantity !== undefined ||
        item.unitAmount !== undefined ||
        item.totalAmount !== undefined,
    );

  return {
    id: firstWords(invoice._id, invoice.id),
    invoiceNumber: firstWords(invoice.invoiceNumber, invoice.number),
    period: firstWords(invoice.period, invoice.billingPeriod),
    status: firstWords(invoice.status),
    issueDate: firstWords(invoice.issueDate, invoice.issuedAt),
    dueDate: firstWords(invoice.dueDate),
    totalAmount: firstAmount(invoice.totalAmount, invoice.amount),
    paidAmount: firstAmount(invoice.paidAmount, invoice.amountPaid),
    balanceAmount: firstAmount(
      invoice.balanceAmount,
      invoice.balance,
      invoice.amountDue,
    ),
    tenantId: firstWords(
      typeof invoice.tenantId === "string" ? invoice.tenantId : undefined,
      record(invoice.tenantId)._id,
      tenantSnapshot._id,
      tenantSnapshot.id,
      tenantRelation._id,
      tenantRelation.id,
    ),
    tenantName: firstWords(
      invoice.tenantName,
      invoice.billingName,
      tenantSnapshot.name,
      [words(tenantSnapshot.firstName), words(tenantSnapshot.lastName)]
        .filter(Boolean)
        .join(" "),
    ),
    tenantEmail: firstWords(invoice.tenantEmail, tenantSnapshot.email),
    propertyName: firstWords(invoice.propertyName, propertySnapshot.name),
    unitNumber: firstWords(
      invoice.unitNumber,
      unitSnapshot.unitNumber,
      unitSnapshot.number,
    ),
    issuerName: firstWords(invoice.issuerName, issuerSnapshot.name),
    issuerContact: firstWords(
      invoice.issuerContact,
      issuerSnapshot.email,
      issuerSnapshot.phoneNumber,
    ),
    paymentInstructions: firstWords(invoice.paymentInstructions),
    lineItems,
    raw: invoice,
  };
}

export function invoiceDetailForRoute(
  value: unknown,
  expectedInvoiceId: string,
): InvoiceDetail {
  const detail = invoiceDetail(value);
  if (!detail.id)
    throw new Error("The invoice response did not include an ID.");
  if (detail.id !== expectedInvoiceId)
    throw new Error("The API returned a different invoice.");
  return detail;
}
