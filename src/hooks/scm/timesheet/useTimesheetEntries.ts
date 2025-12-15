import { useQuery } from "@tanstack/react-query";
import {
  fetchTimesheetEntries,
  type FetchTimesheetEntriesParams,
} from "@actions/scm/timesheet";

export const timesheetKeys = {
  all: ["timesheet"] as const,
  entries: (filters: FetchTimesheetEntriesParams) =>
    [...timesheetKeys.all, "entries", filters] as const,
};

export function useTimesheetEntries(filters: FetchTimesheetEntriesParams = {}) {
  return useQuery({
    queryKey: timesheetKeys.entries(filters),
    queryFn: async () => {
      const result = await fetchTimesheetEntries(filters);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch timesheet entries");
      }
      return result.data;
    },
  });
}
