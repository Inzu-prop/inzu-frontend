 "use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useAtomValue } from "jotai";
import { selectedOrganizationIdAtom } from "@/lib/atoms";
import { createInzuApiClient } from "@/lib/api/client";

type AuthOrganizationResponse = {
  organization: {
    _id: string;
    name: string;
    [key: string]: unknown;
  };
};

const INZU_ORG_ID_MAP_STORAGE_KEY = "inzuOrgIdByClerkOrgId";

export function useCurrentOrganizationId(): {
  organizationId: string | null;
  isLoaded: boolean;
} {
  const { organization, isLoaded } = useOrganization();
  const { getToken, isLoaded: authIsLoaded, userId, sessionId } = useAuth();
  const selectedId = useAtomValue(selectedOrganizationIdAtom);

  const [inzuOrganizationId, setInzuOrganizationId] = useState<string | null>(null);
  const [mappingLoaded, setMappingLoaded] = useState(false);

  const api = useMemo(
    () =>
      createInzuApiClient({
        getToken,
        getOrganizationId: () => null,
      }),
    [getToken],
  );

  useEffect(() => {
    let cancelled = false;

    async function ensureInzuOrganizationId() {
      if (!authIsLoaded || !userId || !sessionId) {
        setMappingLoaded(false);
        return;
      }

      if (!organization) {
        setInzuOrganizationId(null);
        setMappingLoaded(true);
        return;
      }

      try {
        // Check if we already have the mapping stored
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(INZU_ORG_ID_MAP_STORAGE_KEY);
          const map: Record<string, string> = raw ? JSON.parse(raw) : {};
          const existing = map[organization.id];

          if (existing) {
            if (!cancelled) {
              setInzuOrganizationId(existing);
              setMappingLoaded(true);
            }
            return;
          }
        }

        // Small delay to ensure Clerk session is fully established
        // This helps avoid race conditions where token isn't ready yet
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Verify we have a token before making the request
        const token = await getToken();
        if (!token) {
          if (!cancelled) {
            setMappingLoaded(true);
          }
          return;
        }

        const response = (await api.auth.createOrganization({
          name: organization.name ?? organization.slug ?? "Untitled organization",
        })) as AuthOrganizationResponse;
        const newId = response?.organization?._id ?? null;

        if (!newId) {
          if (!cancelled) {
            setMappingLoaded(true);
          }
          return;
        }

        if (!cancelled) {
          setInzuOrganizationId(newId);
          setMappingLoaded(true);
        }

        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(INZU_ORG_ID_MAP_STORAGE_KEY);
          const map: Record<string, string> = raw ? JSON.parse(raw) : {};
          map[organization.id] = newId;
          window.localStorage.setItem(INZU_ORG_ID_MAP_STORAGE_KEY, JSON.stringify(map));
        }
      } catch {
        if (!cancelled) {
          setMappingLoaded(true);
        }
      }
    }

    ensureInzuOrganizationId();

    return () => {
      cancelled = true;
    };
  }, [organization, api, authIsLoaded, userId, sessionId, getToken]);

  const organizationId =
    selectedId !== null
      ? selectedId
      : inzuOrganizationId ?? null;

  return {
    organizationId,
    isLoaded: authIsLoaded && isLoaded && (!organization || mappingLoaded),
  };
}
