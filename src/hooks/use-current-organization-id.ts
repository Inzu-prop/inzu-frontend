"use client";

import { useOrganization } from "@clerk/nextjs";
import { useAtomValue } from "jotai";
import { selectedOrganizationIdAtom } from "@/lib/atoms";

export function useCurrentOrganizationId(): {
  organizationId: string | null;
  isLoaded: boolean;
} {
  const { organization, isLoaded } = useOrganization();
  const selectedId = useAtomValue(selectedOrganizationIdAtom);

  const organizationId =
    selectedId !== null ? selectedId : organization?.id ?? null;

  return {
    organizationId,
    isLoaded,
  };
}
