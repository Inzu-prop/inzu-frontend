"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { createInzuApiClient } from "@/lib/api/client";
import { useCurrentOrganizationId } from "./use-current-organization-id";

export function useInzuApi() {
  const { getToken } = useAuth();
  const { organizationId } = useCurrentOrganizationId();

  return useMemo(
    () =>
      createInzuApiClient({
        getToken,
        getOrganizationId: () => organizationId,
      }),
    [getToken, organizationId],
  );
}
