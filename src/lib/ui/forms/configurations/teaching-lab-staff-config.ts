import type { FormConfiguration } from '@ui-types/form';
import { TeachingLabStaffInputZodSchema } from '@zod-schema/core/staff';
import type { TeachingLabStaffInput } from '@domain-types/staff';
import { createModeAwareConfig, type FormMode } from './schema-aware-builders';

/**
 * Schema-aware Teaching Lab Staff Form Configuration
 */
const teachingLabStaffConfigFactory = createModeAwareConfig(
  TeachingLabStaffInputZodSchema,
  (builder, mode) => [
    builder.createTextField(
      'staffName', 
      'Staff Name', 
      true, 
      true, 
      'Full name of the Teaching Lab staff member'
    ),
    builder.createEmailField(
      'email', 
      'Email', 
      mode, 
      'Primary email address for communication'
    ),
    builder.createEnumField(
      'adminLevel', 
      'Admin Level', 
      true, 
      'Administrative level within Teaching Lab'
    ),
    builder.createEnumField(
      'rolesTL', 
      'Teaching Lab Roles', 
      false, 
      'Select all applicable roles within Teaching Lab'
    ),
    builder.createReferenceField(
      'schools', 
      'Schools', 
      '/api/reference/schools', 
      true, 
      true, 
      'Select all schools this staff member supports'
    ),
    builder.createReferenceField(
      'assignedDistricts', 
      'Assigned Districts', 
      '/api/reference/districts', 
      true, 
      true, 
      'Select all districts this staff member is assigned to'
    ),
    builder.createReferenceField(
      'owners', 
      'Owners', 
      '/api/reference/staff', 
      true, 
      true, 
      'Select staff members responsible for managing this person'
    )
  ]
);

// Export mode-specific configurations
export const TeachingLabStaffCreateFieldConfig = teachingLabStaffConfigFactory.create();
export const TeachingLabStaffEditFieldConfig = teachingLabStaffConfigFactory.edit();

// Legacy export
export const TeachingLabStaffFieldConfig = TeachingLabStaffCreateFieldConfig;

export const createTeachingLabStaffFormConfig = (mode: FormMode): FormConfiguration => ({
  fields: mode === 'create' ? TeachingLabStaffCreateFieldConfig : TeachingLabStaffEditFieldConfig,
  schema: TeachingLabStaffInputZodSchema,
  title: mode === 'create' ? 'Add Teaching Lab Staff' : 'Edit Teaching Lab Staff Information',
  description: mode === 'create' 
    ? 'Add a new Teaching Lab staff member' 
    : 'Update Teaching Lab staff member details'
});

// Export specific form configurations
export const teachingLabStaffCreateFormConfig = createTeachingLabStaffFormConfig('create');
export const teachingLabStaffEditFormConfig = createTeachingLabStaffFormConfig('edit');

// Legacy export
export const teachingLabStaffFormConfig = teachingLabStaffCreateFormConfig; 