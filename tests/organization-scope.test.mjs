import assert from "node:assert/strict";
import test from "node:test";
import { currentMappedOrganizationId, findMatchingBackendOrg, isOrganizationMappingCurrent, organizationMappingCacheEntry, organizationScope, ORGANIZATION_MAPPING_CACHE_KEY, resolveOrCreateOrganization, validCachedOrganizationId } from "../src/lib/organization-scope.ts";

test("a mapping cannot be reused across organizations, users or sessions", () => {
  const original = organizationScope("user-a", "session-a", "org-a");
  assert.equal(isOrganizationMappingCurrent(original, original, true), true);
  for (const current of [
    organizationScope("user-a", "session-a", "org-b"),
    organizationScope("user-b", "session-a", "org-a"),
    organizationScope("user-a", "session-b", "org-a"),
    organizationScope("user-a", "session-a", null),
    organizationScope(null, null, "org-a"),
  ]) assert.equal(isOrganizationMappingCurrent(current, original, true), false);
});

test("a failed new organization resolution cannot return the old ID", () => {
  const oldScope = organizationScope("user", "session", "org-a");
  const newScope = organizationScope("user", "session", "org-b");
  assert.equal(currentMappedOrganizationId(isOrganizationMappingCurrent(newScope, oldScope, true), null, "old-backend-id"), null);
  assert.equal(currentMappedOrganizationId(isOrganizationMappingCurrent(newScope, newScope, true), "Mapping failed", "old-backend-id"), null);
  assert.equal(currentMappedOrganizationId(isOrganizationMappingCurrent(newScope, newScope, true), null, "new-backend-id"), "new-backend-id");
});

test("backend mapping requires a unique name match when organizations exist", () => {
  const a = { _id: "a", name: "Alpha" };
  const b = { _id: "b", name: "Beta" };
  assert.throws(() => findMatchingBackendOrg([a], "Different"), /Unable to match/);
  assert.equal(findMatchingBackendOrg([a, b], " beta "), b);
  assert.throws(() => findMatchingBackendOrg([a, b], "Unknown"), /Unable to match/);
  assert.throws(() => findMatchingBackendOrg([a, { _id: "c", name: " alpha " }], "Alpha"), /Unable to match/);
  assert.throws(() => findMatchingBackendOrg([{ name: "Alpha" }], "Alpha"), /invalid ID/);
  assert.throws(() => findMatchingBackendOrg([{ _id: "  ", name: "Alpha" }], "Alpha"), /invalid ID/);
  assert.throws(() => findMatchingBackendOrg([{ _id: 17, name: "Alpha" }], "Alpha"), /invalid ID/);
  assert.equal(findMatchingBackendOrg([], "New"), null);
  assert.throws(() => findMatchingBackendOrg(undefined, "New"), /Unable to read/);
  assert.throws(() => findMatchingBackendOrg({}, "New"), /Unable to read/);
});

test("mapping cache is versioned and scoped by user and Clerk organization", () => {
  assert.notEqual(ORGANIZATION_MAPPING_CACHE_KEY, "inzuOrgIdByClerkOrgId");
  assert.notEqual(organizationMappingCacheEntry("user-a", "org"), organizationMappingCacheEntry("user-b", "org"));
  assert.notEqual(organizationMappingCacheEntry("user", "org-a"), organizationMappingCacheEntry("user", "org-b"));
  assert.equal(validCachedOrganizationId("backend-id"), "backend-id");
  for (const value of [null, "", "  ", 5, {}, []]) {
    assert.equal(validCachedOrganizationId(value), null);
  }
});

test("an unresolved or signed-out context cannot expose a prior mapping", () => {
  const scope = organizationScope("user", "session", "org");
  assert.equal(isOrganizationMappingCurrent(scope, scope, false), false);
  assert.equal(isOrganizationMappingCurrent(scope, null, true), false);
  assert.equal(isOrganizationMappingCurrent(null, null, true), false);
});

test("a cancelled lookup cannot create an organization after it resolves", async () => {
  let finishLookup;
  let cancelled = false;
  let creates = 0;
  const pending = resolveOrCreateOrganization(
    () => new Promise((resolve) => { finishLookup = resolve; }),
    async () => { creates++; return "new-id"; },
    "Alpha",
    () => cancelled,
  );
  cancelled = true;
  finishLookup([]);
  assert.equal(await pending, null);
  assert.equal(creates, 0);
});

test("creation rejects malformed IDs and ignores results after cancellation", async () => {
  for (const value of [undefined, "", "  ", 4, {}]) {
    await assert.rejects(resolveOrCreateOrganization(async () => [], async () => value, "Alpha", () => false), /no valid ID/);
  }
  let finishCreate;
  let cancelled = false;
  const pending = resolveOrCreateOrganization(
    async () => [],
    () => new Promise((resolve) => { finishCreate = resolve; }),
    "Alpha",
    () => cancelled,
  );
  await Promise.resolve();
  cancelled = true;
  finishCreate("new-id");
  assert.equal(await pending, null);
});
