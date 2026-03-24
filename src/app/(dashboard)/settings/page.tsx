"use client";

import { useEffect, useState } from "react";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { Button } from "@/components/ui/button";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { useAuthMe } from "@/hooks/use-auth-me";
import { ApiError } from "@/lib/api";
import type { OrgSettings } from "@/lib/api";

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const readOnlyClassName =
  "w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground/70";

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 border-b border-border pb-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function SettingField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  canEdit,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  canEdit: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {canEdit ? (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          placeholder={placeholder}
          min={min}
          max={max}
        />
      ) : (
        <div className={readOnlyClassName}>{value || "—"}</div>
      )}
    </div>
  );
}

function BooleanField({
  label,
  value,
  onChange,
  description,
  canEdit,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
  canEdit: boolean;
}) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {canEdit ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-inzu-forest"
          />
          {description ?? (value ? "Enabled" : "Disabled")}
        </label>
      ) : (
        <div className={readOnlyClassName}>{value ? "Enabled" : "Disabled"}</div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const api = useInzuApi();
  const { data: authData, loading: authLoading } = useAuthMe();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Form fields — initialised from API response
  const [currency, setCurrency] = useState("KES");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [fiscalYearStart, setFiscalYearStart] = useState("01-01");
  const [invoiceNumberPrefix, setInvoiceNumberPrefix] = useState("INV");
  const [paymentNumberPrefix, setPaymentNumberPrefix] = useState("PAY");
  const [autoGenerateInvoices, setAutoGenerateInvoices] = useState(true);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("30");
  const [defaultRentDueDay, setDefaultRentDueDay] = useState("1");
  const [defaultLateFeeAmount, setDefaultLateFeeAmount] = useState("0");
  const [defaultLateFeeAfterDays, setDefaultLateFeeAfterDays] = useState("5");

  const permissions: string[] = (authData?.user?.permissions as string[] | undefined) ?? [];
  const canManage = permissions.includes("MANAGE_SETTINGS");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.settings
      .get()
      .then((res) => {
        if (cancelled) return;
        const s: OrgSettings = res.settings;
        setCurrency(s.currency);
        setTimezone(s.timezone);
        setFiscalYearStart(s.fiscalYearStart);
        setInvoiceNumberPrefix(s.invoiceNumberPrefix);
        setPaymentNumberPrefix(s.paymentNumberPrefix);
        setAutoGenerateInvoices(s.autoGenerateInvoices);
        setDefaultPaymentTerms(String(s.defaultPaymentTerms));
        setDefaultRentDueDay(String(s.defaultRentDueDay));
        setDefaultLateFeeAmount(String(s.defaultLateFeeAmount));
        setDefaultLateFeeAfterDays(String(s.defaultLateFeeAfterDays));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);
    setSubmitting(true);
    api.settings
      .update({
        currency,
        timezone,
        fiscalYearStart,
        invoiceNumberPrefix,
        paymentNumberPrefix,
        autoGenerateInvoices,
        defaultPaymentTerms: parseInt(defaultPaymentTerms, 10),
        defaultRentDueDay: parseInt(defaultRentDueDay, 10),
        defaultLateFeeAmount: parseFloat(defaultLateFeeAmount),
        defaultLateFeeAfterDays: parseInt(defaultLateFeeAfterDays, 10),
      })
      .then(() => {
        setSaved(true);
      })
      .catch((err) => {
        setSaveError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (loading || authLoading) {
    return (
      <Container className="py-6">
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-6">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </Container>
    );
  }

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage
              ? "Configure your organization's preferences."
              : "Your organization's current configuration."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-8">
          {/* General */}
          <section>
            <SectionHeader
              title="General"
              description="Currency, timezone, and fiscal year."
            />
            <div className="flex flex-col gap-4">
              <SettingField
                id="currency"
                label="Currency"
                value={currency}
                onChange={setCurrency}
                placeholder="KES"
                canEdit={canManage}
              />
              <SettingField
                id="timezone"
                label="Timezone"
                value={timezone}
                onChange={setTimezone}
                placeholder="Africa/Nairobi"
                canEdit={canManage}
              />
              <SettingField
                id="fiscalYearStart"
                label="Fiscal year start (MM-DD)"
                value={fiscalYearStart}
                onChange={setFiscalYearStart}
                placeholder="01-01"
                canEdit={canManage}
              />
            </div>
          </section>

          {/* Numbering */}
          <section>
            <SectionHeader
              title="Numbering"
              description="Prefixes for generated invoice and payment numbers."
            />
            <div className="flex flex-col gap-4">
              <SettingField
                id="invoiceNumberPrefix"
                label="Invoice number prefix"
                value={invoiceNumberPrefix}
                onChange={setInvoiceNumberPrefix}
                placeholder="INV"
                canEdit={canManage}
              />
              <SettingField
                id="paymentNumberPrefix"
                label="Payment number prefix"
                value={paymentNumberPrefix}
                onChange={setPaymentNumberPrefix}
                placeholder="PAY"
                canEdit={canManage}
              />
            </div>
          </section>

          {/* Rent Defaults */}
          <section>
            <SectionHeader
              title="Rent Defaults"
              description="Defaults applied when generating invoices."
            />
            <div className="flex flex-col gap-4">
              <SettingField
                id="defaultRentDueDay"
                label="Rent due day of month"
                value={defaultRentDueDay}
                onChange={setDefaultRentDueDay}
                type="number"
                min={1}
                max={28}
                placeholder="1"
                canEdit={canManage}
              />
              <SettingField
                id="defaultPaymentTerms"
                label="Payment terms (days)"
                value={defaultPaymentTerms}
                onChange={setDefaultPaymentTerms}
                type="number"
                min={0}
                placeholder="30"
                canEdit={canManage}
              />
              <BooleanField
                label="Auto-generate invoices"
                value={autoGenerateInvoices}
                onChange={setAutoGenerateInvoices}
                description="Automatically generate monthly invoices"
                canEdit={canManage}
              />
            </div>
          </section>

          {/* Late Fees */}
          <section>
            <SectionHeader
              title="Late Fees"
              description="Defaults for overdue invoice fees."
            />
            <div className="flex flex-col gap-4">
              <SettingField
                id="defaultLateFeeAmount"
                label="Late fee amount"
                value={defaultLateFeeAmount}
                onChange={setDefaultLateFeeAmount}
                type="number"
                min={0}
                placeholder="0"
                canEdit={canManage}
              />
              <SettingField
                id="defaultLateFeeAfterDays"
                label="Apply late fee after (days)"
                value={defaultLateFeeAfterDays}
                onChange={setDefaultLateFeeAfterDays}
                type="number"
                min={0}
                placeholder="5"
                canEdit={canManage}
              />
            </div>
          </section>

          {canManage && (
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Saving…" : "Save settings"}
              </Button>
              {saved && (
                <p className="text-sm text-inzu-forest">Settings saved.</p>
              )}
              {saveError && (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              )}
            </div>
          )}
        </form>
      </Container>
    </RequireOrganization>
  );
}
