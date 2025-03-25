import { z } from "zod";
import { NoteZodSchema } from "../shared/notes";
import { GradeLevelsSupportedZod, SubjectsZod, SpecialGroupsZod, RolesNYCPSZod, RolesTLZod, AdminLevelZod } from "../shared/shared-types";

// ✅ Experience Schema
export const ExperienceZodSchema = z.object({
  type: z.string(),
  years: z.number().nonnegative(),
});

// ✅ Base StaffMember Schema
export const StaffMemberZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
  id: z.string(), // Unique ID
  staffName: z.string(),
  email: z.string().email().optional(),
  schools: z.array(z.string()), // Array of school IDs
  owners: z.array(z.string()), // Owner IDs
  createdAt: z.date().optional(), // Match Mongoose timestamps
  updatedAt: z.date().optional(), // Match Mongoose timestamps
});

// ✅ NYCPS Staff Schema (Extends StaffMember)
export const NYCPSStaffZodSchema = StaffMemberZodSchema.extend({
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  subjects: z.array(SubjectsZod),
  specialGroups: z.array(SpecialGroupsZod),
  rolesNYCPS: z.array(RolesNYCPSZod).optional(),
  pronunciation: z.string().optional(),
  notes: z.array(NoteZodSchema).optional(),
  experience: z.array(ExperienceZodSchema).optional(), // Required in this case
});

// ✅ Teaching Lab Staff Schema (Extends StaffMember)
export const TeachingLabStaffZodSchema = StaffMemberZodSchema.extend({
  adminLevel: AdminLevelZod,
  assignedDistricts: z.array(z.string()),
  rolesTL: z.array(RolesTLZod).optional(),
});

// ✅ Auto-generate TypeScript types
export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;
export type Experience = z.infer<typeof ExperienceZodSchema>;