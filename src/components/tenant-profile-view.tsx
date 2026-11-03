"use client";

import { type ReactNode, useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Chip } from "@/components/base/badges/chip";
import { ButtonLink } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/tabs/tabs";
import {
  type HistoryKind,
  type ProfileHistory,
  type ProfileRecord,
  dateLabel,
  money,
  record,
  tenantDocuments,
  words,
} from "@/lib/tenant-profile";

const panel =
  "rounded-3xl border border-border-button-default bg-background-primary-default p-5";
function Fields({ values }: { values: [string, ReactNode][] }) {
  return (
    <dl className="flex flex-col gap-4">
      {values.map(([label, value]) => (
        <div key={label} className="flex flex-wrap justify-between gap-2">
          <dt className="text-body-2-regular text-text-tertiary">{label}</dt>
          <dd className="text-body-2-medium text-text-primary break-words">
            {value || "Not recorded"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function recordedFields(values: [string, ReactNode][]): [string, ReactNode][] {
  return values.filter(([, value]) => Boolean(value));
}

function History({
  kind,
  data,
}: {
  kind: HistoryKind;
  data: ProfileHistory[HistoryKind];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [descending, setDescending] = useState(true);
  const date = (r: ProfileRecord) =>
    words(
      kind === "payments"
        ? (r.paidAt ?? r.createdAt)
        : kind === "invoices"
          ? r.dueDate
          : r.createdAt,
    );
  const rows = data.rows
    .filter((r) =>
      Object.values(r).some(
        (v) =>
          typeof v === "string" &&
          v.toLowerCase().includes(query.toLowerCase()),
      ),
    )
    .sort((a, b) => date(a).localeCompare(date(b)) * (descending ? -1 : 1));
  const pageCount = Math.max(1, Math.ceil(rows.length / 6));
  const currentPage = Math.min(page, pageCount - 1);
  if (data.error)
    return (
      <p role="alert" className="text-body-2-regular text-text-error-primary">
        {data.error}
      </p>
    );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          aria-label="Search records"
          placeholder="Search records"
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <span className="text-caption-1-regular text-text-tertiary">
          {data.rows.length} linked records returned
        </span>
      </div>
      <Table
        size="sm"
        aria-label={kind}
        sortDescriptor={{
          column: "date",
          direction: descending ? "descending" : "ascending",
        }}
        onSortChange={(s) => setDescending(s.direction === "descending")}
      >
        <TableHeader>
          <TableColumn isRowHeader>Record</TableColumn>
          <TableColumn id="date" allowsSorting>
            {kind === "invoices" ? "Due date" : "Date"}
          </TableColumn>
          <TableColumn>
            {kind === "tickets" ? "Priority" : "Amount"}
          </TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody
          renderEmptyState={() =>
            query
              ? "No matching records."
              : "No linked records returned for this tenant."
          }
        >
          {rows.slice(currentPage * 6, currentPage * 6 + 6).map((r, i) => (
            <TableRow key={words(r._id ?? r.id) || i}>
              <TableCell>
                {words(r.invoiceNumber ?? r.reference ?? r.title) ||
                  (kind === "invoices"
                    ? words(r.period) || "Rent invoice"
                    : kind === "payments"
                      ? words(r.method) || "Payment"
                      : "Maintenance request")}
              </TableCell>
              <TableCell>{dateLabel(date(r))}</TableCell>
              <TableCell>
                {kind === "tickets"
                  ? words(r.priority) || "Not recorded"
                  : money(r.totalAmount ?? r.amount)}
              </TableCell>
              <TableCell>
                <Chip color="soft" variant="caption">
                  {words(r.status) || "Not recorded"}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={currentPage + 1}
        totalPages={pageCount}
        onChange={(p) => setPage(p - 1)}
        aria-label="History pages"
      />
    </div>
  );
}

export function TenantProfileView({
  tenant,
  unit = {},
  property = {},
  history,
  action,
  demo = false,
  warning,
  historyLoading = false,
}: {
  tenant: ProfileRecord;
  unit?: ProfileRecord;
  property?: ProfileRecord;
  history: ProfileHistory;
  action?: ReactNode;
  demo?: boolean;
  warning?: string;
  historyLoading?: boolean;
}) {
  const name =
    words(tenant.name) ||
    [words(tenant.firstName), words(tenant.lastName)]
      .filter(Boolean)
      .join(" ") ||
    "Tenant";
  const propertyId = words(
    property._id ?? tenant.propertyId ?? unit.propertyId,
  );
  const unitId = words(unit._id ?? tenant.unitId);
  const contacts = (
    Array.isArray(tenant.emergencyContacts) ? tenant.emergencyContacts : []
  )
    .map(record)
    .filter((contact) => contact.name || contact.phoneNumber || contact.email);
  const documents = tenantDocuments(tenant);
  const employment = record(tenant.employment);
  const employmentFields = recordedFields([
    [
      "Employer / business",
      words(
        employment.employerName ??
          employment.businessName ??
          tenant.employerName ??
          tenant.businessName,
      ),
    ],
    [
      "Occupation",
      words(
        employment.occupation ??
          employment.jobTitle ??
          tenant.occupation ??
          tenant.jobTitle,
      ),
    ],
    [
      "Work phone",
      words(
        employment.phoneNumber ??
          employment.workPhone ??
          tenant.workPhoneNumber ??
          tenant.workPhone,
      ),
    ],
    [
      "Work email",
      words(employment.email ?? employment.workEmail ?? tenant.workEmail),
    ],
  ]);
  const guarantor = record(tenant.guarantor);
  const guarantorFields = recordedFields([
    ["Name", words(guarantor.name ?? tenant.guarantorName)],
    [
      "Relationship",
      words(guarantor.relationship ?? tenant.guarantorRelationship),
    ],
    ["Phone", words(guarantor.phoneNumber ?? tenant.guarantorPhoneNumber)],
    ["Email", words(guarantor.email ?? tenant.guarantorEmail)],
  ]);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <ButtonLink
          variant="ghost"
          size="small"
          href={demo ? "/preview/tenants" : "/tenants"}
        >
          ← Tenants
        </ButtonLink>
      </div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar
            initials={name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
            size="lg"
          />
          <div>
            <h2 className="text-title-2-medium">{name}</h2>
            {tenant.createdAt ? (
              <p className="text-body-2-regular text-text-secondary">
                Member since {dateLabel(tenant.createdAt)}
              </p>
            ) : null}
            <p className="text-body-2-regular text-text-secondary">
              {words(property.name) || "Property not recorded"}
              {unit.unitNumber ? ` · Unit ${words(unit.unitNumber)}` : ""}
            </p>
          </div>
        </div>
        <Chip color="soft">
          {demo ? "Sample tenant · " : ""}
          {words(tenant.status) || "Status not recorded"}
        </Chip>
      </header>
      {warning && (
        <p role="status" className="text-body-2-regular text-text-secondary">
          {warning}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Monthly rent", money(tenant.monthlyRent ?? unit.rentAmount)],
          ["Reported arrears", money(tenant.arrears)],
          ["Lease ends", dateLabel(tenant.leaseEnd ?? unit.leaseEnd)],
        ].map(([label, value]) => (
          <section key={label} className={panel}>
            <p className="text-body-2-regular text-text-secondary">{label}</p>
            <p className="text-title-3-semibold mt-2">{value}</p>
          </section>
        ))}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-5">
          <section className={panel}>
            <h3 className="text-headline-medium mb-5">Contact details</h3>
            <Fields
              values={[
                [
                  "Email",
                  words(tenant.email) && (
                    <a href={`mailto:${words(tenant.email)}`}>
                      {words(tenant.email)}
                    </a>
                  ),
                ],
                [
                  "Phone",
                  words(tenant.phoneNumber) && (
                    <a href={`tel:${words(tenant.phoneNumber)}`}>
                      {words(tenant.phoneNumber)}
                    </a>
                  ),
                ],
              ]}
            />
          </section>
          <section className={panel}>
            <h3 className="text-headline-medium mb-5">Tenancy</h3>
            <Fields
              values={[
                [
                  "Property",
                  !demo && propertyId ? (
                    <ButtonLink
                      variant="ghost"
                      size="xs"
                      href={`/properties/${propertyId}`}
                    >
                      {words(property.name) || "View property"}
                    </ButtonLink>
                  ) : (
                    words(property.name)
                  ),
                ],
                [
                  "Unit",
                  !demo && unitId ? (
                    <ButtonLink
                      variant="ghost"
                      size="xs"
                      href={`/units/${unitId}`}
                    >
                      {words(unit.unitNumber) || "View unit"}
                    </ButtonLink>
                  ) : (
                    words(unit.unitNumber)
                  ),
                ],
                [
                  "Lease starts",
                  dateLabel(tenant.leaseStart ?? unit.leaseStart),
                ],
                ["Required deposit", money(unit.depositAmount)],
              ]}
            />
          </section>
          <section className={panel}>
            <h3 className="text-headline-medium mb-5">Emergency contacts</h3>
            {contacts.length ? (
              contacts.map((contact, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <Fields
                    values={[
                      ["Name", words(contact.name)],
                      ["Relationship", words(contact.relationship)],
                      ["Phone", words(contact.phoneNumber)],
                      ["Email", words(contact.email)],
                    ]}
                  />
                </div>
              ))
            ) : (
              <p className="text-body-2-regular text-text-secondary">
                No emergency contacts recorded.
              </p>
            )}
          </section>
          {employmentFields.length ? (
            <section className={panel}>
              <h3 className="text-headline-medium mb-5">Employment</h3>
              <Fields values={employmentFields} />
            </section>
          ) : null}
          {guarantorFields.length ? (
            <section className={panel}>
              <h3 className="text-headline-medium mb-5">Guarantor</h3>
              <Fields values={guarantorFields} />
            </section>
          ) : null}
          <section className={panel}>
            <h3 className="text-headline-medium mb-5">Documents</h3>
            {documents.length ? (
              <ul className="divide-separator-border flex flex-col divide-y">
                {documents.map((document, index) => (
                  <li
                    key={`${document.name}:${document.uploadedAt}:${index}`}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-body-2-medium text-text-primary">
                        {document.name}
                      </p>
                      <p className="text-caption-1-regular text-text-tertiary mt-1">
                        {[
                          document.category,
                          document.uploadedAt
                            ? `Uploaded ${dateLabel(document.uploadedAt)}`
                            : "",
                          document.uploadedBy
                            ? `By ${document.uploadedBy}`
                            : "",
                          document.expiresAt
                            ? `Expires ${dateLabel(document.expiresAt)}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {document.url ? (
                      <ButtonLink
                        variant="ghost"
                        size="xs"
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open file
                      </ButtonLink>
                    ) : (
                      <p className="text-caption-1-regular text-text-tertiary">
                        File access is unavailable for this record.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-2-regular text-text-secondary">
                No document records were returned.
              </p>
            )}
          </section>
        </aside>
        <section className={panel}>
          <h3 className="text-headline-medium mb-4">Tenant history</h3>
          {historyLoading ? (
            <p role="status">Loading related records…</p>
          ) : (
            <Tabs>
              <TabList aria-label="Tenant history">
                <Tab id="invoices">Invoices</Tab>
                <Tab id="payments">Payments</Tab>
                <Tab id="tickets">Maintenance</Tab>
              </TabList>
              {(["invoices", "payments", "tickets"] as const).map((kind) => (
                <TabPanel id={kind} key={kind}>
                  <History kind={kind} data={history[kind]} />
                </TabPanel>
              ))}
            </Tabs>
          )}
          <p className="text-caption-1-regular text-text-tertiary mt-4">
            {demo
              ? "Fictional records for demonstration. No payments or messages are sent."
              : "Shows available records linked to this tenant. Reported arrears is the balance recorded on their profile; it is not calculated from the history shown here."}
          </p>
        </section>
      </div>
      {action}
    </div>
  );
}
