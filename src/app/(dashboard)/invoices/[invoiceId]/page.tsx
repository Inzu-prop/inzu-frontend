"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import Container from "@/components/container";
import { InvoiceDetailView } from "@/components/invoice-detail-view";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";
import {
  type InvoiceDetail,
  invoiceDetailForRoute,
} from "@/lib/invoice-detail";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = String(params.invoiceId);
  const api = useInzuApi();
  const { organizationId } = useCurrentOrganizationId();
  const [invoice, setInvoice] = useState<InvoiceDetail>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setInvoice(undefined);
    setError("");
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.invoices
      .get(invoiceId)
      .then((response) => {
        if (!active) return;
        setInvoice(invoiceDetailForRoute(response, invoiceId));
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : cause instanceof Error
              ? cause.message
              : "Unable to load invoice.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api.invoices, invoiceId, organizationId, revision]);

  const backHref = invoice?.tenantId
    ? `/tenants/${encodeURIComponent(invoice.tenantId)}?tab=invoices`
    : "/invoices";

  return (
    <RequireOrganization>
      <Container className="py-5">
        {loading && (
          <p role="status" className="text-body-regular text-text-secondary">
            Loading invoice…
          </p>
        )}
        {error && (
          <div className="flex flex-col items-start gap-3">
            <p
              role="alert"
              className="text-body-regular text-text-error-primary"
            >
              {error}
            </p>
            <Button
              variant="secondary"
              onClick={() => setRevision((value) => value + 1)}
            >
              Try again
            </Button>
          </div>
        )}
        {!loading && !error && invoice && (
          <InvoiceDetailView invoice={invoice} backHref={backHref} />
        )}
      </Container>
    </RequireOrganization>
  );
}
