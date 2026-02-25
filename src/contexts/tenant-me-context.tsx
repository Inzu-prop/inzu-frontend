"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { TenantMeResponse } from "@/lib/api/client";
import { ApiError } from "@/lib/api";

const NOT_LINKED_MESSAGE = "No tenant profile is linked to this account";

function isNotLinkedError(error: unknown): boolean {
  const message =
    error instanceof ApiError
      ? error.message + (error.body ?? "")
      : String(error);
  return message.includes(NOT_LINKED_MESSAGE);
}

type TenantMeContextValue = {
  data: TenantMeResponse | null;
  loading: boolean;
  error: string | null;
  isNotLinked: boolean;
  refetch: () => Promise<void>;
};

const TenantMeContext = createContext<TenantMeContextValue | null>(null);

export function TenantMeProvider({ children }: { children: React.ReactNode }) {
  const api = useInzuApi();
  const [data, setData] = useState<TenantMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.tenant.me();
      setData(res);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : String(e);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [api.tenant]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const isNotLinked = Boolean(error && isNotLinkedError(error));

  return (
    <TenantMeContext.Provider
      value={{
        data,
        loading,
        error,
        isNotLinked,
        refetch: fetchMe,
      }}
    >
      {children}
    </TenantMeContext.Provider>
  );
}

export function useTenantMe(): TenantMeContextValue {
  const ctx = useContext(TenantMeContext);
  if (!ctx) {
    throw new Error("useTenantMe must be used within TenantMeProvider");
  }
  return ctx;
}
