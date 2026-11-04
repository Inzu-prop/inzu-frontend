/** Identifies the Clerk context for which a backend organization mapping was resolved. */
export function organizationScope(
  userId: string | null | undefined,
  sessionId: string | null | undefined,
  clerkOrganizationId: string | null | undefined,
): string | null {
  if (!userId || !sessionId) return null;
  return JSON.stringify([userId, sessionId, clerkOrganizationId ?? null]);
}

export function isOrganizationMappingCurrent(
  currentScope: string | null,
  resolvedScope: string | null,
  mappingLoaded: boolean,
): boolean {
  return currentScope !== null && currentScope === resolvedScope && mappingLoaded;
}

/** Never expose an old ID for an unresolved or failed mapping. */
export function currentMappedOrganizationId(
  mappingCurrent: boolean,
  mappingError: string | null,
  mappedId: string | null,
): string | null {
  return mappingCurrent && !mappingError ? mappedId : null;
}

export function findMatchingBackendOrg<T extends { name?: string; _id?: unknown }>(
  orgs: T[] | undefined,
  clerkName: string,
): T | null {
  if (!Array.isArray(orgs)) {
    throw new Error("Unable to read available organizations. Please try again.");
  }
  if (!orgs.length) return null;
  const normalized = clerkName.trim().toLowerCase();
  const matches = orgs.filter(
    (org) => typeof org.name === "string" && org.name.trim().toLowerCase() === normalized,
  );
  if (matches.length === 1) {
    const id = matches[0]._id;
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("The matched organization has an invalid ID. Please contact support.");
    }
    return matches[0];
  }
  throw new Error("Unable to match the active organization. Please contact support before continuing.");
}

// Old caches could contain an arbitrarily selected backend organization.
export const ORGANIZATION_MAPPING_CACHE_KEY = "inzuOrgIdByClerkOrgId:v2";

export function organizationMappingCacheEntry(userId: string, clerkOrganizationId: string): string {
  return JSON.stringify([userId, clerkOrganizationId]);
}

export function validCachedOrganizationId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** Resolve an existing organization or create only after an uncancelled empty lookup. */
export async function resolveOrCreateOrganization<T extends { name?: string; _id?: unknown }>(
  readOrganizations: () => Promise<T[] | undefined>,
  createOrganization: () => Promise<unknown>,
  clerkName: string,
  isCancelled: () => boolean,
): Promise<string | null> {
  const organizations = await readOrganizations();
  if (isCancelled()) return null;
  const match = findMatchingBackendOrg(organizations, clerkName);
  if (match) return validCachedOrganizationId(match._id);
  if (isCancelled()) return null;
  const createdId = await createOrganization();
  if (isCancelled()) return null;
  const validId = validCachedOrganizationId(createdId);
  if (!validId) throw new Error("Organization was created but no valid ID was returned.");
  return validId;
}
