import { 
  StaffMemberModel, 
  NYCPSStaffModel, 
  TeachingLabStaffModel 
} from "@/lib/data-schema/mongoose-schema/core/staff.model";
import { 
  StaffMemberZodSchema, 
  StaffMemberInputZodSchema,
  NYCPSStaffZodSchema, 
  NYCPSStaffInputZodSchema,
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema
} from "@/lib/data-schema/zod-schema/core/staff";
import { createCrudActions } from "@/lib/data-server/crud/crud-action-factory";

// Create standard CRUD actions for general staff
export const staffActions = createCrudActions({
  model: StaffMemberModel,
  fullSchema: StaffMemberZodSchema,
  inputSchema: StaffMemberInputZodSchema,
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
  fullSchema: NYCPSStaffZodSchema,
  inputSchema: NYCPSStaffInputZodSchema,
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
  fullSchema: TeachingLabStaffZodSchema,
  inputSchema: TeachingLabStaffInputZodSchema,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'Teaching Lab Staff'
  }
}); 