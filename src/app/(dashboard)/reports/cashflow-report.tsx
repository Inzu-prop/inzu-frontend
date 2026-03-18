interface ForecastRow {
  period: string;
  expectedRent: number;
  projectedCollections: number;
}

interface CashflowData {
  avgCollectionRate: number;
  forecasts: ForecastRow[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export function CashflowReport({ data }: { data: CashflowData }) {
  const { avgCollectionRate, forecasts } = data;
  const maxExpected = Math.max(...forecasts.map((f) => f.expectedRent), 1);
  const totalExpected = forecasts.reduce((s, f) => s + f.expectedRent, 0);
  const totalProjected = forecasts.reduce((s, f) => s + f.projectedCollections, 0);
  const collectionPct = (avgCollectionRate * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Avg Collection Rate
          </p>
          <p className={`mt-1 text-3xl font-bold ${avgCollectionRate >= 0.8 ? "text-[#32533D] dark:text-[#90B494]" : avgCollectionRate >= 0.5 ? "text-[#825D42]" : "text-destructive"}`}>
            {collectionPct}%
          </p>
        </div>
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Expected Rent
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatCurrency(totalExpected)}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Projected Collections
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatCurrency(totalProjected)}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Forecast Periods
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {forecasts.length}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Monthly Forecast
        </h3>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end gap-2 h-48">
            {forecasts.map((row) => {
              const expectedPct = (row.expectedRent / maxExpected) * 100;
              const collectedPct = (row.projectedCollections / maxExpected) * 100;
              return (
                <div key={row.period} className="flex flex-1 flex-col items-center gap-1 h-full">
                  <div className="relative flex w-full flex-1 items-end gap-1">
                    {/* Expected */}
                    <div
                      className="flex-1 rounded-t bg-primary/20 transition-all"
                      style={{ height: `${expectedPct}%` }}
                      title={`Expected: ${formatCurrency(row.expectedRent)}`}
                    />
                    {/* Projected collections */}
                    <div
                      className="flex-1 rounded-t bg-primary transition-all"
                      style={{ height: `${collectedPct || 1}%`, opacity: collectedPct === 0 ? 0.15 : 1 }}
                      title={`Projected: ${formatCurrency(row.projectedCollections)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatPeriod(row.period)}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/20" />
              Expected rent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
              Projected collections
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          Period Breakdown
        </h3>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Period</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Expected Rent</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Projected Collections</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Gap</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {forecasts.map((row) => {
                const gap = row.projectedCollections - row.expectedRent;
                const rate = row.expectedRent > 0
                  ? ((row.projectedCollections / row.expectedRent) * 100).toFixed(1)
                  : "—";
                return (
                  <tr key={row.period} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{formatPeriod(row.period)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(row.expectedRent)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(row.projectedCollections)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${gap < 0 ? "text-destructive" : "text-[#32533D] dark:text-[#90B494]"}`}>
                      {gap < 0 ? "-" : "+"}{formatCurrency(Math.abs(gap))}
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{rate}{rate !== "—" ? "%" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-border bg-muted/50">
              <tr>
                <td className="px-4 py-2 font-semibold">Total</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totalExpected)}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totalProjected)}</td>
                <td className={`px-4 py-2 text-right font-semibold ${totalProjected - totalExpected < 0 ? "text-destructive" : "text-[#32533D] dark:text-[#90B494]"}`}>
                  {totalProjected - totalExpected < 0 ? "-" : "+"}{formatCurrency(Math.abs(totalProjected - totalExpected))}
                </td>
                <td className="px-4 py-2 text-right text-muted-foreground">
                  {totalExpected > 0 ? ((totalProjected / totalExpected) * 100).toFixed(1) + "%" : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
