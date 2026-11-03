import { Chip } from "@/components/base/badges/chip";
import { ButtonLink } from "@/components/base/buttons/button";
import { maintenanceText as text } from "@/lib/maintenance-detail";
import { type ProfileRecord, dateLabel, record } from "@/lib/tenant-profile";

const panel =
  "rounded-3xl border border-border-button-default bg-background-primary-default p-5";

export function MaintenanceDetailView({
  ticket,
  backHref,
  preview = false,
}: {
  ticket: ProfileRecord;
  backHref: string;
  preview?: boolean;
}) {
  const contractor = record(ticket.contractor ?? ticket.assignee);
  const requester = record(ticket.tenant ?? ticket.requester);
  const property = record(ticket.property);
  const unit = record(ticket.unit);
  const details: [string, string][] = [
    ["Property", text(ticket.propertyName) || text(property.name)],
    ["Unit", text(ticket.unitNumber) || text(unit.unitNumber)],
    ["Requester", text(ticket.requesterName) || text(requester.name)],
    ["Priority", text(ticket.priority)],
    ["Reported", ticket.createdAt ? dateLabel(ticket.createdAt) : ""],
    ["Scheduled", ticket.scheduledAt ? dateLabel(ticket.scheduledAt) : ""],
    ["Started", ticket.startedAt ? dateLabel(ticket.startedAt) : ""],
    ["Completed", ticket.completedAt ? dateLabel(ticket.completedAt) : ""],
  ];
  const assignee: [string, string][] = [
    [
      "Name",
      text(ticket.contractorName) ||
        text(contractor.name) ||
        text(ticket.assigneeName),
    ],
    ["Trade", text(contractor.trade)],
    ["Phone", text(contractor.phoneNumber) || text(contractor.phone)],
    ["Email", text(contractor.email)],
    ["Work notes", text(ticket.completionNotes) || text(ticket.workNotes)],
  ].filter(([, value]) => Boolean(value)) as [string, string][];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <ButtonLink href={backHref} variant="ghost" size="small">
          ← Back
        </ButtonLink>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-body-2-regular text-text-tertiary">
            Maintenance request
          </p>
          <h1 className="text-title-2-medium text-text-primary mt-1">
            {text(ticket.title) || "Title not recorded"}
          </h1>
          {preview && (
            <p className="text-body-2-regular text-text-secondary mt-2">
              Fictional preview record.
            </p>
          )}
        </div>
        <Chip color="soft">{text(ticket.status) || "Status not recorded"}</Chip>
      </header>
      <section className={panel}>
        <h2 className="text-headline-medium mb-3">Work description</h2>
        <p className="text-body-regular text-text-secondary whitespace-pre-wrap break-words">
          {text(ticket.description) || "Not recorded"}
        </p>
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className={panel}>
          <h2 className="text-headline-medium mb-5">Request details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-body-2-regular text-text-tertiary">
                  {label}
                </dt>
                <dd className="text-body-medium text-text-primary mt-1 break-words">
                  {value || "Not recorded"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className={panel}>
          <h2 className="text-headline-medium mb-5">
            Contractor and work notes
          </h2>
          {assignee.length ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {assignee.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-body-2-regular text-text-tertiary">
                    {label}
                  </dt>
                  <dd className="text-body-medium text-text-primary mt-1 break-words">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-body-regular text-text-secondary">
              No contractor or work notes were returned.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
