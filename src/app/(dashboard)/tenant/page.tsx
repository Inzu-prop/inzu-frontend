"use client";

import { useEffect, useState } from "react";
import Container from "@/components/container";
import { useTenantMe } from "@/contexts/tenant-me-context";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import PaymentStatus from "@/components/payment-status";

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
  const { data, refetch } = useTenantMe();
  const api = useInzuApi();

  const unit = data?.unit ?? null;
  const recentInvoices = data?.recentInvoices ?? [];
  const recentPayments = data?.recentPayments ?? [];
  const recentMaintenanceTickets = data?.recentMaintenanceTickets ?? [];

  const latestInvoice = recentInvoices[0] ?? null;

  const [mpesaAmount, setMpesaAmount] = useState(
    latestInvoice?.amount != null ? String(latestInvoice.amount) : "",
  );
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaStatus, setMpesaStatus] = useState<
    "idle" | "initiating" | "pending" | "success" | "failed" | "error"
  >("idle");
  const [mpesaPaymentId, setMpesaPaymentId] = useState<string | null>(null);
  const [mpesaError, setMpesaError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    paymentId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (latestInvoice?.amount != null && !mpesaAmount) {
      setMpesaAmount(String(latestInvoice.amount));
    }
  }, [latestInvoice?.amount, mpesaAmount]);

  async function handleInitiateMpesa(event: React.FormEvent) {
    event.preventDefault();
    setMpesaError(null);

    const amountNumber = Number(mpesaAmount);
    if (!amountNumber || amountNumber <= 0) {
      setMpesaError("Enter a valid amount.");
      return;
    }
    if (!mpesaPhone || !/^2547\d{8}$/.test(mpesaPhone.trim())) {
      setMpesaError("Enter a valid M-Pesa phone (format 2547XXXXXXXX).");
      return;
    }

    try {
      setMpesaStatus("initiating");
      const orderId = latestInvoice?._id ?? "RENT_PAYMENT";
      const res = await api.mpesaPayments.initiate({
        amount: amountNumber,
        phoneNumber: mpesaPhone.trim(),
        orderId,
      });
      setMpesaPaymentId(res.paymentId);
      setMpesaStatus("pending");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not initiate payment.";
      setMpesaError(message);
      setMpesaStatus("error");
    }
  }

  function handleDismissConfirmation() {
    setConfirmation(null);
  }

  return (
    <>
      {confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-success-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2
                  id="payment-success-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Payment successful
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your M-Pesa payment has been confirmed.
                </p>
              </div>
              <div className="w-full rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-semibold text-foreground">
                    KES {Number(confirmation.amount).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="break-all font-mono text-xs text-foreground">
                    {confirmation.paymentId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissConfirmation}
                className="mt-1 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
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
          <div className="mt-5 border-t border-border pt-4">
            <h4 className="text-sm font-medium">Pay with M-Pesa</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the amount and your M-Pesa phone number to receive an STK
              push request.
            </p>
            <form
              onSubmit={handleInitiateMpesa}
              className="mt-3 flex flex-col gap-3 text-sm"
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="mpesa-amount"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Amount
                  </label>
                  <input
                    id="mpesa-amount"
                    type="number"
                    min={1}
                    step={1}
                    value={mpesaAmount}
                    onChange={(e) => setMpesaAmount(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="mpesa-phone"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    M-Pesa phone (2547…)
                  </label>
                  <input
                    id="mpesa-phone"
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="2547XXXXXXXX"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={mpesaStatus === "initiating" || mpesaStatus === "pending"}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mpesaStatus === "initiating"
                    ? "Sending STK push…"
                    : mpesaStatus === "pending"
                      ? "Waiting for confirmation…"
                      : "Pay with M-Pesa"}
                </button>
                {mpesaPaymentId && (
                  <span className="text-xs text-muted-foreground">
                    Payment ID: {mpesaPaymentId}
                  </span>
                )}
              </div>
              {mpesaStatus === "success" && (
                <p className="text-xs font-medium text-emerald-700">
                  Payment successful. Thank you.
                </p>
              )}
              {mpesaStatus === "failed" && (
                <p className="text-xs font-medium text-destructive">
                  Payment failed. Please try again.
                </p>
              )}
              {/* Reusable payment status UI handles polling and messages */}
              {mpesaError && (
                <p className="text-xs font-medium text-destructive">{mpesaError}</p>
              )}
              {mpesaPaymentId && mpesaStatus === "pending" && (
                <PaymentStatus
                  paymentId={mpesaPaymentId}
                  onConfirmed={() => {
                    setMpesaStatus("success");
                    void refetch();
                  }}
                  onFailed={() => {
                    setMpesaStatus("failed");
                  }}
                />
              )}
            </form>
          </div>
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
    </>
  );
}
