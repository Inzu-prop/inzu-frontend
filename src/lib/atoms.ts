import { addDays, endOfDay, isWithinInterval, startOfDay } from "date-fns";
import { atom } from "jotai";
import type { DateRange } from "react-day-picker";
import { averageTicketsCreated } from "@/data/average-tickets-created";
import type { TicketMetric } from "@/types/types";

/** Optional override: when set, API client uses this org ID instead of Clerk's active organization (e.g. for org switcher). */
export const selectedOrganizationIdAtom = atom<string | null>(null);

/** Controls whether the mobile nav drawer is open. */
export const mobileNavOpenAtom = atom(false);

/** Controls whether the desktop sidebar is expanded (true) or icon-only (false). */
export const desktopSidebarExpandedAtom = atom(false);

const defaultStartDate = new Date(2023, 11, 18);

export const dateRangeAtom = atom<DateRange | undefined>({
  from: defaultStartDate,
  to: addDays(defaultStartDate, 6),
});

export const ticketChartDataAtom = atom((get) => {
  const dateRange = get(dateRangeAtom);

  if (!dateRange?.from || !dateRange?.to) return [];

  const startDate = startOfDay(dateRange.from);
  const endDate = endOfDay(dateRange.to);

  return averageTicketsCreated
    .filter((item) => {
      const [year, month, day] = item.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return isWithinInterval(date, { start: startDate, end: endDate });
    })
    .flatMap((item) => {
      const res: TicketMetric[] = [
        {
          date: item.date,
          type: "resolved",
          count: item.resolved,
        },
        {
          date: item.date,
          type: "created",
          count: item.created,
        },
      ];
      return res;
    });
});
