import { z } from "zod";
import { NoteInputZodSchema } from "../shared/notes";
import { GradeLevelsSupportedZod, SubjectsZod, SpecialGroupsZod, RolesNYCPSZod, RolesTLZod, AdminLevelZod } from "../shared/enums";
import { zDateField } from '@/lib/zod-schema/shared/dateHelpers';

// ✅ Experience Schema
export const ExperienceZodSchema = z.object({
  type: z.string(),
  years: z.number().nonnegative(),
});

// ✅ Base StaffMember Input Schema
export const StaffMemberInputZodSchema = z.object({
  staffName: z.string(),
  email: z.string().email().optional(),
  schools: z.array(z.string()), // Array of school IDs
  owners: z.array(z.string()), // Owner IDs
});

// ✅ Base StaffMember Full Schema
export const StaffMemberZodSchema = StaffMemberInputZodSchema.extend({
  _id: z.string(),
  id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ NYCPS Staff Input Schema
export const NYCPSStaffInputZodSchema = StaffMemberInputZodSchema.extend({
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  subjects: z.array(SubjectsZod),
  specialGroups: z.array(SpecialGroupsZod),
  rolesNYCPS: z.array(RolesNYCPSZod).optional(),
  pronunciation: z.string().optional(),
  notes: z.array(NoteInputZodSchema).optional(),
  experience: z.array(ExperienceZodSchema).optional(),
});

// ✅ NYCPS Staff Full Schema
export const NYCPSStaffZodSchema = NYCPSStaffInputZodSchema.extend({
  _id: z.string(),
  id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Teaching Lab Staff Input Schema
export const TeachingLabStaffInputZodSchema = StaffMemberInputZodSchema.extend({
  adminLevel: AdminLevelZod,
  assignedDistricts: z.array(z.string()),
  rolesTL: z.array(RolesTLZod).optional(),
});

// ✅ Teaching Lab Staff Full Schema
export const TeachingLabStaffZodSchema = TeachingLabStaffInputZodSchema.extend({
  _id: z.string(),
  id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Auto-generate TypeScript types
export type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;
export type Experience = z.infer<typeof ExperienceZodSchema>;