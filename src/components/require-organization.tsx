"use client";

import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import Container from "@/components/container";

export function RequireOrganization({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizationId, isLoaded } = useCurrentOrganizationId();

  if (!isLoaded) {
    return (
      <Container className="py-10">
        <p className="text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  if (!organizationId) {
    return (
      <Container className="py-10">
        <p className="text-muted-foreground">
          Select or create an organization in the sidebar to view this page.
        </p>
      </Container>
    );
  }

  return <>{children}</>;
}
