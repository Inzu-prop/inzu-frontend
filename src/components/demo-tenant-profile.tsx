"use client";

import { ButtonLink } from "@/components/base/buttons/button";
import Container from "@/components/container";
import { TenantProfileView } from "@/components/tenant-profile-view";
import { monthKey } from "@/lib/reporting";
import { emptyHistory } from "@/lib/tenant-profile";

export function DemoTenantProfile({
  id,
  names,
}: {
  id: string;
  names: string[];
}) {
  const index = /^tenant-\d+$/.test(id) ? Number(id.slice(7)) : -1;
  if (index < 0 || index >= names.length)
    return (
      <Container className="py-5">
        <p>Sample tenant not found.</p>
        <ButtonLink href="/preview/tenants">Back to tenants</ButtonLink>
      </Container>
    );
  const rent = 24000 + (index % 3) * 4000;
  const history = emptyHistory();
  const current = monthKey(new Date());
  for (let offset = 0; offset < 8; offset++) {
    const d = new Date(`${current}-01T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - offset);
    const month = d.toISOString().slice(0, 7);
    const invoiceId = `${id}-invoice-${month}`;
    const paid = offset > 0 || index % 3 !== 0;
    history.invoices.rows.push({
      _id: invoiceId,
      tenantId: id,
      invoiceNumber: `DEMO-${index + 1}-${month}`,
      period: month,
      amount: rent,
      dueDate: `${month}-05`,
      status: paid ? "paid" : "pending",
    });
    if (paid)
      history.payments.rows.push({
        _id: `${id}-payment-${month}`,
        invoiceId,
        tenantId: id,
        reference: `SAMPLE-${month}`,
        amount: rent,
        paidAt: `${month}-02`,
        method: "M-Pesa",
        status: "completed",
      });
  }
  history.tickets.rows = [
    {
      _id: `${id}-ticket-1`,
      tenantId: id,
      title: "Kitchen tap needs repair",
      createdAt: `${current}-01`,
      priority: "normal",
      status: "open",
    },
    {
      _id: `${id}-ticket-2`,
      tenantId: id,
      title: "Entrance light replacement",
      createdAt: `${current.slice(0, 4)}-09-12`,
      priority: "low",
      status: "resolved",
    },
  ];
  return (
    <Container className="py-5">
      <TenantProfileView
        demo
        tenant={{
          _id: id,
          name: names[index],
          email: `${names[index].toLowerCase().replace(" ", ".")}@example.com`,
          status: "active",
          monthlyRent: rent,
          arrears: 0,
          leaseStart: `${current.slice(0, 4)}-01-01`,
          leaseEnd: `${Number(current.slice(0, 4)) + 1}-01-01`,
        }}
        unit={{
          unitNumber: `${String.fromCharCode(65 + (index % 3))}${Math.floor(index / 3) + 1}`,
          depositAmount: rent,
        }}
        property={{
          name: ["Acacia Court", "Cedar Heights", "Garden Residences"][
            index % 3
          ],
        }}
        history={history}
      />
    </Container>
  );
}
