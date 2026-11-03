import { Chip, type ChipColor } from "@/components/base/badges/chip";
import { ButtonLink } from "@/components/base/buttons/button";
import type { InvoiceDetail } from "@/lib/invoice-detail";
import { dateLabel, money } from "@/lib/tenant-profile";

const panel =
  "rounded-3xl border border-border-button-default bg-background-primary-default p-5";

function statusColor(status: string): ChipColor {
  switch (status.toLowerCase()) {
    case "paid":
      return "lime";
    case "overdue":
      return "rose";
    case "pending":
      return "yellow";
    case "cancelled":
      return "neutral";
    default:
      return "gray";
  }
}

function Fields({ values }: { values: [string, string][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {values.map(([label, value]) => (
        <div key={label}>
          <dt className="text-body-2-regular text-text-tertiary">{label}</dt>
          <dd className="text-body-medium text-text-primary mt-1 break-words">
            {value || "Not recorded"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function InvoiceDetailView({
  invoice,
  backHref,
  preview = false,
}: {
  invoice: InvoiceDetail;
  backHref: string;
  preview?: boolean;
}) {
  const billingFields: [string, string][] = [
    ["Tenant", invoice.tenantName],
    ["Email", invoice.tenantEmail],
    ["Property", invoice.propertyName],
    ["Unit", invoice.unitNumber],
  ].filter(([, value]) => Boolean(value)) as [string, string][];
  const issuerFields: [string, string][] = [
    ["Issuer", invoice.issuerName],
    ["Contact", invoice.issuerContact],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <ButtonLink href={backHref} variant="ghost" size="small">
          ← Back
        </ButtonLink>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-body-2-regular text-text-tertiary">Invoice</p>
          <h1 className="text-title-2-medium text-text-primary mt-1">
            <bdi>
              {invoice.invoiceNumber || invoice.id || "Invoice details"}
            </bdi>
          </h1>
          {preview && (
            <p className="text-body-2-regular text-text-secondary mt-2">
              Fictional preview record. No payment will be requested.
            </p>
          )}
        </div>
        <Chip color={statusColor(invoice.status)}>
          {invoice.status || "Status not recorded"}
        </Chip>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <section className={panel}>
          <p className="text-body-2-regular text-text-secondary">Total</p>
          <p className="text-title-3-semibold text-text-primary mt-2">
            {money(invoice.totalAmount)}
          </p>
        </section>
        <section className={panel}>
          <p className="text-body-2-regular text-text-secondary">Paid</p>
          <p className="text-title-3-semibold text-text-primary mt-2">
            {money(invoice.paidAmount)}
          </p>
        </section>
        <section className={panel}>
          <p className="text-body-2-regular text-text-secondary">Balance</p>
          <p className="text-title-3-semibold text-text-primary mt-2">
            {money(invoice.balanceAmount)}
          </p>
        </section>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className={panel}>
          <h2 className="text-headline-medium text-text-primary mb-5">
            Billing details
          </h2>
          <Fields
            values={[
              ["Billing period", invoice.period],
              [
                "Issue date",
                invoice.issueDate ? dateLabel(invoice.issueDate) : "",
              ],
              ["Due date", invoice.dueDate ? dateLabel(invoice.dueDate) : ""],
              ...billingFields,
            ]}
          />
        </section>
        <section className={panel}>
          <h2 className="text-headline-medium text-text-primary mb-5">
            Issuer and payment details
          </h2>
          {issuerFields.length || invoice.paymentInstructions ? (
            <Fields
              values={[
                ...issuerFields,
                ...(invoice.paymentInstructions
                  ? [
                      ["Payment instructions", invoice.paymentInstructions] as [
                        string,
                        string,
                      ],
                    ]
                  : []),
              ]}
            />
          ) : (
            <p className="text-body-regular text-text-secondary">
              No issuer or payment instructions were returned with this invoice.
            </p>
          )}
        </section>
      </div>

      {invoice.lineItems.length > 0 && (
        <section className={panel}>
          <h2 className="text-headline-medium text-text-primary mb-4">
            Line items
          </h2>
          <ul className="divide-separator-border divide-y">
            {invoice.lineItems.map((item, index) => (
              <li
                key={`${item.description}:${index}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-body-medium text-text-primary">
                    {item.description || "Description not recorded"}
                  </p>
                  {(item.quantity !== undefined ||
                    item.unitAmount !== undefined) && (
                    <p className="text-body-2-regular text-text-tertiary mt-1">
                      {item.quantity !== undefined
                        ? `Quantity ${item.quantity}`
                        : ""}
                      {item.quantity !== undefined &&
                      item.unitAmount !== undefined
                        ? " · "
                        : ""}
                      {item.unitAmount !== undefined
                        ? `${money(item.unitAmount)} each`
                        : ""}
                    </p>
                  )}
                </div>
                <span className="text-body-medium text-text-primary">
                  {money(item.totalAmount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-caption-1-regular text-text-tertiary">
        Only details returned with this invoice are shown. Missing amounts
        remain marked as not recorded.
      </p>
    </div>
  );
}
