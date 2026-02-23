"use client";

import Container from "@/components/container";

export default function TenantPortalPage() {
  return (
    <Container className="py-8">
      <h2 className="text-lg font-semibold">Welcome to your tenant portal</h2>
      <p className="mt-2 text-muted-foreground">
        Here you can view your rent, unit details, and make payments once
        those features are available.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Your rent</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View current balance and payment history (coming soon).
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Your unit</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Unit details and maintenance requests (coming soon).
          </p>
        </div>
      </div>
    </Container>
  );
}
