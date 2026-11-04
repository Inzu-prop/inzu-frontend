"use client";

import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import Container from "@/components/container";
import { Button } from "@/components/base/buttons/button";

export function RequireOrganization({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizationId, isLoaded, error, retry } = useCurrentOrganizationId();

  if (!isLoaded) {
    return (
      <Container className="py-10">
        <p className="text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        <p role="alert" className="text-text-error-primary">{error}</p>
        <Button variant="secondary" onClick={retry} className="mt-3">Try again</Button>
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
