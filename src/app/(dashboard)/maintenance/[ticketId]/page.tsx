"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import Container from "@/components/container";
import { MaintenanceDetailView } from "@/components/maintenance-detail-view";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { maintenanceDetailForRoute } from "@/lib/maintenance-response";
import { type ProfileRecord, recordId } from "@/lib/tenant-profile";

export default function MaintenanceDetailPage() {
  const ticketId = String(useParams().ticketId);
  const { organizationId } = useCurrentOrganizationId();
  return (
    <RequireOrganization>
      {organizationId && (
        <MaintenanceDetail
          key={`${organizationId}:${ticketId}`}
          ticketId={ticketId}
        />
      )}
    </RequireOrganization>
  );
}

function MaintenanceDetail({ ticketId }: { ticketId: string }) {
  const api = useInzuApi();
  const [ticket, setTicket] = useState<ProfileRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setTicket(undefined);
    setError("");
    setLoading(true);
    api.maintenance
      .get(ticketId)
      .then((response) => {
        if (active) setTicket(maintenanceDetailForRoute(response, ticketId));
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load maintenance request.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api.maintenance, ticketId, revision]);
  const tenantId = ticket && recordId(ticket.tenantId);
  const backHref = tenantId
    ? `/tenants/${encodeURIComponent(tenantId)}?tab=tickets`
    : "/maintenance";
  return (
    <Container className="py-5">
      {loading && (
        <p role="status" className="text-body-regular text-text-secondary">
          Loading maintenance request…
        </p>
      )}
      {error && (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-body-regular text-text-error-primary">
            {error}
          </p>
          <Button variant="secondary" onClick={() => setRevision((n) => n + 1)}>
            Try again
          </Button>
        </div>
      )}
      {!loading && !error && ticket && (
        <MaintenanceDetailView ticket={ticket} backHref={backHref} />
      )}
    </Container>
  );
}
