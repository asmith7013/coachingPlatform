import { z } from "zod";
import { NoteInputZodSchema } from "@zod-schema/shared/notes";
import { 
  GradeLevelsSupportedZod, 
  SubjectsZod, 
  SpecialGroupsZod, 
  RolesNYCPSZod, 
  RolesTLZod, 
  AdminLevelZod 
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// Create Monday.com User Schema
export const MondayUserZodSchema = z.object({
  mondayId: z.string(),
  name: z.string(),
  email: z.string().email(),
  title: z.string().optional(),
  isVerified: z.boolean().optional(),
  isConnected: z.boolean().default(true),
  lastSynced: z.union([z.string(), z.date()]).optional()
});

// Experience Schema
export const ExperienceZodSchema = z.object({
  type: z.string(),
  years: z.number().nonnegative(),
});

// Base StaffMember Fields Schema
export const StaffMemberFieldsSchema = z.object({
  staffName: z.string(),
  email: z.string().email(),
  schools: z.array(z.string()).optional(), // Array of school IDs
  mondayUser: MondayUserZodSchema.optional(), // Add Monday.com user info
});

// Base StaffMember Full Schema
export const StaffMemberZodSchema = BaseDocumentSchema.merge(StaffMemberFieldsSchema);

// Base StaffMember Input Schema
export const StaffMemberInputZodSchema = toInputSchema(StaffMemberZodSchema);

// NYCPS Staff Fields Schema
export const NYCPSStaffFieldsSchema = StaffMemberFieldsSchema.extend({
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  subjects: z.array(SubjectsZod),
  specialGroups: z.array(SpecialGroupsZod),
  rolesNYCPS: z.array(RolesNYCPSZod).optional(),
  pronunciation: z.string().optional(),
  notes: z.array(NoteInputZodSchema).optional(),
  experience: z.array(ExperienceZodSchema).optional(),
});

// NYCPS Staff Full Schema
export const NYCPSStaffZodSchema = BaseDocumentSchema.merge(NYCPSStaffFieldsSchema);

// NYCPS Staff Input Schema
export const NYCPSStaffInputZodSchema = toInputSchema(NYCPSStaffZodSchema);

// Teaching Lab Staff Fields Schema
export const TeachingLabStaffFieldsSchema = StaffMemberFieldsSchema.extend({
  adminLevel: AdminLevelZod.optional(),
  assignedDistricts: z.array(z.string()).optional(),
  rolesTL: z.array(RolesTLZod).optional(),
});

// Teaching Lab Staff Full Schema
export const TeachingLabStaffZodSchema = BaseDocumentSchema.merge(TeachingLabStaffFieldsSchema);

// Teaching Lab Staff Input Schema
export const TeachingLabStaffInputZodSchema = toInputSchema(TeachingLabStaffZodSchema);

// Auto-generate TypeScript types
export type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;
export type Experience = z.infer<typeof ExperienceZodSchema>;
export type MondayUser = z.infer<typeof MondayUserZodSchema>;