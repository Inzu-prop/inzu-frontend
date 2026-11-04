"use client";

import { useEffect, useState } from "react";
import { RiFileList3Line, RiRefreshLine } from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { Button, ButtonLink } from "@/components/base/buttons/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError, type PaymentListItem } from "@/lib/api";
import { money } from "@/lib/tenant-profile";

function formatDate(value?: string): string {
  const date = new Date(value ?? "");
  return !value || Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      });
}

function paymentReference(payment: PaymentListItem): string {
  return (
    payment.paymentNumber ||
    payment.mpesaReceiptNumber ||
    payment._id ||
    "Not recorded"
  );
}

export default function PaymentsPage() {
  const { organizationId } = useCurrentOrganizationId();
  return (
    <RequireOrganization>
      {organizationId && <PaymentsRegister key={organizationId} />}
    </RequireOrganization>
  );
}

function PaymentsRegister() {
  const api = useInzuApi();
  const [data, setData] = useState<PaymentListItem[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.payments
      .list()
      .then((response) => {
        if (cancelled) return;
        setData(response.payments ?? []);
        setTotal(
          typeof response.total === "number"
            ? response.total
            : (response.payments?.length ?? 0),
        );
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api.payments, revision]);

  return (
      <Container className="flex flex-col gap-4 py-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-title-2-medium text-text-primary">Payments</h1>
            <p className="text-body-regular text-text-secondary mt-1">
              Portfolio payment records and reconciliation status
            </p>
          </div>
          <ButtonLink
            href="/invoices"
            variant="secondary"
            size="small"
            leadingIcon={RiFileList3Line}
          >
            Find an invoice
          </ButtonLink>
        </header>

        {loading && (
          <p
            role="status"
            className="text-body-regular text-text-secondary py-6"
          >
            Loading payments…
          </p>
        )}
        {error && (
          <section
            role="alert"
            className="border-border-button-default bg-background-primary-default flex flex-col items-start gap-3 rounded-3xl border p-5"
          >
            <p className="text-body-regular text-text-error-primary">{error}</p>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={RiRefreshLine}
              onClick={() => setRevision((value) => value + 1)}
            >
              Try again
            </Button>
          </section>
        )}
        {!loading && !error && data?.length === 0 && (
          <section className="border-border-button-default bg-background-primary-default rounded-3xl border p-6">
            <h2 className="text-headline-medium text-text-primary">
              No payment records returned
            </h2>
            <p className="text-body-regular text-text-secondary mt-1">
              Payment requests remain available from the invoice register.
            </p>
          </section>
        )}
        {!loading && !error && data && data.length > 0 && (
          <section className="border-border-button-default bg-background-primary-default rounded-3xl border p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-headline-medium text-text-primary">
                Payment register
              </h2>
              <span className="text-caption-1-regular text-text-tertiary">
                {data.length} shown
                {total !== null && total !== data.length
                  ? ` · ${total} total`
                  : ""}
              </span>
            </div>
            <Table size="sm" aria-label="Portfolio payments">
              <TableHeader>
                <TableColumn isRowHeader>Payment</TableColumn>
                <TableColumn>Tenant</TableColumn>
                <TableColumn>Date</TableColumn>
                <TableColumn>Amount</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {data.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-body-2-medium text-text-primary">
                          {paymentReference(payment)}
                        </span>
                        <span className="text-caption-1-regular text-text-tertiary">
                          {[payment.method, payment.period]
                            .filter(Boolean)
                            .join(" · ") || "Method not recorded"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-body-2-regular text-text-secondary">
                        {payment.tenantId || "Not linked"}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(payment.transactionDate)}</TableCell>
                    <TableCell>{money(payment.amount)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Chip color="soft" variant="caption">
                          {payment.status || "Not recorded"}
                        </Chip>
                        {payment.reconciled !== undefined && (
                          <Chip color="soft" variant="caption">
                            {payment.reconciled
                              ? "Reconciled"
                              : "Not reconciled"}
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </Container>
  );
}
