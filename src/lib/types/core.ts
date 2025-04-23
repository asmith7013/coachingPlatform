import { z } from "zod";
import {
  NYCPSStaffZodSchema,
  NYCPSStaffInputZodSchema,
  StaffMemberZodSchema,
  StaffMemberInputZodSchema,
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema
} from "@zod-schema/core/staff";

import {
  SchoolZodSchema,
  SchoolInputZodSchema
} from "@zod-schema/core/school";

import {
  LookForZodSchema,
  LookForInputZodSchema
} from "@zod-schema/look-fors/look-for";

// Staff Types
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;

export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;

export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;
export type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;

// School Types
export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolInput = z.infer<typeof SchoolInputZodSchema>;

// Look For Types
export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForInput = z.infer<typeof LookForInputZodSchema>; 