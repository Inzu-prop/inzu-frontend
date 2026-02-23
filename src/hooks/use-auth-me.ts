"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { createInzuApiClient } from "@/lib/api/client";
import type { AuthMeResponse } from "@/lib/api/client";

export type AuthMeState = {
  data: AuthMeResponse | null;
  loading: boolean;
  error: string | null;
  isTenantUser: boolean;
  hasOrganizations: boolean;
  showOnboarding: boolean;
  refetch: () => Promise<void>;
};

export function useAuthMe(): AuthMeState {
  const { getToken } = useAuth();
  const [data, setData] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    const api = createInzuApiClient({
      getToken,
      getOrganizationId: () => null,
    });
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.me();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const hasTenant = Boolean(data?.tenant && data.tenant._id);
  const role = data?.user?.role;
  const orgs = data?.organizations ?? [];
  const hasOrganizations = orgs.length > 0;

  const isTenantUser =
    hasTenant || (role === "tenant" && !hasOrganizations);
  const showOnboarding =
    !hasTenant && !hasOrganizations && role !== "tenant";

  return {
    data,
    loading,
    error,
    isTenantUser,
    hasOrganizations,
    showOnboarding,
    refetch: fetchMe,
  };
}
