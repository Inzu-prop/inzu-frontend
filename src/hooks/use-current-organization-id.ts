 "use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { createInzuApiClient } from "@/lib/api/client";
import { currentMappedOrganizationId, findMatchingBackendOrg, isOrganizationMappingCurrent, organizationMappingCacheEntry, organizationScope, ORGANIZATION_MAPPING_CACHE_KEY, resolveOrCreateOrganization, validCachedOrganizationId } from "@/lib/organization-scope";

type AuthOrganizationResponse = {
  organization: {
    _id: string;
    name: string;
    [key: string]: unknown;
  };
};

type BackendOrg = { _id: string; name?: string; [key: string]: unknown };

export function useCurrentOrganizationId(): {
  organizationId: string | null;
  isLoaded: boolean;
  error: string | null;
  retry: () => void;
} {
  const { organization, isLoaded } = useOrganization();
  const { getToken, isLoaded: authIsLoaded, userId, sessionId } = useAuth();

  const [inzuOrganizationId, setInzuOrganizationId] = useState<string | null>(null);
  const [mappingLoaded, setMappingLoaded] = useState(false);
  const [mappingScope, setMappingScope] = useState<string | null>(null);
  const [mappingError, setMappingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const currentScope = organizationScope(userId, sessionId, organization?.id);

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

      // Clear the previous organization before resolving this context. If
      // resolution fails, it must never be returned under the new scope.
      setInzuOrganizationId(null);
      setMappingScope(organizationScope(userId, sessionId, organization?.id));

      if (!organization) {
        setInzuOrganizationId(null);
        setMappingLoaded(true);
        setMappingError(null);

        // Clear any stale localStorage cache when there's no active org
        // (e.g. org was deleted on another device)
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(ORGANIZATION_MAPPING_CACHE_KEY);
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
            const raw = window.localStorage.getItem(ORGANIZATION_MAPPING_CACHE_KEY);
            const map: Record<string, string> = raw ? JSON.parse(raw) : {};
            const existing = validCachedOrganizationId(map[organizationMappingCacheEntry(userId, organization.id)]);

            if (existing) {
              if (!cancelled) {
                setInzuOrganizationId(existing);
                setMappingLoaded(true);
              }
              return;
            }
          } catch {
            // Corrupted localStorage — clear it and continue to API call
            window.localStorage.removeItem(ORGANIZATION_MAPPING_CACHE_KEY);
          }
        }

        const clerkOrgName =
          organization.name ?? organization.slug ?? "Untitled organization";

        const persistMapping = (newId: string) => {
          if (typeof window === "undefined") return;
          try {
            const raw = window.localStorage.getItem(ORGANIZATION_MAPPING_CACHE_KEY);
            const map: Record<string, string> = raw ? JSON.parse(raw) : {};
            map[organizationMappingCacheEntry(userId, organization.id)] = newId;
            window.localStorage.setItem(ORGANIZATION_MAPPING_CACHE_KEY, JSON.stringify(map));
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
          if (cancelled) return;
          if (!token) {
            lastError = "Unable to authenticate. Please try again.";
            continue;
          }

          try {
            // Check for an existing backend org first. This handles the
            // cross-device case where the backend already has an org for
            // this user but localStorage has no mapping.
            const resolvedId = await resolveOrCreateOrganization(
              async () => {
                const me = await api.auth.me();
                return me?.organizations as BackendOrg[] | undefined;
              },
              async () => {
                const response = (await api.auth.createOrganization({
                  name: clerkOrgName,
                })) as AuthOrganizationResponse;
                return response?.organization?._id;
              },
              clerkOrgName,
              () => cancelled,
            );
            if (cancelled) return;
            if (resolvedId) {
              setInzuOrganizationId(resolvedId);
              setMappingLoaded(true);
              persistMapping(resolvedId);
              return;
            }
            lastError = "Unable to resolve organization.";
          } catch (err) {
            if (cancelled) return;
            const message =
              err instanceof Error ? err.message : String(err);

            // Backend conflict: user already has an org with this name.
            // Re-fetch /auth/me and use the existing one instead of failing.
            if (/already have an organization/i.test(message)) {
              try {
                const me = await api.auth.me();
                if (cancelled) return;
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
          setInzuOrganizationId(null);
          setMappingError(lastError ?? "Failed to set up organization. Please try again.");
          setMappingLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setInzuOrganizationId(null);
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

  // The previous mapping belongs to a different Clerk context as soon as
  // organization, user or session changes, even before effects have run.
  const mappingCurrent =
    authIsLoaded && isLoaded && isOrganizationMappingCurrent(currentScope, mappingScope, mappingLoaded);
  const organizationId = currentMappedOrganizationId(mappingCurrent, mappingError, inzuOrganizationId);

  const retry = () => {
    setMappingError(null);
    setMappingLoaded(false);
    setRetryCount((c) => c + 1);
  };

  return {
    organizationId,
    isLoaded: mappingCurrent,
    error: mappingCurrent ? mappingError : null,
    retry,
  };
}
