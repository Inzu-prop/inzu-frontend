interface PnlRow {
  propertyId?: string;
  propertyName?: string;
  period?: string;
  income: number;
  expenses: number;
  netIncome: number;
}

interface PnlData {
  groupBy: "property" | "month" | string;
  rows: PnlRow[];
}

function formatKES(amount: number) {
  return `KES ${Number(amount).toLocaleString()}`;
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  if (!year || !month) return period;
  return new Date(Number(year), Number(month) - 1).toLocaleString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function rowLabel(row: PnlRow, groupBy: string) {
  if (groupBy === "month" && row.period) return formatPeriod(row.period);
  return row.propertyName ?? row.propertyId ?? "—";
}

export function PnlReport({ data }: { data: PnlData }) {
  const { groupBy, rows } = data;

  const totalIncome = rows.reduce((s, r) => s + r.income, 0);
  const totalExpenses = rows.reduce((s, r) => s + r.expenses, 0);
  const totalNet = rows.reduce((s, r) => s + r.netIncome, 0);
  const marginPct =
    totalIncome > 0 ? (totalNet / totalIncome) * 100 : null;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Income
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatKES(totalIncome)}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Expenses
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatKES(totalExpenses)}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Net Income
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              totalNet < 0
                ? "text-destructive"
                : "text-[#32533D] dark:text-[#90B494]"
            }`}
          >
            {totalNet < 0 ? "-" : ""}
            {formatKES(Math.abs(totalNet))}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Margin
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              marginPct === null
                ? "text-muted-foreground"
                : marginPct < 0
                  ? "text-destructive"
                  : "text-foreground"
            }`}
          >
            {marginPct === null ? "—" : `${marginPct.toFixed(1)}%`}
          </p>
        </div>
      </div>

      {/* Per-row breakdown table */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          {groupBy === "month" ? "Monthly breakdown" : "Per-property breakdown"}
        </h3>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                  {groupBy === "month" ? "Period" : "Property"}
                </th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                  Income
                </th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                  Expenses
                </th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                  Net Income
                </th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => {
                const margin =
                  row.income > 0 ? (row.netIncome / row.income) * 100 : null;
                return (
                  <tr
                    key={row.propertyId ?? row.period ?? i}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2 font-medium">
                      {rowLabel(row, groupBy)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatKES(row.income)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatKES(row.expenses)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        row.netIncome < 0
                          ? "text-destructive"
                          : "text-[#32533D] dark:text-[#90B494]"
                      }`}
                    >
                      {row.netIncome < 0 ? "-" : ""}
                      {formatKES(Math.abs(row.netIncome))}
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {margin === null ? "—" : `${margin.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No data for this period.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t border-border bg-muted/50">
                <tr>
                  <td className="px-4 py-2 font-semibold">Total</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatKES(totalIncome)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatKES(totalExpenses)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      totalNet < 0
                        ? "text-destructive"
                        : "text-[#32533D] dark:text-[#90B494]"
                    }`}
                  >
                    {totalNet < 0 ? "-" : ""}
                    {formatKES(Math.abs(totalNet))}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-muted-foreground">
                    {marginPct === null ? "—" : `${marginPct.toFixed(1)}%`}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
