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

type BackendOrg = { _id: string; name?: string; [key: string]: unknown };

function findMatchingBackendOrg(
  orgs: BackendOrg[] | undefined,
  clerkName: string,
): BackendOrg | null {
  if (!orgs || orgs.length === 0) return null;
  const normalized = clerkName.trim().toLowerCase();
  const byName = orgs.find(
    (o) => typeof o.name === "string" && o.name.trim().toLowerCase() === normalized,
  );
  // Fall back to the first org if no name match — handles the case where
  // Clerk and backend names diverged but the user only has one backend org.
  return byName ?? orgs[0];
}

const INZU_ORG_ID_MAP_STORAGE_KEY = "inzuOrgIdByClerkOrgId";

export function useCurrentOrganizationId(): {
  organizationId: string | null;
  isLoaded: boolean;
  error: string | null;
  retry: () => void;
} {
  const { organization, isLoaded } = useOrganization();
  const { getToken, isLoaded: authIsLoaded, userId, sessionId } = useAuth();
  const selectedId = useAtomValue(selectedOrganizationIdAtom);

  const [inzuOrganizationId, setInzuOrganizationId] = useState<string | null>(null);
  const [mappingLoaded, setMappingLoaded] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
        setMappingError(null);

        // Clear any stale localStorage cache when there's no active org
        // (e.g. org was deleted on another device)
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(INZU_ORG_ID_MAP_STORAGE_KEY);
          } catch {
            // Ignore storage errors
          }
        }
        return;
      }

      // Reset while we resolve the backend mapping for this org
      setMappingLoaded(false);
      setMappingError(null);

      try {
        // Check if we already have the mapping stored
        if (typeof window !== "undefined") {
          try {
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
          } catch {
            // Corrupted localStorage — clear it and continue to API call
            window.localStorage.removeItem(INZU_ORG_ID_MAP_STORAGE_KEY);
          }
        }

        const clerkOrgName =
          organization.name ?? organization.slug ?? "Untitled organization";

        const persistMapping = (newId: string) => {
          if (typeof window === "undefined") return;
          try {
            const raw = window.localStorage.getItem(INZU_ORG_ID_MAP_STORAGE_KEY);
            const map: Record<string, string> = raw ? JSON.parse(raw) : {};
            map[organization.id] = newId;
            window.localStorage.setItem(INZU_ORG_ID_MAP_STORAGE_KEY, JSON.stringify(map));
          } catch {
            // Ignore storage errors — cache is an optimization, not a requirement
          }
        };

        // Retry loop — token may not be ready immediately after org creation
        const MAX_ATTEMPTS = 5;
        let lastError: string | null = null;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          if (cancelled) return;

          // Wait before each attempt (longer on retries)
          await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 300 : 1000));
          if (cancelled) return;

          const token = await getToken();
          if (!token) {
            lastError = "Unable to authenticate. Please try again.";
            continue;
          }

          try {
            // Check for an existing backend org first. This handles the
            // cross-device case where the backend already has an org for
            // this user but localStorage has no mapping.
            const me = await api.auth.me();
            const existingBackendOrg = findMatchingBackendOrg(
              me?.organizations as BackendOrg[] | undefined,
              clerkOrgName,
            );

            if (existingBackendOrg?._id && !cancelled) {
              setInzuOrganizationId(existingBackendOrg._id);
              setMappingLoaded(true);
              persistMapping(existingBackendOrg._id);
              return;
            }

            // No existing backend org — create one.
            const response = (await api.auth.createOrganization({
              name: clerkOrgName,
            })) as AuthOrganizationResponse;
            const newId = response?.organization?._id ?? null;

            if (newId && !cancelled) {
              setInzuOrganizationId(newId);
              setMappingLoaded(true);
              persistMapping(newId);
              return;
            }

            lastError = "Organization was created but no ID was returned.";
          } catch (err) {
            const message =
              err instanceof Error ? err.message : String(err);

            // Backend conflict: user already has an org with this name.
            // Re-fetch /auth/me and use the existing one instead of failing.
            if (/already have an organization/i.test(message)) {
              try {
                const me = await api.auth.me();
                const existingBackendOrg = findMatchingBackendOrg(
                  me?.organizations as BackendOrg[] | undefined,
                  clerkOrgName,
                );
                if (existingBackendOrg?._id && !cancelled) {
                  setInzuOrganizationId(existingBackendOrg._id);
                  setMappingLoaded(true);
                  persistMapping(existingBackendOrg._id);
                  return;
                }
              } catch {
                // Fall through to retry
              }
            }

            lastError = message || "Failed to set up organization.";
          }
        }

        // All attempts exhausted
        if (!cancelled) {
          setMappingError(lastError ?? "Failed to set up organization. Please try again.");
          setMappingLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setMappingError("Something went wrong. Please try again.");
          setMappingLoaded(true);
        }
      }
    }

    ensureInzuOrganizationId();

    return () => {
      cancelled = true;
    };
  }, [organization, api, authIsLoaded, userId, sessionId, getToken, retryCount]);

  const organizationId =
    selectedId !== null
      ? selectedId
      : inzuOrganizationId ?? null;

  const retry = () => {
    setMappingError(null);
    setMappingLoaded(false);
    setRetryCount((c) => c + 1);
  };

  return {
    organizationId,
    isLoaded: authIsLoaded && isLoaded && (!organization || mappingLoaded),
    error: mappingError,
    retry,
  };
}
