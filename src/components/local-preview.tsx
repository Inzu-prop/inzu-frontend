"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiCloseLine,
  RiMenuLine,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import { DashboardSidebar } from "@/components/application/dashboard/dashboard-sidebar";
import { Button, ButtonLink } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input } from "@/components/base/input/input";
import Container from "@/components/container";
import { DashboardView } from "@/components/dashboard-view";
import { DemoTenantProfile } from "@/components/demo-tenant-profile";
import { InvoiceDetailView } from "@/components/invoice-detail-view";
import { InzuBrand } from "@/components/inzu-brand";
import { MaintenanceDetailView } from "@/components/maintenance-detail-view";
import { PropertySummary } from "@/components/property-summary";
import { inzuNavigation } from "@/components/nav/side-nav";
import { ReportsView } from "@/components/reports-view";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { demoInvoiceById } from "@/lib/demo-invoices";
import { demoTicketById } from "@/lib/maintenance-detail";
import { monthKey } from "@/lib/reporting";

type Property = { id: string; name: string; location: string; units: number };
const initialProperties: Property[] = [
  {
    id: "demo-1",
    name: "Acacia Court",
    location: "Kilimani, Nairobi",
    units: 4,
  },
  {
    id: "demo-2",
    name: "Cedar Heights",
    location: "Westlands, Nairobi",
    units: 4,
  },
  {
    id: "demo-3",
    name: "Garden Residences",
    location: "Lavington, Nairobi",
    units: 4,
  },
];
const storageKey = "inzu-local-preview-properties-v1";
const card =
  "rounded-3xl border border-border-button-default bg-background-primary-default p-6";
const sampleNames = [
  "Alex Kamau",
  "Sam Wanjiku",
  "Robin Otieno",
  "Taylor Njeri",
  "Chris Mwangi",
  "Morgan Achieng",
  "Jamie Wambui",
  "Casey Kimani",
  "Drew Odhiambo",
  "Jordan Mutua",
];

export function LocalPreview() {
  const pathname = usePathname();
  const router = useRouter();
  const section =
    pathname.replace(/^\/preview\/?/, "").split("/")[0] || "overview";
  const isNewProperty = pathname === "/preview/properties/new";
  const detailId = pathname.split("/")[3] ?? "";
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [units, setUnits] = useState("4");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (
        Array.isArray(stored) &&
        stored.every(
          (p) =>
            typeof p.id === "string" &&
            typeof p.name === "string" &&
            typeof p.location === "string" &&
            Number.isInteger(p.units) &&
            p.units > 0 &&
            p.units <= 100,
        )
      )
        setProperties(stored);
    } catch {
      /* Invalid or unavailable storage falls back to sample data. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(properties));
      } catch {
        /* This tab still keeps its in-memory changes. */
      }
    }
  }, [properties, ready]);
  useEffect(() => {
    setMobileOpen(false);
    setQuery("");
    setExpanded(null);
    setEditingProperty(false);
  }, [pathname]);
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const currentMonth = Number(monthKey().slice(5));
  const monthly = Array.from({ length: Math.max(6, currentMonth) }, (_, i) => {
    const [year, month] = monthKey().split("-").map(Number);
    const date = new Date(
      Date.UTC(year, month - Math.max(6, currentMonth) + i, 1, 12),
    );
    const n = Math.max(6, currentMonth) - 1 - i;
    const expected =
      n < 6 ? [320000, 320000, 310000, 300000, 290000, 280000][n] : 265000;
    const collected =
      n < 6
        ? [286000, 310000, 295000, 280000, 278000, 252000][n]
        : [228000, 246000, 239000, 251000, 247000, 257000][i % 6];
    return {
      period: { period: monthKey(date) },
      expected,
      collected,
      occupancyRate:
        n === 0
          ? Math.min(10, totalUnits) / Math.max(1, totalUnits)
          : [
              0.67, 0.75, 0.83, 0.75, 0.83, 0.92, 0.83, 0.92, 1, 0.92, 0.83,
              0.92,
            ][i % 12],
    };
  });
  const navigation = inzuNavigation.map((item) => ({
    ...item,
    href: `/preview${item.href === "/" ? "" : item.href}`,
  }));
  const selected = section === "overview" ? "/" : `/${section}`;
  const title =
    navigation.find((item) => item.key === selected)?.label ?? "Preview";
  const workspace = <InzuBrand href="/preview" />;
  const footer = (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="inzu-sidebar-footer-label text-caption-1-regular text-text-tertiary">
        Local preview
      </span>
      <IconButton
        icon={RiRefreshLine}
        aria-label="Reset sample data"
        title="Reset sample data"
        onClick={() => {
          setProperties(initialProperties);
          setNotice("Sample data reset.");
        }}
      />
    </div>
  );
  const allUnits = properties.flatMap((p) =>
    Array.from({ length: p.units }, (_, i) => ({
      id: `${p.id}-${i}`,
      name: `${p.name} / ${String(i + 1).padStart(2, "0")}`,
      detail:
        i < 3 ? "Occupied | KES 28,000 / month" : "Vacant | KES 28,000 / month",
    })),
  );
  const records =
    section === "properties"
      ? properties.map((p) => ({
          id: p.id,
          name: p.name,
          detail: `${p.location} | ${p.units} units`,
        }))
      : section === "units"
        ? allUnits
        : section === "tenants"
          ? sampleNames.map((name, i) => ({
              id: `tenant-${i}`,
              name,
              detail: `${initialProperties[i % 3].name} | Active tenancy`,
            }))
          : section === "invoices"
            ? sampleNames.map((name, i) => ({
                id: `invoice-${i}`,
                name: `INV-${1001 + i} | ${name}`,
                detail: `KES 28,000 | ${i < 8 ? "Paid" : "Outstanding"}`,
              }))
            : section === "payments"
              ? sampleNames.slice(0, 8).map((name, i) => ({
                  id: `payment-${i}`,
                  name,
                  detail: "KES 28,000 | M-Pesa | Received (sample)",
                }))
              : section === "maintenance"
                ? [
                    "Kitchen tap leaking",
                    "Hallway light replacement",
                    "Entrance lock repair",
                  ].map((name, i) => ({
                    id: `ticket-${i}`,
                    name,
                    detail: `${initialProperties[i].name} | Open request`,
                  }))
                : [];
  const filtered = records.filter((record) =>
    `${record.name} ${record.detail}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const previewInvoice =
    section === "invoices" && detailId
      ? demoInvoiceById(detailId, sampleNames)
      : undefined;
  const previewTicket =
    section === "maintenance" && detailId
      ? demoTicketById(detailId, sampleNames)
      : undefined;
  const previewProperty = section === "properties" && detailId && !isNewProperty
    ? properties.find((property) => encodeURIComponent(property.id) === detailId || property.id === detailId)
    : undefined;

  return (
    <div className="bg-background-full text-text-primary flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh shrink-0 py-3 ps-3 laptop:block">
        <DashboardSidebar
          items={navigation}
          selected={selected}
          workspace={workspace}
          footer={footer}
          showThemeToggle={false}
        />
      </div>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          className="bg-background-full left-0 top-0 h-dvh w-72 translate-x-0 translate-y-0 border-0 p-2 sm:rounded-none [&>button]:hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Preview navigation</DialogTitle>
          <DashboardSidebar
            mobile
            onClose={() => setMobileOpen(false)}
            items={navigation}
            selected={selected}
            workspace={workspace}
            footer={footer}
            showThemeToggle={false}
            className="w-full"
          />
        </DialogContent>
      </Dialog>
      <div className="min-w-0 flex-1">
        <header className="border-separator-border border-b">
          <Container className="flex h-14 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconButton
                className="laptop:hidden"
                icon={RiMenuLine}
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              />
              <h1 className="text-headline-semibold text-text-primary">
                {title}
              </h1>
            </div>
            <span
              title="Local preview with fictional data. No backend connection."
              className="text-caption-1-regular text-text-tertiary"
            >
              Local preview
            </span>
          </Container>
        </header>
        {notice && (
          <Container className="flex items-center justify-between gap-2 pt-4">
            <p role="status" className="text-body-medium text-text-secondary">
              {notice}
            </p>
            <IconButton
              icon={RiCloseLine}
              aria-label="Dismiss notice"
              onClick={() => setNotice("")}
            />
          </Container>
        )}
        {section === "tenants" && detailId ? (
          <DemoTenantProfile key={pathname} id={detailId} names={sampleNames} />
        ) : section === "invoices" && detailId ? (
          <Container className="py-5">
            {previewInvoice ? (
              <InvoiceDetailView
                invoice={previewInvoice}
                backHref={
                  previewInvoice.tenantId
                    ? `/preview/tenants/${encodeURIComponent(previewInvoice.tenantId)}?tab=invoices`
                    : "/preview/invoices"
                }
                preview
              />
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-body-regular text-text-secondary">
                  Sample invoice not found.
                </p>
                <ButtonLink href="/preview/invoices" variant="secondary">
                  Back to invoices
                </ButtonLink>
              </div>
            )}
          </Container>
        ) : section === "maintenance" && detailId ? (
          <Container className="py-5">
            {previewTicket ? (
              <MaintenanceDetailView
                ticket={previewTicket}
                preview
                backHref={
                  typeof previewTicket.tenantId === "string"
                    ? `/preview/tenants/${encodeURIComponent(previewTicket.tenantId)}?tab=tickets`
                    : "/preview/maintenance"
                }
              />
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-body-regular text-text-secondary">
                  Sample request not found.
                </p>
                <ButtonLink href="/preview/maintenance" variant="secondary">
                  Back to maintenance
                </ButtonLink>
              </div>
            )}
          </Container>
        ) : section === "properties" && detailId && !isNewProperty ? (
          <Container className="flex flex-col gap-4 py-5">
            <div><ButtonLink href="/preview/properties" variant="ghost" size="small">← Properties</ButtonLink></div>
            {!ready ? <p role="status">Loading sample property…</p> : previewProperty ? (
              <>
                <header>
                  <h2 className="text-title-2-medium">{previewProperty.name}</h2>
                  <p className="text-body-regular text-text-secondary">{previewProperty.location} · Fictional preview</p>
                </header>
                <PropertySummary totalUnits={previewProperty.units} />
                {editingProperty ? (
                  <form className="border-border-button-default bg-background-primary-default flex max-w-xl flex-col gap-4 rounded-3xl border p-5" onSubmit={(event) => {
                    event.preventDefault();
                    if (!location.trim()) return;
                    setProperties((current) => current.map((item) => item.id === previewProperty.id ? { ...item, location: location.trim() } : item));
                    setEditingProperty(false);
                    setNotice("Sample property updated in this browser tab.");
                  }}>
                    <Input label="Location" value={location} onChange={setLocation} isRequired maxLength={120} />
                    <div className="flex gap-3"><Button type="submit">Save sample property</Button><Button type="button" variant="secondary" onClick={() => setEditingProperty(false)}>Cancel</Button></div>
                  </form>
                ) : <section className={card}>
                  <h3 className="text-headline-medium">Property details</h3>
                  <p className="text-body-regular text-text-secondary mt-3">{previewProperty.units} sample units are recorded for this property. Additional details have not been recorded.</p>
                  <Button className="mt-4" variant="secondary" onClick={() => {
                    setLocation(previewProperty.location);
                    setEditingProperty(true);
                  }}>Edit sample property</Button>
                </section>}
              </>
            ) : <p className="text-body-regular text-text-secondary">Sample property not found.</p>}
          </Container>
        ) : section === "reports" ? (
          <ReportsView monthly={monthly} />
        ) : section === "overview" ? (
          <>
            <DashboardView
              basePath="/preview"
              monthly={monthly}
              summary={{
                totalExpected: 320000,
                totalCollected: 286000,
                totalArrears: 34000,
                collectionRate: 286000 / 320000,
                occupancyRate: totalUnits
                  ? Math.min(10, totalUnits) / totalUnits
                  : 0,
                totalProperties: properties.length,
                totalUnits,
                totalTenants: 10,
                openTickets: 3,
              }}
            />
          </>
        ) : (
          <Container className="flex flex-col gap-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-title-1-semibold">
                  {isNewProperty ? "Add a sample property" : title}
                </h1>
                <p className="text-body-regular text-text-secondary mt-2">
                  Explore with fictional records. Changes stay in this browser
                  tab.
                </p>
              </div>
              {section === "properties" && !isNewProperty && (
                <ButtonLink
                  href="/preview/properties/new"
                  leadingIcon={RiAddLine}
                >
                  Add property
                </ButtonLink>
              )}
            </div>
            {isNewProperty ? (
              <form
                className="border-border-button-default bg-background-primary-default flex max-w-xl flex-col gap-5 rounded-3xl border p-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (
                    !name.trim() ||
                    !location.trim() ||
                    !Number.isInteger(Number(units)) ||
                    Number(units) < 1 ||
                    Number(units) > 100
                  )
                    return;
                  setProperties((current) => [
                    ...current,
                    {
                      id: `demo-${Date.now()}`,
                      name: name.trim(),
                      location: location.trim(),
                      units: Number(units),
                    },
                  ]);
                  setNotice(
                    "Sample property added. Your preview overview has been updated.",
                  );
                  setName("");
                  setLocation("");
                  setUnits("4");
                  router.push("/preview/properties");
                }}
              >
                <Input
                  label="Property name"
                  value={name}
                  onChange={setName}
                  isRequired
                  maxLength={80}
                />
                <Input
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  isRequired
                  maxLength={120}
                />
                <Input
                  label="Number of units"
                  type="number"
                  value={units}
                  onChange={setUnits}
                  validate={(value) =>
                    Number.isInteger(Number(value)) &&
                    Number(value) >= 1 &&
                    Number(value) <= 100
                      ? null
                      : "Enter a whole number from 1 to 100."
                  }
                  isRequired
                />
                <div className="flex gap-3">
                  <Button type="submit">Save sample property</Button>
                  <ButtonLink href="/preview/properties" variant="secondary">
                    Cancel
                  </ButtonLink>
                </div>
              </form>
            ) : section === "settings" ? (
              <section className={card}>
                <h2 className="text-headline-medium">Preview workspace</h2>
                <p className="text-body-regular text-text-secondary my-4">
                  This workspace uses fictional sample records. Account,
                  billing, invitations, and payment processing remain
                  unavailable here.
                </p>
                <Button
                  variant="secondary"
                  leadingIcon={RiRefreshLine}
                  onClick={() => {
                    setProperties(initialProperties);
                    setNotice("Sample data reset.");
                  }}
                >
                  Reset sample data
                </Button>
              </section>
            ) : (
              <>
                <Input
                  aria-label={`Search ${title.toLowerCase()}`}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  leadingIcon={RiSearchLine}
                  value={query}
                  onChange={setQuery}
                  className="max-w-md"
                />
                <p className="text-body-2-regular text-text-tertiary">
                  {filtered.length} sample records
                </p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((record) => (
                    <section key={record.id} className={card}>
                      <h2 className="text-headline-medium">{record.name}</h2>
                      <p className="text-body-regular text-text-secondary my-3">
                        {record.detail}
                      </p>
                      {section === "properties" ? (
                        <ButtonLink variant="secondary" href={`/preview/properties/${encodeURIComponent(record.id)}`}>
                          View property
                        </ButtonLink>
                      ) : section === "tenants" ? (
                        <ButtonLink
                          variant="secondary"
                          href={`/preview/tenants/${record.id}`}
                        >
                          View profile
                        </ButtonLink>
                      ) : section === "invoices" ? (
                        <ButtonLink
                          variant="secondary"
                          href={`/preview/invoices/${encodeURIComponent(record.id)}`}
                        >
                          View invoice
                        </ButtonLink>
                      ) : section === "maintenance" ? (
                        <ButtonLink
                          variant="secondary"
                          href={`/preview/maintenance/${encodeURIComponent(record.id)}`}
                        >
                          View details
                        </ButtonLink>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setExpanded(
                              expanded === record.id ? null : record.id,
                            )
                          }
                        >
                          {expanded === record.id
                            ? "Hide details"
                            : "View details"}
                        </Button>
                      )}
                      {expanded === record.id && (
                        <p className="text-body-2-regular text-text-tertiary mt-4">
                          Reference: {record.id}. This fictional record is
                          available for interface exploration only; it is not
                          linked to a real tenant, invoice, or payment.
                        </p>
                      )}
                    </section>
                  ))}
                </div>
                {!filtered.length && (
                  <p className="text-body-regular text-text-secondary py-12">
                    No matching sample records. Try another search.
                  </p>
                )}
              </>
            )}
          </Container>
        )}
      </div>
    </div>
  );
}
