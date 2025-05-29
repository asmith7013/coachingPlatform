"use server";

import { 
  StaffMemberModel,
  NYCPSStaffModel,
  TeachingLabStaffModel
} from "@mongoose-schema/core/staff.model";
import { 
  StaffMemberZodSchema, 
  StaffMemberInputZodSchema,
  NYCPSStaffZodSchema,
  NYCPSStaffInputZodSchema,
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema,
  StaffMember,
  NYCPSStaff,
  TeachingLabStaff
} from "@zod-schema/core/staff";
import { ZodType } from "zod";
import { createCrudActions } from "@server/crud";

// Create CRUD actions for Staff Members
export const staffActions = createCrudActions({
  model: StaffMemberModel,
  schema: StaffMemberZodSchema as ZodType<StaffMember>,
  inputSchema: StaffMemberInputZodSchema,
  name: "Staff Member",
  revalidationPaths: ["/dashboard/staff"],
  sortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
  defaultSortField: 'staffName'
});

// Create CRUD actions for NYCPS Staff
export const nycpsStaffActions = createCrudActions({
  model: NYCPSStaffModel,
  schema: NYCPSStaffZodSchema as ZodType<NYCPSStaff>,
  inputSchema: NYCPSStaffInputZodSchema,
  name: "NYCPS Staff",
  revalidationPaths: ["/dashboard/staff"],
  sortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
  defaultSortField: 'staffName'
});

// Create CRUD actions for Teaching Lab Staff
export const tlStaffActions = createCrudActions({
  model: TeachingLabStaffModel,
  schema: TeachingLabStaffZodSchema as ZodType<TeachingLabStaff>,
  inputSchema: TeachingLabStaffInputZodSchema,
  name: "Teaching Lab Staff",
  revalidationPaths: ["/dashboard/staff"],
  sortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
  defaultSortField: 'staffName'
}); 