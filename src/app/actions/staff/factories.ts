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
  StaffMemberInput,
  NYCPSStaff,
  NYCPSStaffInput,
  TeachingLabStaff,
  TeachingLabStaffInput
} from "@zod-schema/core/staff";
import { createCrudActions } from "@server/crud/crud-action-factory";
import { ZodType } from "zod";

// Create standard CRUD actions for general staff
export const staffActions = createCrudActions({
  model: StaffMemberModel,
  fullSchema: StaffMemberZodSchema as ZodType<StaffMember>,
  inputSchema: StaffMemberInputZodSchema as ZodType<StaffMemberInput>,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'Staff Member'
  }
});

// Create standard CRUD actions for NYCPS staff
export const nycpsStaffActions = createCrudActions({
  model: NYCPSStaffModel,
  fullSchema: NYCPSStaffZodSchema as ZodType<NYCPSStaff>,
  inputSchema: NYCPSStaffInputZodSchema as ZodType<NYCPSStaffInput>,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'NYCPS Staff'
  }
});

// Create standard CRUD actions for Teaching Lab staff
export const tlStaffActions = createCrudActions({
  model: TeachingLabStaffModel,
  fullSchema: TeachingLabStaffZodSchema as ZodType<TeachingLabStaff>,
  inputSchema: TeachingLabStaffInputZodSchema as ZodType<TeachingLabStaffInput>,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'Teaching Lab Staff'
  }
}); 