"use client";

import Container from "@/components/container";
import { useTenantMe } from "@/contexts/tenant-me-context";

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  } catch {
    return value;
  }
}

function formatCurrency(amount: number | undefined, currency = ""): string {
  if (amount == null) return "—";
  return `${currency ? currency + " " : ""}${Number(amount).toLocaleString()}`;
}

export default function TenantPortalPage() {
  const { data } = useTenantMe();

  const unit = data?.unit ?? null;
  const recentInvoices = data?.recentInvoices ?? [];
  const recentPayments = data?.recentPayments ?? [];
  const recentMaintenanceTickets = data?.recentMaintenanceTickets ?? [];

  return (
    <Container className="py-10">
      <section className="mb-8 space-y-2">
        <h2 className="text-2xl font-semibold">Your dashboard</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          View your unit, rent and invoices, payments, and maintenance
          requests in one place.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Your unit</h3>
          {unit ? (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {(unit.unitNumber || unit.label || unit.address || unit.addressLine1) && (
                <p className="font-medium text-foreground">
                  {unit.unitNumber
                    ? `Unit ${unit.unitNumber}`
                    : unit.label ?? unit.address ?? unit.addressLine1 ?? "—"}
                </p>
              )}
              {unit.addressLine1 && unit.label !== unit.addressLine1 && (
                <p>{unit.addressLine1}</p>
              )}
              {(unit.city || unit.country) && (
                <p>
                  {[unit.city, unit.country].filter(Boolean).join(", ")}
                </p>
              )}
              {(unit.leaseStart || unit.leaseEnd) && (
                <p>
                  Lease: {formatDate(unit.leaseStart)} —{" "}
                  {unit.leaseEnd ? formatDate(unit.leaseEnd) : "Ongoing"}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No unit assigned yet. Your landlord will link you to a unit when
              your lease is set up.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Your rent & invoices</h3>
          {recentInvoices.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {recentInvoices.slice(0, 5).map((inv) => (
                <li
                  key={inv._id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">
                    {inv.periodStart && inv.periodEnd
                      ? `${formatDate(inv.periodStart)} – ${formatDate(inv.periodEnd)}`
                      : formatDate(inv.dueDate)}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(inv.amount)}
                    {inv.status && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {inv.status}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No invoices yet. When your landlord generates invoices, they will
              appear here.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Recent payments</h3>
          {recentPayments.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {recentPayments.slice(0, 5).map((pay) => (
                <li
                  key={pay._id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">
                    {formatDate(pay.paidAt)}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(pay.amount)}
                    {pay.method && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {pay.method}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No payments recorded yet.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Maintenance requests</h3>
          {recentMaintenanceTickets.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {recentMaintenanceTickets.slice(0, 5).map((ticket) => (
                <li
                  key={ticket._id}
                  className="flex flex-col gap-1 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {ticket.title ?? "Maintenance request"}
                  </span>
                  <span className="text-muted-foreground">
                    {ticket.status ?? "—"} · {formatDate(ticket.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No maintenance requests yet. You can request maintenance from your
              landlord when the feature is available.
            </p>
          )}
        </div>
      </section>
    </Container>
  );
}
