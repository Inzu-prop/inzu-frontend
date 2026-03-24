export const dynamic = "force-dynamic";

import { DashboardGate } from "@/components/dashboard-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardGate>{children}</DashboardGate>;
}
