"use client";

import { useAtom } from "jotai";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useClerk, useOrganization } from "@clerk/nextjs";
import {
  RiBankCardLine,
  RiBarChartBoxLine,
  RiBuildingLine,
  RiDashboardLine,
  RiFileList3Line,
  RiGroupLine,
  RiLayoutGridLine,
  RiSettings4Line,
  RiToolsLine,
} from "@remixicon/react";
import {
  type DashboardNavItem,
  DashboardSidebar,
} from "@/components/application/dashboard/dashboard-sidebar";
import { Button } from "@/components/base/buttons/button";
import { InzuBrand } from "@/components/inzu-brand";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { mobileNavOpenAtom } from "@/lib/atoms";

export const inzuNavigation: DashboardNavItem[] = [
  { key: "/", label: "Overview", href: "/", icon: RiDashboardLine },
  {
    key: "/properties",
    label: "Properties",
    href: "/properties",
    icon: RiBuildingLine,
  },
  { key: "/units", label: "Units", href: "/units", icon: RiLayoutGridLine },
  { key: "/tenants", label: "Tenants", href: "/tenants", icon: RiGroupLine },
  {
    key: "/invoices",
    label: "Invoices",
    href: "/invoices",
    icon: RiFileList3Line,
  },
  {
    key: "/payments",
    label: "Payments",
    href: "/payments",
    icon: RiBankCardLine,
  },
  {
    key: "/maintenance",
    label: "Maintenance",
    href: "/maintenance",
    icon: RiToolsLine,
  },
  {
    key: "/reports",
    label: "Reports",
    href: "/reports",
    icon: RiBarChartBoxLine,
  },
  {
    key: "/settings",
    label: "Settings",
    href: "/settings",
    icon: RiSettings4Line,
  },
];

export default function SideNav() {
  const [mobileOpen, setMobileOpen] = useAtom(mobileNavOpenAtom);
  const pathname = usePathname();
  const { organization } = useOrganization();
  const { openOrganizationProfile } = useClerk();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);
  const selected =
    inzuNavigation.find(
      (item) => item.key !== "/" && pathname.startsWith(item.key),
    )?.key ?? "/";
  const workspace = <InzuBrand />;
  const footer = organization ? (
    <Button
      variant="secondary"
      leadingIcon={RiBuildingLine}
      onClick={() => openOrganizationProfile()}
      aria-label="Manage organization"
      className="max-w-full overflow-hidden"
    >
      <span className="truncate">{organization.name}</span>
    </Button>
  ) : (
    <span className="text-caption-1-regular text-text-tertiary">
      Your property workspace
    </span>
  );
  return (
    <>
      <div className="sticky top-0 hidden h-dvh shrink-0 py-3 ps-3 laptop:block">
        <DashboardSidebar
          items={inzuNavigation}
          selected={selected}
          workspace={workspace}
          footer={footer}
          showThemeToggle={false}
        />
      </div>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          className="bg-background-full left-0 start-0 top-0 h-dvh w-72 max-w-full translate-x-0 translate-y-0 border-0 p-2 sm:rounded-none [&>button]:hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Main navigation</DialogTitle>
          <DashboardSidebar
            mobile
            onClose={() => setMobileOpen(false)}
            items={inzuNavigation}
            selected={selected}
            workspace={workspace}
            footer={footer}
            showThemeToggle={false}
            className="w-full"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
