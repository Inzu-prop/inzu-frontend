export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export type InvoiceListItem = {
  _id: string;
  invoiceNumber?: string;
  period?: string;
  totalAmount?: number;
  amount?: number;
  status?: InvoiceStatus | string;
  tenantId?: string;
  dueDate?: string;
  [key: string]: unknown;
};

export type GenerateInvoicesBody = {
  period?: string;
  tenantIds?: string[];
};

export type GeneratedInvoice = {
  _id: string;
  invoiceNumber?: string;
  period?: string;
  totalAmount?: number;
  amount?: number;
  status?: InvoiceStatus | string;
  tenantId?: string;
  [key: string]: unknown;
};

export type GenerateInvoicesResponse = {
  generated: number;
  invoices: GeneratedInvoice[];
  errors?: string[];
};
