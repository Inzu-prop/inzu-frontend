"use client";

import { useUser } from "@clerk/nextjs";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { useAuthMe } from "@/hooks/use-auth-me";

export default function TenantPortalPage() {
  const { user } = useUser();
  const { data } = useAuthMe();

  const tenant = data?.tenant;

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Your profile";
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "No email on file";
  const phoneNumber =
    tenant?.phoneNumber || "No phone number on file";
  const status = tenant?.status || "Active tenant";

  return (
    <Container className="py-10">
      <section className="mb-8 space-y-2">
        <h2 className="text-2xl font-semibold">Welcome to your tenant portal</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Track your rent, keep an eye on your unit details, and request
          maintenance in one place. As your landlord enables more features,
          new options will appear here automatically.
        </p>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rent status
              </p>
              <p className="mt-1 text-lg font-semibold">Up to date</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next due date</p>
              <p className="mt-1 text-base font-medium">1st of each month</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Live balances and payment history will appear here once your
            landlord connects payments.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick actions
          </p>
          <div className="space-y-2">
            <Button size="sm" className="w-full" disabled>
              Pay rent (coming soon)
            </Button>
            <Button size="sm" variant="outline" className="w-full" disabled>
              Request maintenance (coming soon)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Once enabled, these buttons will take you directly to secure rent
            payments and maintenance requests.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Your unit</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Basic unit details such as address, unit number, and included
            utilities will appear here.
          </p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <p>• Address and unit information</p>
            <p>• Lease start / end dates</p>
            <p>• Included services (parking, internet, etc.)</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Communication & notices</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Important messages from your landlord and building-wide notices
            will show up in this section.
          </p>
          <div className="mt-4 rounded-md border border-dashed border-border bg-background/40 p-3 text-xs text-muted-foreground">
            No messages yet. When your landlord sends updates (like scheduled
            maintenance or building notices), they&apos;ll appear here.
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Your profile</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This information comes from your account and your tenant record.
          </p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{displayName}</p>
              <p>{email}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 text-foreground">{phoneNumber}</p>
              </div>
              <div>
                <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-foreground">{status}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
