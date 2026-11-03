import { monthKey } from "./reporting";
import { type ProfileRecord, words } from "./tenant-profile";

export function demoTicketById(
  id: string,
  names: string[],
): ProfileRecord | undefined {
  const list = [
    "Kitchen tap leaking",
    "Hallway light replacement",
    "Entrance lock repair",
  ];
  const match = /^ticket-(\d+)$/.exec(id);
  if (match) {
    const index = Number(match[1]);
    if (index < list.length)
      return {
        _id: id,
        title: list[index],
        status: "open",
        propertyName: ["Acacia Court", "Cedar Heights", "Garden Residences"][
          index
        ],
      };
  }
  const tenantMatch = /^(tenant-(\d+))-ticket-([12])$/.exec(id);
  if (!tenantMatch || Number(tenantMatch[2]) >= names.length) return undefined;
  const current = monthKey(new Date());
  const first = tenantMatch[3] === "1";
  return {
    _id: id,
    tenantId: tenantMatch[1],
    title: first ? "Kitchen tap needs repair" : "Entrance light replacement",
    priority: first ? "normal" : "low",
    status: first ? "open" : "resolved",
    createdAt: first ? `${current}-01` : `${current.slice(0, 4)}-09-12`,
  };
}

export function maintenanceText(value: unknown): string {
  return words(value).trim();
}
