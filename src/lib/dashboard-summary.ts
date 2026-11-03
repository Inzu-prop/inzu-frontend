export type DashboardSummary = {
  totalExpected?: number;
  totalCollected?: number;
  totalArrears?: number;
  collectionRate?: number;
  occupancyRate?: number;
  totalProperties?: number;
  totalUnits?: number;
  totalTenants?: number;
  openTickets?: number;
};

type SummaryResponse = DashboardSummary & {
  financials?: {
    expected?: number;
    collected?: number;
    arrears?: number;
    collectionRate?: number;
  };
  occupancy?: { totalUnits?: number; occupancyRate?: number };
  byProperty?: unknown[];
};

export function paginationTotal(
  value: unknown,
  key: string,
): number | undefined {
  const response = value as
    | { pagination?: { total?: number }; [key: string]: unknown }
    | undefined;
  const rows = response?.[key];
  return (
    response?.pagination?.total ??
    (Array.isArray(rows) ? rows.length : undefined)
  );
}

// Adapt the current API response while retaining support for older summary data.
export function dashboardSummary(
  value: unknown,
  counts: Pick<
    DashboardSummary,
    "totalProperties" | "totalTenants" | "openTickets"
  > = {},
): DashboardSummary {
  const summary = (value ?? {}) as SummaryResponse;
  return {
    totalExpected: summary.financials?.expected ?? summary.totalExpected,
    totalCollected: summary.financials?.collected ?? summary.totalCollected,
    totalArrears: summary.financials?.arrears ?? summary.totalArrears,
    collectionRate:
      summary.financials?.collectionRate ?? summary.collectionRate,
    occupancyRate: summary.occupancy?.occupancyRate ?? summary.occupancyRate,
    totalUnits: summary.occupancy?.totalUnits ?? summary.totalUnits,
    totalProperties:
      summary.byProperty?.length ??
      counts.totalProperties ??
      summary.totalProperties,
    totalTenants: counts.totalTenants ?? summary.totalTenants,
    openTickets: counts.openTickets ?? summary.openTickets,
  };
}
