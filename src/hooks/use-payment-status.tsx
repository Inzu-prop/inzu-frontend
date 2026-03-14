"use client";

import { useEffect, useRef, useState } from "react";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

export type PaymentStatusResult = {
  status: "idle" | "pending" | "confirmed" | "failed" | "error";
  error: string | null;
  checkNow: () => Promise<void>;
};

export type PaymentApiStatus = {
  paymentId: string;
  status: "pending" | "success" | "failed";
  [key: string]: unknown;
};

type UsePaymentStatusOptions = {
  paymentId?: string | null;
  maxDuration?: number; // ms
  onUpdate?: (data: PaymentApiStatus) => void;
  pollFn?: (paymentId: string) => Promise<PaymentApiStatus>;
};

export function usePaymentStatus({
  paymentId,
  maxDuration = 120_000,
  onUpdate,
  pollFn,
}: UsePaymentStatusOptions): PaymentStatusResult {
  const api = useInzuApi();
  const [status, setStatus] = useState<PaymentStatusResult["status"]>(() =>
    paymentId ? "pending" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    if (!paymentId) {
      setStatus("idle");
      setError(null);
      return;
    }

    let interval = 2000;
    const start = Date.now();

    const fetchStatus = async () => {
      try {
        const res: PaymentApiStatus = pollFn
          ? await pollFn(paymentId)
          : await api.mpesaPayments.getStatus(paymentId);
        onUpdate?.(res);
        if (res.status === "success") {
          setStatus("confirmed");
          return true;
        }
        if (res.status === "failed") {
          setStatus("failed");
          return true;
        }
        // still pending
        setStatus("pending");
        return false;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : String(err));
        setStatus("error");
        return true;
      }
    };

    const loop = async () => {
      // first immediate check
      if (abortRef.current) return;
      const finished = await fetchStatus();
      if (finished || abortRef.current) return;

      while (!abortRef.current && Date.now() - start < maxDuration) {
        // pause while tab is hidden
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          await new Promise<void>((resolve) => {
            const onVis = () => {
              document.removeEventListener("visibilitychange", onVis);
              resolve();
            };
            document.addEventListener("visibilitychange", onVis);
          });
          if (abortRef.current) return;
        }

        await new Promise((r) => setTimeout(r, interval));
        if (abortRef.current) return;
        const done = await fetchStatus();
        if (done) return;
        interval = Math.min(15_000, Math.round(interval * 1.5));
      }

      if (!abortRef.current && Date.now() - start >= maxDuration) {
        setError("Timed out waiting for payment confirmation");
        setStatus("pending");
      }
    };

    void loop();

    return () => {
      abortRef.current = true;
    };
  }, [paymentId, maxDuration, onUpdate, pollFn, api]);

  const checkNow = async () => {
    if (!paymentId) return;
    setError(null);
    try {
      const res: PaymentApiStatus = pollFn
        ? await pollFn(paymentId)
        : await api.mpesaPayments.getStatus(paymentId);
      onUpdate?.(res);
      if (res.status === "success") setStatus("confirmed");
      else if (res.status === "failed") setStatus("failed");
      else setStatus("pending");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
      setStatus("error");
    }
  };

  return { status, error, checkNow };
}
