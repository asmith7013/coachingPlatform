"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { TimesheetEntryModel } from "@/lib/schema/mongoose-schema/scm/timesheet/timesheet-entry.model";
import type { TimesheetEntry } from "@/lib/schema/zod-schema/scm/timesheet/timesheet-entry";

// =====================================
// FETCH OPERATIONS
// =====================================

export interface FetchTimesheetEntriesParams {
  startDate?: string;
  endDate?: string;
  project?: string;
}

/**
 * Fetch timesheet entries with optional date range and project filters
 */
export async function fetchTimesheetEntries(
  params: FetchTimesheetEntriesParams = {},
) {
  return withDbConnection(async () => {
    try {
      const { startDate, endDate, project } = params;
      const query: Record<string, unknown> = {};

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          (query.date as Record<string, string>).$gte = startDate;
        }
        if (endDate) {
          (query.date as Record<string, string>).$lte = endDate;
        }
      }

      // Project filter
      if (project) {
        query.project = project;
      }

      const results = await TimesheetEntryModel.find(query)
        .sort({ date: -1, submittedAt: -1 })
        .lean();

      // Transform ObjectIds to strings
      const entries = results.map((doc) => ({
        ...doc,
        _id: String(doc._id),
      })) as unknown as TimesheetEntry[];

      return {
        success: true,
        data: entries,
        count: entries.length,
      };
    } catch (error) {
      console.error("💥 Error fetching timesheet entries:", error);
      return {
        success: false,
        data: [] as TimesheetEntry[],
        count: 0,
        error: handleServerError(error, "fetchTimesheetEntries"),
      };
    }
  });
}

// =====================================
// DELETE OPERATIONS
// =====================================

/**
 * Delete a timesheet entry by ID
 */
export async function deleteTimesheetEntry(entryId: string) {
  return withDbConnection(async () => {
    try {
      const result = await TimesheetEntryModel.findByIdAndDelete(entryId);

      if (!result) {
        return {
          success: false,
          error: "Entry not found",
        };
      }

      return {
        success: true,
        data: { deletedId: entryId },
      };
    } catch (error) {
      console.error("💥 Error deleting timesheet entry:", error);
      return {
        success: false,
        error: handleServerError(error, "deleteTimesheetEntry"),
      };
    }
  });
}

/**
 * Get summary statistics for timesheet entries
 */
export async function getTimesheetSummary(
  params: FetchTimesheetEntriesParams = {},
) {
  return withDbConnection(async () => {
    try {
      const { startDate, endDate, project } = params;
      const matchStage: Record<string, unknown> = {};

      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) {
          (matchStage.date as Record<string, string>).$gte = startDate;
        }
        if (endDate) {
          (matchStage.date as Record<string, string>).$lte = endDate;
        }
      }

      if (project) {
        matchStage.project = project;
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$hours" },
            totalPay: { $sum: "$totalPay" },
            entryCount: { $sum: 1 },
          },
        },
      ];

      const results = await TimesheetEntryModel.aggregate(pipeline);
      const summary = results[0] || {
        totalHours: 0,
        totalPay: 0,
        entryCount: 0,
      };

      return {
        success: true,
        data: {
          totalHours: summary.totalHours,
          totalPay: summary.totalPay,
          entryCount: summary.entryCount,
        },
      };
    } catch (error) {
      console.error("💥 Error getting timesheet summary:", error);
      return {
        success: false,
        data: { totalHours: 0, totalPay: 0, entryCount: 0 },
        error: handleServerError(error, "getTimesheetSummary"),
      };
    }
  });
}
