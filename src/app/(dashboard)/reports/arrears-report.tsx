interface TenantRow {
  tenantId: string;
  amountOverdue: number;
}

interface PropertyRow {
  propertyId: string;
  amountOverdue: number;
}

interface ArrearsData {
  asOf: string;
  totalArrears: number;
  byTenant: TenantRow[];
  byProperty: PropertyRow[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ArrearTable({
  caption,
  idLabel,
  rows,
  idKey,
}: {
  caption: string;
  idLabel: string;
  rows: { id: string; amountOverdue: number }[];
  _idKey: string;
}) {
  if (rows.length === 0) return null;
  const total = rows.reduce((s, r) => s + r.amountOverdue, 0);
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{caption}</h3>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                {idLabel}
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                Amount Overdue
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                  {row.id}
                </td>
                <td className="px-4 py-2 text-right font-medium text-destructive">
                  {formatCurrency(row.amountOverdue)}
                </td>
                <td className="px-4 py-2 text-right text-muted-foreground">
                  {total > 0 ? ((row.amountOverdue / total) * 100).toFixed(1) : "0"}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border bg-muted/50">
            <tr>
              <td className="px-4 py-2 font-semibold">Total</td>
              <td className="px-4 py-2 text-right font-semibold text-destructive">
                {formatCurrency(total)}
              </td>
              <td className="px-4 py-2 text-right text-muted-foreground">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function ArrearsReport({ data }: { data: ArrearsData }) {
  const tenantRows = data.byTenant.map((r) => ({ id: r.tenantId, amountOverdue: r.amountOverdue }));
  const propertyRows = data.byProperty.map((r) => ({ id: r.propertyId, amountOverdue: r.amountOverdue }));

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Arrears
          </p>
          <p className="mt-1 text-3xl font-bold text-destructive">
            {formatCurrency(data.totalArrears)}
          </p>
        </div>
        <div className="flex-1 min-w-[180px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tenants in Arrears
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {data.byTenant.length}
          </p>
        </div>
        <div className="flex-1 min-w-[180px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Properties Affected
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {data.byProperty.length}
          </p>
        </div>
        <div className="flex-1 min-w-[180px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            As Of
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {formatDate(data.asOf)}
          </p>
        </div>
      </div>

      {/* Breakdown tables */}
      <ArrearTable
        caption="By Tenant"
        idLabel="Tenant ID"
        rows={tenantRows}
        idKey="tenantId"
      />
      <ArrearTable
        caption="By Property"
        idLabel="Property ID"
        rows={propertyRows}
        idKey="propertyId"
      />
    </div>
  );
}
