"use client";

import React from "react";
import { usePaymentStatus } from "@/hooks/use-payment-status";

type Props = {
  paymentId: string | null;
  onConfirmed?: () => void;
  onFailed?: () => void;
};

export default function PaymentStatus({ paymentId, onConfirmed, onFailed }: Props) {
  const { status, error, checkNow } = usePaymentStatus({ paymentId });

  React.useEffect(() => {
    if (status === "confirmed") {
      onConfirmed?.();
    } else if (status === "failed" || status === "error") {
      onFailed?.();
    }
  }, [status, onConfirmed, onFailed]);

  if (!paymentId) return null;
//
  return (
    <div className="mt-3 space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Status</div>
        <div className="text-xs font-medium">
          {status === "pending" && "Processing…"}
          {status === "confirmed" && "Confirmed"}
          {status === "failed" && "Failed"}
          {status === "error" && "Error"}
        </div>
      </div>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void checkNow()}
          className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs"
        >
          Check status
        </button>
        <span className="text-xs text-muted-foreground">Payment ID: {paymentId}</span>
      </div>
    </div>
  );
}
