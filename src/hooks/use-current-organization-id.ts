 "use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useAtomValue } from "jotai";
import { selectedOrganizationIdAtom } from "@/lib/atoms";
import { createInzuApiClient } from "@/lib/api/client";

type AuthOrganizationResponse = {
  _id: string;
};

const INZU_ORG_ID_MAP_STORAGE_KEY = "inzuOrgIdByClerkOrgId";

export function useCurrentOrganizationId(): {
  organizationId: string | null;
  isLoaded: boolean;
} {
  const { organization, isLoaded } = useOrganization();
  const { getToken, isLoaded: authIsLoaded, userId } = useAuth();
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
      if (!authIsLoaded || !userId) {
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
        const newId = response?._id ?? null;

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
  }, [organization, api, authIsLoaded, userId]);

  const organizationId =
    selectedId !== null
      ? selectedId
      : inzuOrganizationId ?? null;

  return {
    organizationId,
    isLoaded: authIsLoaded && isLoaded && (!organization || mappingLoaded),
  };
}
