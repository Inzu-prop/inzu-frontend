"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { TenantProfileView } from "@/components/tenant-profile-view";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { monthKey } from "@/lib/reporting";
import {
  type ProfileHistory,
  type ProfileRecord,
  emptyHistory,
  listRecords,
  record,
  recordId,
  tenantRecords,
} from "@/lib/tenant-profile";

function GenerateInvoice({
  tenantId,
  onGenerated,
}: {
  tenantId: string;
  onGenerated: () => void;
}) {
  const api = useInzuApi();
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState(monthKey(new Date()));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <section className="border-border-button-default bg-background-primary-default rounded-3xl border p-5">
      <Button variant="secondary" size="small" onClick={() => setOpen(!open)}>
        {open ? "Close invoice form" : "Generate rent invoice"}
      </Button>
      {open && (
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return;
            setBusy(true);
            setMessage("");
            try {
              const result = await api.invoices.generate({
                period,
                tenantIds: [tenantId],
              });
              setMessage(
                [
                  result.generated
                    ? `${result.generated} invoice generated for ${period}.`
                    : "No invoice generated. This period may already be invoiced, or the tenancy may be missing a unit or rent amount.",
                  ...(result.errors ?? []),
                ].join(" "),
              );
              if (result.generated) onGenerated();
            } catch (e) {
              setMessage(
                e instanceof Error ? e.message : "Invoice generation failed.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <Input
            label="Billing month (YYYY-MM)"
            value={period}
            onChange={setPeriod}
            isRequired
          />
          <Button
            type="submit"
            disabled={busy || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)}
          >
            {busy ? "Generating…" : "Generate invoice"}
          </Button>
        </form>
      )}
      {message && (
        <p role="status" className="text-body-2-regular mt-3">
          {message}
        </p>
      )}
    </section>
  );
}
function Profile({ tenantId }: { tenantId: string }) {
  const api = useInzuApi();
  const [data, setData] = useState<{
    tenant: ProfileRecord;
    unit: ProfileRecord;
    property: ProfileRecord;
  }>();
  const [history, setHistory] = useState<ProfileHistory>(emptyHistory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setWarning("");
    async function load() {
      try {
        const response = record(await api.tenants.get(tenantId));
        const tenant = record(response.tenant ?? response);
        if (!Object.keys(tenant).length) throw new Error("Tenant not found.");
        if (recordId(tenant) && recordId(tenant) !== tenantId)
          throw new Error("The API returned a different tenant.");
        if (!active) return;
        setData({ tenant, unit: {}, property: {} });
        const related = async () => {
          let unit: ProfileRecord = {},
            property: ProfileRecord = {};
          const warnings: string[] = [];
          if (recordId(tenant.unitId)) {
            try {
              const u = record(await api.units.get(recordId(tenant.unitId)));
              unit = record(u.unit ?? u);
            } catch {
              warnings.push("Unit details could not be loaded.");
            }
          }
          const propertyId =
            recordId(tenant.propertyId) || recordId(unit.propertyId);
          if (propertyId) {
            try {
              const p = record(await api.properties.get(propertyId));
              property = record(p.property ?? p);
            } catch {
              warnings.push("Property details could not be loaded.");
            }
          }
          if (active) {
            setData({ tenant, unit, property });
            setWarning(warnings.join(" "));
          }
        };
        const histories = async () => {
          const results = await Promise.allSettled([
            api.invoices.list({ tenantId }),
            api.payments.list({ tenantId }),
            api.maintenance.list({ tenantId }),
          ]);
          const next = emptyHistory();
          (["invoices", "payments", "tickets"] as const).forEach((kind, i) => {
            const result = results[i];
            try {
              if (result.status === "rejected")
                throw new Error(
                  `Unable to load ${kind === "tickets" ? "maintenance" : kind}. Use Retry to try again.`,
                );
              next[kind].rows = tenantRecords(
                listRecords(result.value, kind),
                tenantId,
                kind === "payments" ? next.invoices.rows.map(recordId) : [],
              );
            } catch (e) {
              next[kind].error =
                e instanceof Error ? e.message : "Records unavailable.";
            }
          });
          if (active) setHistory(next);
        };
        await Promise.all([related(), histories()]);
      } catch (e) {
        if (active) {
          setData(undefined);
          setError(e instanceof Error ? e.message : "Unable to load tenant.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [api, tenantId, revision]);
  return (
    <Container className="py-5">
      <div className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-text-error-primary">
            {error}
          </p>
        )}
        {!data && loading && <p role="status">Loading tenant…</p>}
        {data && (
          <TenantProfileView
            {...data}
            history={history}
            historyLoading={loading}
            warning={warning}
            action={
              <GenerateInvoice
                tenantId={tenantId}
                onGenerated={() => setRevision((r) => r + 1)}
              />
            }
          />
        )}
        <div>
          <Button
            variant="ghost"
            size="small"
            disabled={loading}
            onClick={() => setRevision((r) => r + 1)}
          >
            Retry / refresh profile
          </Button>
        </div>
      </div>
    </Container>
  );
}
export default function TenantDetailPage() {
  const params = useParams();
  const { organizationId } = useCurrentOrganizationId();
  const tenantId = String(params.tenantId);
  return (
    <RequireOrganization>
      {organizationId && (
        <Profile key={`${organizationId}:${tenantId}`} tenantId={tenantId} />
      )}
    </RequireOrganization>
  );
}
