interface PropertyRow {
  propertyId: string;
  propertyName: string;
  occupancyRate: number;
  income: number;
  arrears: number;
}

interface MonthlyRow {
  period: { period: string; start: string; end: string };
  expected: number;
  collected: number;
  arrears: number;
  occupancyRate: number;
}

interface ComparativeData {
  periodRange: { from: string; to: string };
  byProperty: PropertyRow[];
  monthly: MonthlyRow[];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function OccupancyBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const color =
    pct >= 80 ? "bg-[#90B494]" : pct >= 50 ? "bg-[#825D42]" : "bg-[hsl(var(--inzu-red))]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function ComparativeReport({ data }: { data: ComparativeData }) {
  const { periodRange, byProperty, monthly } = data;

  const totalExpected = monthly.reduce((s, m) => s + m.expected, 0);
  const totalCollected = monthly.reduce((s, m) => s + m.collected, 0);
  const totalArrears = monthly.reduce((s, m) => s + m.arrears, 0);
  const avgOccupancy =
    monthly.length > 0
      ? monthly.reduce((s, m) => s + m.occupancyRate, 0) / monthly.length
      : 0;
  const collectionRate =
    totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  const rangeLabel =
    periodRange.from === periodRange.to
      ? formatPeriod(periodRange.from)
      : `${formatPeriod(periodRange.from)} – ${formatPeriod(periodRange.to)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Comparative Report
        </h2>
        <span className="text-sm text-muted-foreground">{rangeLabel}</span>
      </div>

      {/* Summary cards */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expected Rent</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(totalExpected)}</p>
        </div>
        <div className="flex-1 min-w-[150px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Collected</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="flex-1 min-w-[150px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arrears</p>
          <p className={`mt-1 text-2xl font-bold ${totalArrears > 0 ? "text-destructive" : "text-foreground"}`}>
            {formatCurrency(totalArrears)}
          </p>
        </div>
        <div className="flex-1 min-w-[150px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Collection Rate</p>
          <p className={`mt-1 text-2xl font-bold ${collectionRate >= 80 ? "text-[#32533D] dark:text-[#90B494]" : collectionRate >= 50 ? "text-[#825D42]" : "text-destructive"}`}>
            {collectionRate.toFixed(1)}%
          </p>
        </div>
        <div className="flex-1 min-w-[150px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avg Occupancy</p>
          <p className={`mt-1 text-2xl font-bold ${avgOccupancy >= 0.8 ? "text-[#32533D] dark:text-[#90B494]" : avgOccupancy >= 0.5 ? "text-[#825D42]" : "text-destructive"}`}>
            {(avgOccupancy * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Monthly breakdown */}
      {monthly.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Monthly Breakdown</h3>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Period</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Expected</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Collected</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Arrears</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Collection Rate</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthly.map((row) => {
                  const rate = row.expected > 0 ? (row.collected / row.expected) * 100 : 0;
                  return (
                    <tr key={row.period.period} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 font-medium">{formatPeriod(row.period.period)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(row.expected)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(row.collected)}</td>
                      <td className={`px-4 py-2 text-right font-medium ${row.arrears > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {formatCurrency(row.arrears)}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">{rate.toFixed(1)}%</td>
                      <td className="px-4 py-2">
                        <OccupancyBar rate={row.occupancyRate} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {monthly.length > 1 && (
                <tfoot className="border-t border-border bg-muted/50">
                  <tr>
                    <td className="px-4 py-2 font-semibold">Total</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totalExpected)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totalCollected)}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${totalArrears > 0 ? "text-destructive" : ""}`}>{formatCurrency(totalArrears)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : "0"}%
                    </td>
                    <td className="px-4 py-2 text-muted-foreground text-xs">
                      avg {(avgOccupancy * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* By property */}
      {byProperty.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">By Property</h3>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Property</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Income</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Arrears</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byProperty.map((row) => (
                  <tr key={row.propertyId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2">
                      <p className="font-medium">{row.propertyName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{row.propertyId}</p>
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(row.income)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${row.arrears > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {formatCurrency(row.arrears)}
                    </td>
                    <td className="px-4 py-2">
                      <OccupancyBar rate={row.occupancyRate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
