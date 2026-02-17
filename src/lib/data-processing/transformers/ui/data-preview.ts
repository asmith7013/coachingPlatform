import type { SchoolInput } from "@domain-types/school";
import type { NYCPSStaffInput } from "@domain-types/staff";
import type { VisitInput } from "@domain-types/visit";
import type {
  BellScheduleInput,
  TeacherScheduleInput,
} from "@/lib/schema/zod-schema/schedules/schedule-documents";

// Reuse existing preview utilities from transformers
import {
  createDataPreview as createGenericPreview,
  formatValidationError,
  createValidationSummary,
} from "@/lib/data-processing/transformers/utils/preview-helpers";
import { handleClientError } from "@error/handlers/client";

export type PreviewDataType =
  | "school"
  | "staff"
  | "visits"
  | "bellSchedules"
  | "masterSchedule";

interface ProcessedTeacherSchedule extends TeacherScheduleInput {
  teacherEmail: string;
  teacherName: string;
}

/**
 * Domain-specific field extractors for meaningful previews
 * Each extractor focuses on the most important fields for user recognition
 */
const previewExtractors = {
  school: (school: SchoolInput) => ({
    schoolName: school.schoolName,
    district: school.district,
    schoolNumber: school.schoolNumber,
    gradeLevelsSupported: school.gradeLevelsSupported,
    address: school.address,
  }),

  staff: (staff: NYCPSStaffInput) => ({
    staffName: staff.staffName,
    email: staff.email,
    gradeLevelsSupported: staff.gradeLevelsSupported,
    subjects: staff.subjects,
    rolesNYCPS: staff.rolesNYCPS,
  }),

  visit: (visit: VisitInput) => ({
    date: visit.date,
    coach: visit.coach,
    cycleRef: visit.cycleRef,
    gradeLevelsSupported: visit.gradeLevelsSupported,
    allowedPurpose: visit.allowedPurpose,
  }),

  bellSchedule: (schedule: BellScheduleInput) => ({
    bellScheduleType: schedule.bellScheduleType,
    classScheduleCount: (schedule.classSchedule as unknown[])?.length || 0,
    assignedCycleDaysCount:
      (schedule.assignedCycleDays as unknown[])?.length || 0,
    school: schedule.school,
  }),

  masterSchedule: (schedule: ProcessedTeacherSchedule) => ({
    teacherName: schedule.teacherName,
    teacherEmail: schedule.teacherEmail,
    daysCount: (schedule.dayIndices as unknown[])?.length || 0,
    periodsCount: (schedule.assignments as unknown[])?.length || 0,
    school: schedule.school,
  }),
};

/**
 * Create domain-specific data preview for UI display
 * Uses existing createGenericPreview but adds domain-specific field extraction
 */
export function createDataPreview(
  data:
    | SchoolInput
    | NYCPSStaffInput[]
    | VisitInput[]
    | BellScheduleInput[]
    | ProcessedTeacherSchedule[],
  type: PreviewDataType,
): string {
  try {
    switch (type) {
      case "school": {
        const school = data as SchoolInput;
        const extracted = previewExtractors.school(school);
        return createGenericPreview(extracted, type);
      }

      case "staff": {
        const staff = data as NYCPSStaffInput[];
        const extracted = staff.slice(0, 3).map(previewExtractors.staff);
        const preview = createGenericPreview(extracted, type);
        return staff.length > 3
          ? `${preview}\n... and ${staff.length - 3} more staff members`
          : preview;
      }

      case "visits": {
        const visits = data as VisitInput[];
        const extracted = visits.slice(0, 3).map(previewExtractors.visit);
        const preview = createGenericPreview(extracted, type);
        return visits.length > 3
          ? `${preview}\n... and ${visits.length - 3} more visits`
          : preview;
      }

      case "bellSchedules": {
        const schedules = data as BellScheduleInput[];
        const extracted = schedules
          .slice(0, 3)
          .map(previewExtractors.bellSchedule);
        const preview = createGenericPreview(extracted, type);
        return schedules.length > 3
          ? `${preview}\n... and ${schedules.length - 3} more bell schedules`
          : preview;
      }

      case "masterSchedule": {
        const schedules = data as ProcessedTeacherSchedule[];
        const extracted = schedules
          .slice(0, 3)
          .map(previewExtractors.masterSchedule);
        const preview = createGenericPreview(extracted, type);
        return schedules.length > 3
          ? `${preview}\n... and ${schedules.length - 3} more teacher schedules`
          : preview;
      }

      default:
        return "Error: Unknown data type for preview";
    }
  } catch (error) {
    const errorMessage = handleClientError(error, "createDataPreview");
    return `Error creating preview: ${errorMessage}`;
  }
}

/**
 * Create a summary preview showing just key identifiers
 * Useful for confirmation dialogs and quick overviews
 */
export function createSummaryPreview(
  data:
    | SchoolInput
    | NYCPSStaffInput[]
    | VisitInput[]
    | BellScheduleInput[]
    | ProcessedTeacherSchedule[],
  type: PreviewDataType,
): string {
  try {
    switch (type) {
      case "school": {
        const school = data as SchoolInput;
        return `${school.schoolName} (${school.district} - ${school.schoolNumber})`;
      }

      case "staff": {
        const staff = data as NYCPSStaffInput[];
        if (staff.length === 1) {
          return `${staff[0].staffName} (${staff[0].email})`;
        }
        return `${staff.length} staff members: ${staff
          .slice(0, 2)
          .map((s) => s.staffName)
          .join(", ")}${staff.length > 2 ? "..." : ""}`;
      }

      case "visits": {
        const visits = data as VisitInput[];
        if (visits.length === 1) {
          return `Visit on ${visits[0].date} with ${visits[0].coach}`;
        }
        return `${visits.length} visits from ${visits[0]?.date} to ${visits[visits.length - 1]?.date}`;
      }

      case "bellSchedules": {
        const schedules = data as BellScheduleInput[];
        if (schedules.length === 1) {
          return `${schedules[0].bellScheduleType} schedule with ${(schedules[0].classSchedule as unknown[] | undefined)?.length || 0} periods`;
        }
        return `${schedules.length} bell schedules: ${schedules.map((s) => s.bellScheduleType).join(", ")}`;
      }

      case "masterSchedule": {
        const schedules = data as ProcessedTeacherSchedule[];
        if (schedules.length === 1) {
          return `Schedule for ${schedules[0].teacherName} (${schedules[0].teacherEmail})`;
        }
        return `${schedules.length} teacher schedules: ${schedules
          .slice(0, 2)
          .map((s) => s.teacherName)
          .join(", ")}${schedules.length > 2 ? "..." : ""}`;
      }

      default:
        return "Unknown data type";
    }
  } catch (error) {
    const errorMessage = handleClientError(error, "createSummaryPreview");
    return `Error creating summary: ${errorMessage}`;
  }
}

/**
 * Create validation result preview for user feedback
 * Leverages existing createValidationSummary from transformers
 */
export function createValidationPreview(result: {
  success: boolean;
  validCount?: number;
  totalCount?: number;
  error?: string;
  data?: unknown;
}): {
  summary: string;
  details?: string;
} {
  const summary = createValidationSummary(result);

  // Add details if there's data to preview
  let details: string | undefined;
  if (result.success && result.data) {
    try {
      details = createGenericPreview(
        result.data as Record<string, unknown> | Record<string, unknown>[],
      );
    } catch (error) {
      console.error("Error creating preview:", error);
      // If preview fails, don't include details
      details = undefined;
    }
  }

  return { summary, details };
}

/**
 * Export preview utilities for different use cases
 */
export const previewUtils = {
  // Full detailed preview
  detailed: createDataPreview,

  // Short summary preview
  summary: createSummaryPreview,

  // Validation result preview
  validation: createValidationPreview,

  // Error formatting (reuse from transformers)
  formatError: formatValidationError,
};
