import type {
  CreatePropertyBody,
  PropertiesListResponse,
  PropertyCreateResponse,
  PropertyDeleteResponse,
  PropertyGetResponse,
  PropertyUploadPhotoResponse,
  UpdatePropertyBody,
} from "./properties";
import type {
  BulkCreateUnitsBody,
  BulkCreateUnitsResponse,
  BulkDeleteUnitsBody,
  BulkDeleteUnitsResponse,
  BulkUpdateUnitsBody,
  BulkUpdateUnitsResponse,
  CreateUnitBody,
  Unit,
} from "./units";
import type {
  GenerateInvoicesBody,
  GenerateInvoicesResponse,
  InvoiceListItem,
} from "./invoices";
import { ApiError } from "./errors";

export type SendPortalInviteResponse = {
  success: true;
  message: string;
  alreadyHasAccess?: boolean;
};

export type ArrearsSettings = {
  friendlyReminderDays: number;
  formalReminderDays: number;
  autoSendReminders: boolean;
  reminderChannels: "email" | "whatsapp" | "both";
};

export type NotificationSettings = {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  notifyOnPaymentReceived: boolean;
  notifyOnInvoiceGenerated: boolean;
};

export type OrgSettings = {
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  invoiceNumberPrefix: string;
  paymentNumberPrefix: string;
  autoGenerateInvoices: boolean;
  defaultPaymentTerms: number;
  defaultRentDueDay: number;
  defaultLateFeeAmount: number;
  defaultLateFeeAfterDays: number;
  arrears: ArrearsSettings;
  notifications: NotificationSettings;
};

export type SettingsGetResponse = {
  settings: OrgSettings;
};

export type AuthMeResponse = {
  user?: { role?: string; permissions?: string[]; [key: string]: unknown };
  organizations?: { _id: string; [key: string]: unknown }[];
  tenant?: {
    _id: string;
    organizationId: string;
    status?: string;
    unitId?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    [key: string]: unknown;
  } | null;
};

export type TenantMeResponse = {
  tenant: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    [key: string]: unknown;
  };
  organization: { name: string; [key: string]: unknown };
  unit: {
    _id?: string;
    unitNumber?: string;
    label?: string;
    address?: string;
    addressLine1?: string;
    city?: string;
    country?: string;
    leaseStart?: string;
    leaseEnd?: string | null;
    [key: string]: unknown;
  } | null;
  recentInvoices: Array<{
    _id: string;
    amount?: number;
    dueDate?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
    [key: string]: unknown;
  }>;
  recentPayments: Array<{
    _id: string;
    amount?: number;
    paidAt?: string;
    method?: string;
    [key: string]: unknown;
  }>;
  recentMaintenanceTickets: Array<{
    _id: string;
    title?: string;
    status?: string;
    createdAt?: string;
    [key: string]: unknown;
  }>;
};

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return url.replace(/\/$/, "");
}

export type InzuApiDeps = {
  getToken: () => Promise<string | null>;
  getOrganizationId: () => string | null;
};

function buildUrl(
  baseUrl: string,
  path: string,
  organizationId: string | null,
  params?: Record<string, string>,
): string {
  const resolvedPath = path.includes(":organizationId")
    ? path.replace(/:organizationId/g, organizationId ?? "")
    : path;
  const url = new URL(resolvedPath, baseUrl + "/");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

export function createInzuApiClient(deps: InzuApiDeps) {
  const baseUrl = getBaseUrl();

  async function request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string>;
      requiresOrg?: boolean;
    },
  ): Promise<T> {
    const token = await deps.getToken();
    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }
    const organizationId = deps.getOrganizationId();
    if (options?.requiresOrg !== false && path.includes(":organizationId") && !organizationId) {
      throw new ApiError(400, "Organization context required");
    }
    const url = buildUrl(baseUrl, path, organizationId, options?.params);
    if (options?.body !== undefined) {
      console.log("[api] request body for", method, path, JSON.stringify(options.body));
    }
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options?.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, `API error ${res.status}`, text);
    }
    if (res.status === 204) {
      return undefined as T;
    }
    return res.json() as Promise<T>;
  }

  return {
    auth: {
      me: () => request<AuthMeResponse>("GET", "auth/me", { requiresOrg: false }),
      getOrganization: (organizationId: string) =>
        request<unknown>("GET", `auth/organizations/${organizationId}`, { requiresOrg: false }),
      createOrganization: (body: unknown) =>
        request<unknown>("POST", "auth/organizations", { body, requiresOrg: false }),
      inviteToOrganization: (organizationId: string, body: unknown) =>
        request<unknown>("POST", `auth/organizations/${organizationId}/invite`, {
          body,
          requiresOrg: false,
        }),
    },
    tenant: {
      me: () =>
        request<TenantMeResponse>("GET", "tenant/me", { requiresOrg: false }),
    },
    dashboard: {
      getSummary: () =>
        request<unknown>("GET", "organizations/:organizationId/dashboard/summary"),
      getProperty: (propertyId: string) =>
        request<unknown>("GET", `organizations/:organizationId/dashboard/property/${propertyId}`),
      getTrends: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/dashboard/trends", {
          params,
        }),
    },
    properties: {
      list: (params?: Record<string, string>) =>
        request<PropertiesListResponse>("GET", "organizations/:organizationId/properties", {
          params,
        }),
      get: (propertyId: string) =>
        request<PropertyGetResponse>("GET", `organizations/:organizationId/properties/${propertyId}`),
      create: (body: CreatePropertyBody) =>
        request<PropertyCreateResponse>("POST", "organizations/:organizationId/properties", { body }),
      update: (propertyId: string, body: UpdatePropertyBody) =>
        request<PropertyGetResponse>("PUT", `organizations/:organizationId/properties/${propertyId}`, {
          body,
        }),
      delete: (propertyId: string) =>
        request<PropertyDeleteResponse>("DELETE", `organizations/:organizationId/properties/${propertyId}`),
      getUploadPhotoUrl: (propertyId: string, body?: { fileName: string; contentType?: string }) =>
        request<PropertyUploadPhotoResponse>(
          "POST",
          `organizations/:organizationId/properties/${propertyId}/upload-photo`,
          { body: body ?? { fileName: "" } },
        ),
    },
    units: {
      list: (params?: Record<string, string>) =>
        request<Unit[]>("GET", "organizations/:organizationId/units", { params }),
      get: (unitId: string) =>
        request<Unit>("GET", `organizations/:organizationId/units/${unitId}`),
      createAtProperty: (propertyId: string, body: CreateUnitBody) =>
        request<Unit>(
          "POST",
          `organizations/:organizationId/properties/${propertyId}/units`,
          { body },
        ),
      createBulk: (propertyId: string, body: BulkCreateUnitsBody) =>
        request<BulkCreateUnitsResponse>(
          "POST",
          `organizations/:organizationId/properties/${propertyId}/units/bulk`,
          { body },
        ),
      create: (body: CreateUnitBody & { propertyId?: string }) =>
        request<Unit>("POST", "organizations/:organizationId/units", { body }),
      update: (unitId: string, body: Partial<CreateUnitBody>) =>
        request<Unit>("PUT", `organizations/:organizationId/units/${unitId}`, { body }),
      delete: (unitId: string) =>
        request<void>("DELETE", `organizations/:organizationId/units/${unitId}`),
      bulkDelete: (body: BulkDeleteUnitsBody) =>
        request<BulkDeleteUnitsResponse>("DELETE", "organizations/:organizationId/units/bulk", { body }),
      bulkUpdate: (body: BulkUpdateUnitsBody) =>
        request<BulkUpdateUnitsResponse>("PUT", "organizations/:organizationId/units/bulk", { body }),
    },
    tenants: {
      list: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/tenants", { params }),
      get: (tenantId: string) =>
        request<unknown>("GET", `organizations/:organizationId/tenants/${tenantId}`),
      create: (body: unknown) =>
        request<unknown>("POST", "organizations/:organizationId/tenants", { body }),
      update: (tenantId: string, body: unknown) =>
        request<unknown>("PUT", `organizations/:organizationId/tenants/${tenantId}`, { body }),
      delete: (tenantId: string) =>
        request<unknown>("DELETE", `organizations/:organizationId/tenants/${tenantId}`),
      sendPortalInvite: (tenantId: string, body?: { redirectUrl?: string }) =>
        request<SendPortalInviteResponse>(
          "POST",
          `organizations/:organizationId/tenants/${tenantId}/send-portal-invite`,
          { body: body ?? {} },
        ),
    },
    invoices: {
      list: (params?: Record<string, string>) =>
        request<InvoiceListItem[]>("GET", "organizations/:organizationId/invoices", { params }),
      get: (invoiceId: string) =>
        request<InvoiceListItem>("GET", `organizations/:organizationId/invoices/${invoiceId}`),
      generate: (body: GenerateInvoicesBody) =>
        request<GenerateInvoicesResponse>(
          "POST",
          "organizations/:organizationId/invoices/generate",
          { body },
        ),
    },
    mpesaPayments: {
      initiate: (body: { amount: number; phoneNumber: string; orderId: string }) =>
        request<{ paymentId: string; status: "pending" | "success" | "failed" }>(
          "POST",
          "payments/mpesa/initiate",
          { body, requiresOrg: false },
        ),
      getStatus: (paymentId: string) =>
        request<{ paymentId: string; status: "pending" | "success" | "failed"; orderId: string }>(
          "GET",
          `payments/mpesa/status/${paymentId}`,
          { requiresOrg: false },
        ),
    },
    payments: {
      list: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/payments", { params }),
      request: (body: unknown) =>
        request<unknown>("POST", "organizations/:organizationId/payments/request", { body }),
      reconcile: (body: unknown) =>
        request<unknown>("POST", "organizations/:organizationId/payments/reconcile", { body }),
    },
    arrears: {
      run: (body?: unknown) =>
        request<unknown>("POST", "organizations/:organizationId/arrears/run", {
          body: body ?? {},
        }),
    },
    maintenance: {
      list: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/maintenance", { params }),
      get: (ticketId: string) =>
        request<unknown>("GET", `organizations/:organizationId/maintenance/${ticketId}`),
      create: (body: unknown) =>
        request<unknown>("POST", "organizations/:organizationId/maintenance", { body }),
      update: (ticketId: string, body: unknown) =>
        request<unknown>("PUT", `organizations/:organizationId/maintenance/${ticketId}`, { body }),
      getUploadPhotoUrl: (ticketId: string, body?: unknown) =>
        request<{ url: string }>(
          "POST",
          `organizations/:organizationId/maintenance/${ticketId}/upload-photo`,
          { body: body ?? {} },
        ),
    },
    reports: {
      pnl: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/reports/pnl", { params }),
      arrears: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/reports/arrears", { params }),
      cashflow: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/reports/cashflow", { params }),
      comparative: (params?: Record<string, string>) =>
        request<unknown>("GET", "organizations/:organizationId/reports/comparative", { params }),
    },
    settings: {
      get: () =>
        request<SettingsGetResponse>("GET", "organizations/:organizationId/settings"),
      update: (body: Partial<OrgSettings>) =>
        request<SettingsGetResponse>("PUT", "organizations/:organizationId/settings", { body }),
    },
  };
}

export type InzuApiClient = ReturnType<typeof createInzuApiClient>;
