import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// ACTIVITY TYPE CONFIG SCHEMA
// =====================================

/**
 * Detail type enum - determines what kind of detail card to show
 */
export const DetailTypeZod = z.enum([
  "inquiry",   // Inquiry activity questions (nested by section/assessment)
  "lesson",    // Lesson picker from scope-and-sequence
  "skill",     // Skill picker from unit's additionalSupportSkills
  "custom",    // Free text input
  "none"       // No detail card needed
]);

/**
 * Activity type configuration fields
 */
export const ActivityTypeConfigFieldsSchema = z.object({
  id: z.string().min(1).describe("Unique identifier (kebab-case, e.g., 'inquiry-activity')"),
  label: z.string().min(1).max(50).describe("Display name (e.g., 'Inquiry Activity')"),
  requiresDetails: z.boolean().describe("Whether to show detail card when checked"),
  detailType: DetailTypeZod.describe("Type of detail to collect"),
  icon: z.string().min(1).max(10).describe("Emoji icon for column header"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).describe("Hex color code (e.g., '#3b82f6')"),
  isDefault: z.boolean().default(false).describe("Cannot be deleted if true"),
  order: z.number().int().nonnegative().describe("Display order (lower = left)"),
});

/**
 * Full activity type config schema with base document fields
 */
export const ActivityTypeConfigZodSchema = BaseDocumentSchema.merge(ActivityTypeConfigFieldsSchema);

/**
 * Input schema for creating/updating activity type configs
 */
export const ActivityTypeConfigInputZodSchema = toInputSchema(ActivityTypeConfigZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type DetailType = z.infer<typeof DetailTypeZod>;
export type ActivityTypeConfig = z.infer<typeof ActivityTypeConfigZodSchema>;
export type ActivityTypeConfigInput = z.infer<typeof ActivityTypeConfigInputZodSchema>;

// =====================================
// DEFAULT VALUE CREATORS
// =====================================

/**
 * Create default values for activity type config input
 */
export function createActivityTypeConfigDefaults(
  overrides: Partial<ActivityTypeConfigInput> = {}
): ActivityTypeConfigInput {
  return {
    id: "",
    label: "",
    requiresDetails: false,
    detailType: "none",
    icon: "📝",
    color: "#3b82f6",
    isDefault: false,
    order: 0,
    ownerIds: [],
    ...overrides
  };
}

/**
 * Default activity types for seeding
 */
export const DEFAULT_ACTIVITY_TYPES: ActivityTypeConfigInput[] = [
  {
    id: "inquiry-activity",
    label: "Inquiry Activity",
    requiresDetails: true,
    detailType: "inquiry",
    icon: "🔍",
    color: "#3b82f6",
    isDefault: true,
    order: 1,
    ownerIds: []
  },
  {
    id: "small-group-acceleration",
    label: "Small Group (Acceleration)",
    requiresDetails: true,
    detailType: "lesson",
    icon: "🚀",
    color: "#10b981",
    isDefault: true,
    order: 2,
    ownerIds: []
  },
  {
    id: "small-group-prerequisite",
    label: "Small Group (Prerequisite)",
    requiresDetails: true,
    detailType: "skill",
    icon: "🎯",
    color: "#f59e0b",
    isDefault: true,
    order: 3,
    ownerIds: []
  },
  {
    id: "student-of-day",
    label: "Student of the Day",
    requiresDetails: false,
    detailType: "none",
    icon: "⭐",
    color: "#eab308",
    isDefault: true,
    order: 4,
    ownerIds: []
  }
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
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
