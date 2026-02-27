import {
  BarChart3,
  Building2,
  FileText,
  Gauge,
  type LucideIcon,
  LayoutGrid,
  Banknote,
  Users,
  Wrench,
  Settings,
} from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "INZU",
  description: "Property management for landlords",
};

export const navigations: Navigation[] = [
  { icon: Gauge, name: "Dashboard", href: "/" },
  { icon: Building2, name: "Properties", href: "/properties" },
  { icon: LayoutGrid, name: "Units", href: "/units" },
  { icon: Users, name: "Tenants", href: "/tenants" },
  { icon: FileText, name: "Invoices", href: "/invoices" },
  { icon: Banknote, name: "Payments", href: "/payments" },
  { icon: Wrench, name: "Maintenance", href: "/maintenance" },
  { icon: BarChart3, name: "Reports", href: "/reports" },
  { icon: Settings, name: "Settings", href: "/settings" },
];
