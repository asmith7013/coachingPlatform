import { z } from "zod";
import { NoteZodSchema } from "@zod-schema/shared/notes";
import { 
  GradeLevelsSupportedZod, 
  SubjectsZod, 
  SpecialGroupsZod, 
  RolesNYCPSZod, 
  RolesTLZod, 
  AdminLevelZod 
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer } from "@transformers/factories/reference-factory";

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
  notes: z.array(NoteZodSchema).optional(),
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

// Staff Reference Schema
export const StaffReferenceZodSchema = BaseReferenceZodSchema.merge(
  StaffMemberFieldsSchema
    .pick({
      email: true,
      staffName: true,
    })
    .partial()
).extend({
  schoolCount: z.number().optional(),
  isMondayConnected: z.boolean().optional(),
  mondayName: z.string().optional(),
  mondayTitle: z.string().optional(),
  lastSynced: z.string().optional(),
});

// Staff Reference Transformer
export const staffToReference = createReferenceTransformer<StaffMember, StaffReference>(
  (staff: StaffMember) => staff.staffName,
  (staff: StaffMember) => ({
    email: staff.email,
    staffName: staff.staffName,
    schoolCount: staff.schools?.length || 0,
    isMondayConnected: staff.mondayUser?.isConnected || false,
    mondayName: staff.mondayUser?.name,
    mondayTitle: staff.mondayUser?.title,
    lastSynced: staff.mondayUser?.lastSynced ? new Date(staff.mondayUser.lastSynced).toLocaleString() : undefined,
  }),
  StaffReferenceZodSchema
);

// NYCPS Staff Reference Schema
export const NYCPSStaffReferenceZodSchema = BaseReferenceZodSchema.merge(
  NYCPSStaffFieldsSchema
    .pick({
      email: true,
      staffName: true,
      rolesNYCPS: true,
      gradeLevelsSupported: true,
    })
    .partial()
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

// NYCPS Staff Reference Transformer
export const nycpsStaffToReference = createReferenceTransformer<NYCPSStaff, NYCPSStaffReference>(
  (staff: NYCPSStaff) => staff.staffName,
  (staff: NYCPSStaff) => ({
    email: staff.email,
    staffName: staff.staffName,
    rolesNYCPS: staff.rolesNYCPS,
    gradeLevelsSupported: staff.gradeLevelsSupported?.slice(0, 2),
    schoolCount: staff.schools?.length || 0,
    subjectsCount: staff.subjects?.length || 0,
    gradeLevel: staff.gradeLevelsSupported?.[0] || '',
    role: staff.rolesNYCPS?.[0] || '',
    experienceYears: staff.experience?.reduce((sum: number, exp: Experience) => sum + exp.years, 0) || 0,
    isMondayConnected: staff.mondayUser?.isConnected || false,
    mondayName: staff.mondayUser?.name,
    mondayTitle: staff.mondayUser?.title,
    lastSynced: staff.mondayUser?.lastSynced ? new Date(staff.mondayUser.lastSynced).toLocaleString() : undefined,
  }),
  NYCPSStaffReferenceZodSchema
);

// Teaching Lab Staff Reference Schema
export const TeachingLabStaffReferenceZodSchema = BaseReferenceZodSchema.merge(
  TeachingLabStaffFieldsSchema
    .pick({
      email: true,
      staffName: true,
      adminLevel: true,
      rolesTL: true,
    })
    .partial()
).extend({
  schoolCount: z.number().optional(),
  districtsCount: z.number().optional(),
  role: z.string().optional(),
  isMondayConnected: z.boolean().optional(),
  mondayName: z.string().optional(),
  mondayTitle: z.string().optional(),
  lastSynced: z.string().optional(),
});

// Teaching Lab Staff Reference Transformer
export const teachingLabStaffToReference = createReferenceTransformer<TeachingLabStaff, TeachingLabStaffReference>(
  (staff) => staff.staffName,
  (staff) => ({
    email: staff.email,
    staffName: staff.staffName,
    adminLevel: staff.adminLevel,
    rolesTL: staff.rolesTL,
    schoolCount: staff.schools?.length || 0,
    districtsCount: staff.assignedDistricts?.length || 0,
    role: staff.rolesTL?.[0] || '',
    isMondayConnected: staff.mondayUser?.isConnected || false,
    mondayName: staff.mondayUser?.name,
    mondayTitle: staff.mondayUser?.title,
    lastSynced: staff.mondayUser?.lastSynced ? new Date(staff.mondayUser.lastSynced).toLocaleString() : undefined,
  }),
  TeachingLabStaffReferenceZodSchema
);

// Auto-generate TypeScript types
export type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type StaffReference = z.infer<typeof StaffReferenceZodSchema>;

export type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type NYCPSStaffReference = z.infer<typeof NYCPSStaffReferenceZodSchema>;

export type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;
export type TeachingLabStaffReference = z.infer<typeof TeachingLabStaffReferenceZodSchema>;

export type Experience = z.infer<typeof ExperienceZodSchema>;
export type MondayUser = z.infer<typeof MondayUserZodSchema>;
