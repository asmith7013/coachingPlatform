import { z } from "zod";
import {
  ReasonDoneZod,
  TotalDurationZod,
  SolvesTouchpointZod,
  NYCSolvesAdminZod,
  AdminDoneZod,
  ImplementationExperienceZod,
  PrimaryStrategyCategoryZod,
  TeacherSupportTypesZod,
  GradeLevelsSupportedZod,
  ImplementationExperience,
  ReasonDone,
  TotalDuration,
  SolvesTouchpoint,
  NYCSolvesAdmin,
  AdminDone,
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";
import {
  createReferenceTransformer,
  createArrayTransformer,
} from "@/lib/data-processing/transformers/factories/reference-factory";
import {
  getTotalDurationMinutes,
  hasMicroPL,
  hasModel,
} from "@schema/reference/visits/coaching-log-helpers";

// Coaching Log Fields Schema
export const CoachingLogFieldsSchema = z.object({
  coachingActionPlanId: z
    .string()
    .optional()
    .describe(
      "Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE",
    ),
  reasonDone: ReasonDoneZod.default(ReasonDone.NO).describe(
    "Why coaching was completed: Full completion or early termination",
  ),
  microPLTopic: z
    .string()
    .optional()
    .describe("Topic for micro professional learning session"),
  microPLDuration: z
    .number()
    .optional()
    .describe("Duration in minutes for micro professional learning session"),
  modelTopic: z.string().optional().describe("Topic for modeling session"),
  modelDuration: z
    .number()
    .optional()
    .describe("Duration in minutes for modeling session"),

  // Travel Duration Fields
  schoolTravelDuration: z
    .number()
    .default(76)
    .describe("Travel duration in minutes to reach the school"),
  finalTravelDuration: z
    .number()
    .default(76)
    .describe(
      "Travel duration in minutes to second school or final destination",
    ),

  adminMeet: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether administrator joined the coaching session"),
  adminMeetDuration: z
    .number()
    .optional()
    .describe("Duration in minutes of administrator participation"),
  NYCDone: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether NYC-specific coaching requirements were met"),

  // NEW: Admin-related form fields
  NYCSolvesAdmin: NYCSolvesAdminZod.optional().describe(
    "Did you meet with the school administrators and/or school-based coach today?",
  ),
  adminDone: AdminDoneZod.optional().describe(
    "Did you meet with the school administrators and/or school-based coach about coaching progress at this school today?",
  ),

  // ✅ NEW: Individual coaching activity controls (replacing single CoachingDone)
  oneOnOneCoachingDone: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether 1:1 coaching was provided at this school today"),
  microPLDone: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether micro PL was delivered at this school today"),
  modelingPlanningDone: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether modeling or planning was provided with teachers"),
  walkthroughDone: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether classroom walkthrough was conducted"),

  // ✅ DEPRECATED: Keep for backward compatibility
  // CoachingDone: z.boolean().optional().default(false).describe("@deprecated - use oneOnOneCoachingDone, microPLDone, modelingPlanningDone instead"),
  totalDuration: TotalDurationZod.default(TotalDurationZod.options[0]).describe(
    "Total session duration: 30min, 45min, 60min, or 90min",
  ),
  solvesTouchpoint: SolvesTouchpointZod.default(
    SolvesTouchpointZod.options[0],
  ).describe("Type of coaching support: Teacher, Leader, or Combined"),

  // NEW: Contractor Information
  isContractor: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether coach is a 1099 contractor with Teaching Lab"),

  // NEW: Teacher Support Details
  teachersSupportedNumber: z
    .number()
    .optional()
    .default(1)
    .describe("Number of teachers supported during session"),
  gradeLevelsSupported: z
    .array(GradeLevelsSupportedZod)
    .optional()
    .default([])
    .describe("Grade levels supported during this session"),
  teachersSupportedTypes: z
    .array(TeacherSupportTypesZod)
    .optional()
    .default([])
    .describe("Types of teachers supported"),

  // Hierarchical Implementation Fields
  implementationExperience: ImplementationExperienceZod.default(
    ImplementationExperience.FIRST_YEAR,
  ).describe("Parent category: First year or Experienced implementation"),
  implementationFocus: z
    .string()
    .optional()
    .describe("Specific implementation focus (validated against constants)"),

  // Hierarchical Strategy Fields
  primaryStrategyCategory: PrimaryStrategyCategoryZod.optional().describe(
    "Parent category: Preparing to Teach, In-class support, etc.",
  ),
  primaryStrategySpecific: z
    .string()
    .optional()
    .describe("Specific primary strategy (validated against constants)"),

  // Legacy fields (keep for backward compatibility)
  primaryStrategy: z
    .string()
    .optional()
    .describe("Primary strategy used in this coaching log (legacy field)"),
  solvesSpecificStrategy: z
    .string()
    .optional()
    .describe("Specific strategy solved in this coaching log (legacy field)"),

  aiSummary: z
    .string()
    .optional()
    .describe("AI-generated summary of the coaching log"),
  visitId: z
    .string()
    .optional()
    .describe("Reference to Visit document _id this log belongs to"),
});

// Coaching Log Full Schema
export const CoachingLogZodSchema = BaseDocumentSchema.merge(
  CoachingLogFieldsSchema,
);

// Coaching Log Input Schema
export const CoachingLogInputZodSchema = toInputSchema(CoachingLogZodSchema);

// Coaching Log Reference Schema
export const CoachingLogReferenceZodSchema = BaseReferenceZodSchema.merge(
  CoachingLogFieldsSchema.pick({
    coachingActionPlanId: true,
    reasonDone: true,
    totalDuration: true,
    solvesTouchpoint: true,
    visitId: true,
    implementationExperience: true,
    implementationFocus: true,
    primaryStrategyCategory: true,
    primaryStrategySpecific: true,
  }).partial(),
).extend({
  hasMicroPL: z.boolean().optional(),
  hasModel: z.boolean().optional(),
  totalDurationMinutes: z.number().optional(),
  primaryStrategyShort: z.string().optional(),
});

// Coaching Log Reference Transformer
export const coachingLogToReference = createReferenceTransformer<
  CoachingLog,
  CoachingLogReference
>(
  (log) => {
    const strategy = log.primaryStrategySpecific || log.primaryStrategy;
    return strategy
      ? strategy.slice(0, 50) + (strategy.length > 50 ? "..." : "")
      : "Coaching Log";
  },
  (log) => ({
    coachingActionPlanId: log.coachingActionPlanId,
    reasonDone: log.reasonDone,
    totalDuration: log.totalDuration,
    solvesTouchpoint: log.solvesTouchpoint,
    visitId: log.visitId,
    implementationExperience: log.implementationExperience,
    implementationFocus: log.implementationFocus,
    primaryStrategyCategory: log.primaryStrategyCategory,
    primaryStrategySpecific: log.primaryStrategySpecific,
    hasMicroPL: hasMicroPL(log),
    hasModel: hasModel(log),
    totalDurationMinutes: getTotalDurationMinutes(log),
  }),
  CoachingLogReferenceZodSchema,
);

// Array transformer
export const coachingLogsToReferences = createArrayTransformer<
  CoachingLog,
  CoachingLogReference
>(coachingLogToReference);

// Auto-generate TypeScript types
export type CoachingLogInput = z.infer<typeof CoachingLogInputZodSchema>;
export type CoachingLog = z.infer<typeof CoachingLogZodSchema>;
export type CoachingLogReference = z.infer<
  typeof CoachingLogReferenceZodSchema
>;

// Add helper for schema-driven defaults
export function createCoachingLogDefaults(
  overrides: Partial<CoachingLogInput> = {},
): CoachingLogInput {
  // Provide explicit defaults instead of parsing empty object
  const defaults: CoachingLogInput = {
    reasonDone: ReasonDone.NO,
    totalDuration: TotalDuration.FULL_DAY,
    solvesTouchpoint: SolvesTouchpoint.TEACHER_OR_LEADER,
    primaryStrategy: "Co-facilitation of lesson", // Temporary default
    solvesSpecificStrategy: "Supporting teacher implementation", // Temporary default
    implementationExperience: ImplementationExperience.FIRST_YEAR, // Temporary default

    // NEW: Add defaults for new fields
    isContractor: true,
    teachersSupportedNumber: 1,
    gradeLevelsSupported: [],
    teachersSupportedTypes: [],
    schoolTravelDuration: 76,
    finalTravelDuration: 76,

    // ✅ NEW: Individual coaching activity defaults
    oneOnOneCoachingDone: true, // Default: Yes for 1:1 coaching
    microPLDone: false, // Default: No for micro PL
    modelingPlanningDone: false, // Default: No for modeling/planning
    walkthroughDone: false, // Default: No for walkthroughs

    // DEPRECATED: Keep for backward compatibility
    CoachingDone: false,

    // NEW: Admin field defaults
    NYCSolvesAdmin: NYCSolvesAdmin.NO,
    adminDone: AdminDone.NO,

    owners: [],
    // ... other required fields with defaults
  };

  return {
    ...defaults,
    ...overrides,
  };
}

// Note: Validation against constants should be done in form components
// using the helper functions from @ui/constants/coaching-log
