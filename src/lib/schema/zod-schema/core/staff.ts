import { z } from "zod";
import { NoteZodSchema } from "@zod-schema/shared/notes";
import {
  GradeLevelsSupportedZod,
  SubjectsZod,
  SpecialGroupsZod,
  RolesZod,
  AdminLevelZod,
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";
import { createReferenceTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";

// Create Monday.com User Schema
export const MondayUserZodSchema = z.object({
  mondayId: z.string().describe("Unique user ID from Monday.com platform"),
  name: z.string(),
  email: z.string().email(),
  title: z.string().optional(),
  isVerified: z
    .boolean()
    .optional()
    .describe("Whether user account is verified in Monday.com"),
  isConnected: z
    .boolean()
    .default(true)
    .describe("Whether integration is currently active"),
  lastSynced: z
    .union([z.string(), z.date()])
    .optional()
    .describe("Timestamp of most recent data synchronization"),
});

// Experience Schema
export const ExperienceZodSchema = z.object({
  type: z.string().default(""),
  years: z.number().nonnegative().default(0),
});

// Unified Staff Fields Schema
export const StaffFieldsSchema = z.object({
  // Core fields
  staffName: z.string().default(""),
  email: z.string().email().default(""),
  schoolIds: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Array of School document _ids where this staff member works"),
  mondayUser: MondayUserZodSchema.optional().describe(
    "Monday.com user integration data for bi-directional sync",
  ),
  roles: z
    .array(RolesZod)
    .optional()
    .default([])
    .describe("Staff role classifications (Teacher, Coach, Director, etc.)"),

  // Teacher-specific fields
  gradeLevelsSupported: z
    .array(GradeLevelsSupportedZod)
    .default([])
    .describe("Grade levels this teacher is qualified to teach"),
  subjects: z
    .array(SubjectsZod)
    .default([])
    .describe("Subject areas this teacher specializes in"),
  specialGroups: z
    .array(SpecialGroupsZod)
    .default([])
    .describe("Special education or specialized student groups served"),
  pronunciation: z.string().optional().default(""),
  notes: z.array(NoteZodSchema).optional().default([]),
  experience: z.array(ExperienceZodSchema).optional().default([]),

  // Admin/TL-specific fields
  adminLevel: AdminLevelZod.optional(),
  assignedDistricts: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Array of district names this staff member supports"),
});

// Staff Full Schema
export const StaffZodSchema = BaseDocumentSchema.merge(StaffFieldsSchema);

// Staff Input Schema
export const StaffInputZodSchema = toInputSchema(StaffZodSchema);

// Staff Reference Schema
export const StaffReferenceZodSchema = BaseReferenceZodSchema.merge(
  StaffFieldsSchema.pick({
    email: true,
    staffName: true,
    roles: true,
    gradeLevelsSupported: true,
  }).partial(),
).extend({
  schoolCount: z.number().optional(),
  subjectsCount: z.number().optional(),
  gradeLevel: z.string().optional(),
  role: z.string().optional(),
  experienceYears: z.number().optional(),
  isMondayConnected: z.boolean().optional(),
  mondayName: z.string().optional(),
  mondayTitle: z.string().optional(),
  lastSynced: z.string().optional(),
});

// Auto-generate TypeScript types
export type StaffInput = z.infer<typeof StaffInputZodSchema>;
export type Staff = z.infer<typeof StaffZodSchema>;
export type StaffReference = z.infer<typeof StaffReferenceZodSchema>;

export type Experience = z.infer<typeof ExperienceZodSchema>;
export type MondayUser = z.infer<typeof MondayUserZodSchema>;

// Staff Reference Transformer
export const staffToReference = createReferenceTransformer<
  Staff,
  StaffReference
>(
  (staff: Staff) => staff.staffName,
  (staff: Staff) => ({
    email: staff.email,
    staffName: staff.staffName,
    roles: staff.roles,
    gradeLevelsSupported: staff.gradeLevelsSupported?.slice(0, 2),
    schoolCount: staff.schoolIds?.length || 0,
    subjectsCount: staff.subjects?.length || 0,
    gradeLevel: staff.gradeLevelsSupported?.[0] || "",
    role: staff.roles?.[0] || "",
    experienceYears:
      staff.experience?.reduce(
        (sum: number, exp: Experience) => sum + exp.years,
        0,
      ) || 0,
    isMondayConnected: staff.mondayUser?.isConnected || false,
    mondayName: staff.mondayUser?.name,
    mondayTitle: staff.mondayUser?.title,
    lastSynced: staff.mondayUser?.lastSynced
      ? new Date(staff.mondayUser.lastSynced).toLocaleString()
      : undefined,
  }),
  StaffReferenceZodSchema,
);

export function createStaffDefaults(
  overrides: Partial<StaffInput> = {},
): StaffInput {
  return {
    ...StaffInputZodSchema.parse({}),
    ...overrides,
  };
}
