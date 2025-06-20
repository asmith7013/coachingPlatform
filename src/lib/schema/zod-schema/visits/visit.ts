import { z } from "zod";
import { 
  GradeLevelsSupportedZod, 
  AllowedPurposeZod,
  ModeDoneZod,
} from "@enums";
// import { EventFieldsSchema } from "@/lib/schema/zod-schema/schedules/schedule";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { toDateString, formatMediumDate } from '@/lib/data-processing/transformers/utils/date-utils';

// Helper function for consistent date formatting
export function formatVisitDate(date: Date | string | undefined): string {
  if (!date) return 'No date set';
  
  const dateString = date instanceof Date 
    ? toDateString(date)
    : date;
    
  return formatMediumDate(dateString);
}

// =====================================
// SESSION LINK SCHEMA
// =====================================

export const SessionLinkFieldsSchema = z.object({
  purpose: z.string().describe("Purpose of the linked resource"),
  title: z.string().describe("Display title for the link"),
  url: z.string().url().describe("Valid URL to external resource or document"),
  staffIds: z.array(z.string()).describe("Array of Staff document _ids who should access this link"),
  periodNum: z.number().optional().default(0).describe("Bell schedule period number (1-8)"),
});

// =====================================
// VISIT SCHEMA (Updated for New Schedule Flow)
// =====================================

export const VisitFieldsSchema = z.object({
  // Primary relationships
  coachingActionPlanId: z.string().describe("Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE"),
  date: z.string().optional().describe("ISO string for system timestamp"),
  schoolId: z.string().describe("Reference to School document _id where visit occurs"),
  coachId: z.string().describe("Reference to Staff document _id of the coach conducting visit"),
  
  // Optional relationships
  cycleId: z.string().optional().describe("Reference to Cycle document _id for coaching cycle"),
  teacherId: z.string().optional().describe("Primary teacher for this visit (most common from schedule events)"),
  
  // Visit metadata
  allowedPurpose: AllowedPurposeZod.optional().describe("Visit type: Initial Walkthrough, Regular Visit, or Final Walkthrough"),
  modeDone: ModeDoneZod.optional().describe("Visit format: In-Person, Virtual, or Hybrid"),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).default([]).describe("Grade levels included in this visit"),
  
  // Schedule reference (NEW - replaces embedded events)
  visitScheduleId: z.string().optional().describe("Reference to VisitSchedule document _id for detailed scheduling"),
  
  // NEW: Reference to embedded weekly plan
  weeklyPlanIndex: z.number().optional().describe("Index of weekly plan within CAP.weeklyPlans array for this visit"),
  
  // NEW: Metrics to focus on during this visit  
  focusOutcomeIndexes: z.array(z.number()).default([]).describe("Indexes of CAP.outcomes array to focus on during this visit"),
  
  // events: z.array(VisitScheduleZodSchema).default([]).describe("Events that occurred during this visit"),
  // Supporting content
  sessionLinks: z.array(SessionLinkFieldsSchema).default([]).describe("External resources and documents"),
  
  // Monday.com integration fields
  mondayItemId: z.string().optional().describe("Monday.com board item ID for bi-directional sync"),
  mondayBoardId: z.string().optional().describe("Monday.com board ID where visit item exists"),
  mondayItemName: z.string().optional().describe("Item name in Monday.com"),
  mondayLastSyncedAt: z.string().optional().describe("Last sync timestamp with Monday.com"),
  
  // Import flexibility fields
  siteAddress: z.string().optional().describe("Physical address for visit location"),
  endDate: z.string().optional().describe("ISO string for system timestamp"),
});

// Visit Full Schema
export const VisitZodSchema = BaseDocumentSchema.merge(VisitFieldsSchema);

// Visit Input Schema
export const VisitInputZodSchema = toInputSchema(VisitZodSchema);

// =====================================
// VISIT REFERENCE SCHEMA
// =====================================

export const VisitReferenceZodSchema = BaseReferenceZodSchema.merge(
  VisitFieldsSchema
    .pick({
      date: true,
      schoolId: true,
      coachId: true,
      allowedPurpose: true,
      modeDone: true,
    })
    .partial()
).extend({
  date: z.string().optional().describe("Date as ISO string or formatted for display"),
  dateFormatted: z.string().optional().describe("Formatted date string"),
  schoolName: z.string().optional().describe("School name (for display)"),
  coachName: z.string().optional().describe("Coach name (for display)"),
  hasSchedule: z.boolean().optional().describe("Whether visit has a schedule"),
  hasCoachingLog: z.boolean().optional().describe("Whether visit has a coaching log"),
});

// =====================================
// VISIT IMPORT SCHEMA
// =====================================

export const VisitImportZodSchema = VisitFieldsSchema.extend({
  // Relax validation for flexible import
  date: z.string().optional().describe("ISO string for system timestamp"),
  schoolId: z.string().optional(),
  coachId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).optional(),
});

// =====================================
// REFERENCE TRANSFORMER
// =====================================

export const visitToReference = createReferenceTransformer<Visit, VisitReference>(
  // Label function: Create display string from date and purpose
  (visit) => {
    if (!visit.date) return 'No date set';
    const dateStr = formatVisitDate(visit.date);
    return visit.allowedPurpose ? `${dateStr} - ${visit.allowedPurpose}` : dateStr;
  },
  
  // Additional fields function
  (visit) => {
    const date = visit.date ? new Date(visit.date) : undefined;
    return {
      date: date ? date.toISOString() : undefined,
      schoolId: visit.schoolId,
      coachId: visit.coachId,
      allowedPurpose: visit.allowedPurpose,
      modeDone: visit.modeDone,
      dateFormatted: date ? formatVisitDate(date) : undefined,
      hasSchedule: !!visit.visitScheduleId,
      hasCoachingLog: false, // This would need to be populated from related data
    };
  },
  
  // Validation schema
  VisitReferenceZodSchema
);

// Array transformer
export const visitsToReferences = createArrayTransformer<Visit, VisitReference>(
  visitToReference
);

// =====================================
// TYPE EXPORTS
// =====================================

export type SessionLink = z.infer<typeof SessionLinkFieldsSchema>;
export type VisitInput = z.infer<typeof VisitInputZodSchema>;
export type Visit = z.infer<typeof VisitZodSchema>;
export type VisitReference = z.infer<typeof VisitReferenceZodSchema>;
export type VisitImport = z.infer<typeof VisitImportZodSchema>;

// =====================================
// HELPER FUNCTIONS
// =====================================

export function createVisitDefaults(overrides: Partial<VisitInput> = {}): VisitInput {
  return {
    coachingActionPlanId: '',
    date: new Date().toISOString(),
    schoolId: '',
    coachId: '',
    gradeLevelsSupported: [],
    sessionLinks: [],
    ...overrides
  };
}