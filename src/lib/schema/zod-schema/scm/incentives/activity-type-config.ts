import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

// =====================================
// ACTIVITY TYPE CONFIG SCHEMA
// =====================================

/**
 * Detail type enum - determines what kind of detail card to show
 */
export const DetailTypeZod = z.enum([
  "inquiry", // Inquiry activity questions (nested by section/assessment)
  "lesson", // Lesson picker from scope-and-sequence
  "skill", // Skill picker from unit's additionalSupportSkills
  "small-group", // Small group with lesson + optional prereq skill
  "custom", // Free text input
  "none", // No detail card needed
]);

/**
 * Activity type configuration fields
 */
export const ActivityTypeConfigFieldsSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(50)
    .describe("Display name (e.g., 'Inquiry Activity')"),
  requiresDetails: z
    .boolean()
    .describe("Whether to show detail card when checked"),
  detailType: DetailTypeZod.describe("Type of detail to collect"),
  icon: z.string().min(1).max(10).describe("Emoji icon for column header"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Hex color code (e.g., '#3b82f6')"),
  isDefault: z.boolean().default(false).describe("Cannot be deleted if true"),
  order: z
    .number()
    .int()
    .nonnegative()
    .describe("Display order (lower = left)"),
  pointsValue: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe(
      "Points to auto-award when activity is logged (0 = no auto points)",
    ),
  typeId: z
    .string()
    .optional()
    .describe("Legacy field for backwards compatibility"),
});

/**
 * Full activity type config schema with base document fields
 */
export const ActivityTypeConfigZodSchema = BaseDocumentSchema.merge(
  ActivityTypeConfigFieldsSchema,
);

/**
 * Input schema for creating/updating activity type configs
 */
export const ActivityTypeConfigInputZodSchema = toInputSchema(
  ActivityTypeConfigZodSchema,
);

// =====================================
// TYPE EXPORTS
// =====================================

export type DetailType = z.infer<typeof DetailTypeZod>;
export type ActivityTypeConfig = z.infer<typeof ActivityTypeConfigZodSchema>;
export type ActivityTypeConfigInput = z.infer<
  typeof ActivityTypeConfigInputZodSchema
>;

// =====================================
// DEFAULT VALUE CREATORS
// =====================================

/**
 * Create default values for activity type config input
 */
export function createActivityTypeConfigDefaults(
  overrides: Partial<ActivityTypeConfigInput> = {},
): ActivityTypeConfigInput {
  return {
    label: "",
    requiresDetails: false,
    detailType: "none",
    icon: "📝",
    color: "#3b82f6",
    isDefault: false,
    order: 0,
    pointsValue: 0,
    ownerIds: [],
    ...overrides,
  };
}

/**
 * Default activity types for seeding
 */
export const DEFAULT_ACTIVITY_TYPES: ActivityTypeConfigInput[] = [
  {
    label: "Inquiry Activity",
    requiresDetails: true,
    detailType: "inquiry",
    icon: "🔍",
    color: "#3b82f6",
    isDefault: true,
    order: 1,
    pointsValue: 5,
    ownerIds: [],
  },
  {
    label: "Small Group",
    requiresDetails: true,
    detailType: "small-group",
    icon: "👥",
    color: "#8b5cf6",
    isDefault: true,
    order: 2,
    pointsValue: 5,
    ownerIds: [],
  },
  {
    label: "Student of the Day",
    requiresDetails: false,
    detailType: "none",
    icon: "⭐",
    color: "#eab308",
    isDefault: true,
    order: 3,
    pointsValue: 10,
    ownerIds: [],
  },
];

/**
 * Validate activity type ID format (kebab-case)
 */
export function isValidActivityTypeId(id: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
}

/**
 * Generate kebab-case ID from label
 */
export function generateActivityTypeId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
