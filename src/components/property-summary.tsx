"use client";

/** Shared summary for real properties and the local-only preview. */
export function PropertySummary({
  totalUnits,
  totalFloors,
  yearBuilt,
  purchasePrice,
  currentValue,
}: {
  totalUnits?: number;
  totalFloors?: number;
  yearBuilt?: number;
  purchasePrice?: number;
  currentValue?: number;
}) {
  const metrics = [
    ["Declared units", totalUnits],
    ["Floors", totalFloors],
    ["Year built", yearBuilt],
    ["Purchase price", purchasePrice],
    ["Current value", currentValue],
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.filter(([, value]) => value != null).map(([label, value]) => (
        <section key={label} className="border-border-button-default bg-background-primary-default rounded-3xl border p-4">
          <p className="text-body-2-regular text-text-secondary">{label}</p>
          <p className="text-title-3-semibold text-text-primary mt-2">
            {typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-KE", { maximumFractionDigits: 2 }) : "Not recorded"}
          </p>
        </section>
      ))}
    </div>
  );
}
