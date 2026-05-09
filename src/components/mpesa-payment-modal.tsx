"use client";

import { useState } from "react";
import { Smartphone, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PaymentStatus from "@/components/payment-status";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number?: string;
    period?: string;
    amount?: number;
  } | null;
  onPaymentConfirmed: () => void;
};

type Stage = "input" | "pending" | "success" | "failed";

function formatAmount(amount?: number) {
  if (amount == null) return "—";
  return `KES ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MpesaPaymentModal({
  open,
  onOpenChange,
  invoice,
  onPaymentConfirmed,
}: Props) {
  const api = useInzuApi();
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPhone("");
    setStage("input");
    setPaymentId(null);
    setError(null);
    setSubmitting(false);
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  async function handleSend() {
    const cleaned = phone.trim();
    if (!/^2547\d{8}$/.test(cleaned)) {
      setError("Enter a valid M-Pesa number: 2547XXXXXXXX");
      return;
    }
    if (!invoice) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.payments.request({
        invoiceId: invoice.id,
        phoneNumber: cleaned,
      });
      const id = res.requests?.[0]?.paymentId ?? null;
      setPaymentId(id);
      setStage("pending");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send payment request.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleConfirmed() {
    setStage("success");
    onPaymentConfirmed();
  }

  function handleFailed() {
    setStage("failed");
    setError("Payment failed or expired. You can try again.");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Smartphone size={16} style={{ color: "#90B494" }} />
            M-Pesa Payment
          </DialogTitle>
        </DialogHeader>

        {/* Invoice summary */}
        {invoice && (
          <div
            style={{
              background: "rgba(144,180,148,0.07)",
              border: "1px solid rgba(144,180,148,0.12)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 4,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
                className="text-muted-foreground"
              >
                {invoice.period ?? "Invoice"}
              </span>
              <span
                style={{ fontSize: 11, letterSpacing: "0.06em" }}
                className="text-muted-foreground"
              >
                {invoice.number}
              </span>
            </div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                fontFeatureSettings: '"tnum"',
                marginTop: 4,
              }}
              className="text-foreground"
            >
              {formatAmount(invoice.amount)}
            </p>
          </div>
        )}

        {/* Stage: input */}
        {stage === "input" && (
          <div className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="mpesa-phone"
                className="mb-1.5 block text-sm font-medium"
              >
                M-Pesa phone number
              </label>
              <input
                id="mpesa-phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(null); }}
                placeholder="2547XXXXXXXX"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onKeyDown={(e) => { if (e.key === "Enter") void handleSend(); }}
              />
              <p
                style={{ fontSize: 11, marginTop: 5 }}
                className="text-muted-foreground"
              >
                The customer will receive a payment prompt on their phone.
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            )}
            <Button
              onClick={() => void handleSend()}
              disabled={submitting || !phone}
              className="w-full"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Sending…
                </span>
              ) : "Send STK push"}
            </Button>
          </div>
        )}

        {/* Stage: pending */}
        {stage === "pending" && (
          <div className="flex flex-col gap-4">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 0",
              }}
            >
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "#90B494" }}
              />
              <p className="text-sm text-muted-foreground text-center">
                Waiting for customer to approve the M-Pesa prompt…
              </p>
            </div>
            <PaymentStatus
              paymentId={paymentId}
              onConfirmed={handleConfirmed}
              onFailed={handleFailed}
            />
          </div>
        )}

        {/* Stage: success */}
        {stage === "success" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "20px 0",
            }}
          >
            <CheckCircle2 size={40} style={{ color: "#90B494" }} />
            <p className="font-medium text-sm">Payment confirmed</p>
            <p className="text-xs text-muted-foreground">The invoice has been marked as paid.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleClose(false)}
            >
              Close
            </Button>
          </div>
        )}

        {/* Stage: failed */}
        {stage === "failed" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "16px 0",
            }}
          >
            <XCircle size={36} style={{ color: "#E22026" }} />
            <p className="font-medium text-sm">Payment failed</p>
            {error && <p className="text-xs text-muted-foreground text-center">{error}</p>}
            <Button
              size="sm"
              className="mt-2"
              onClick={() => { setStage("input"); setError(null); }}
            >
              Try again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
