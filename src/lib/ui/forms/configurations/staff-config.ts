import type { FormConfiguration } from '@ui-types/form';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';
// import type { NYCPSStaffInput } from '@domain-types/staff';
import { createModeAwareConfig, type FormMode } from './schema-aware-builders';

/**
 * Schema-aware NYCPS Staff Form Configuration
 */
const nycpsStaffConfigFactory = createModeAwareConfig(
  NYCPSStaffInputZodSchema,
  (builder, mode) => [
    builder.createTextField(
      'staffName',
      'Staff Name',
      true,
      true,
      'Full name of the staff member'
    ),
    builder.createEmailField(
      'email',
      'Email',
      mode, // Mode-aware: editable in create, disabled in edit
      mode === 'create' 
        ? 'Enter staff member email address'
        : 'Email is synced from external system and cannot be edited'
    ),
    builder.createReferenceField(
      'schools',
      'Schools',
      '/api/reference/schools',
      true, // multiple
      true,
      'Select all schools this staff member is associated with'
    ),
    builder.createReferenceField(
      'owners',
      'Owners',
      '/api/reference/staff',
      true, // multiple
      true,
      'Choose at least one coaching owner for this staff member'
    ),
    builder.createEnumField(
      'gradeLevelsSupported',
      'Grade Levels Supported',
      false,
      'Select all grade levels this staff member supports'
    ),
    builder.createEnumField(
      'subjects',
      'Subjects',
      false,
      'Select all subjects this staff member teaches or supports'
    ),
    builder.createEnumField(
      'specialGroups',
      'Special Groups',
      false,
      'Special populations this staff member works with'
    ),
    builder.createEnumField(
      'rolesNYCPS',
      'NYCPS Roles',
      false,
      'Roles within the NYCPS system'
    ),
    builder.createTextField(
      'pronunciation',
      'Pronunciation',
      false,
      true,
      'Phonetic pronunciation of staff member name'
    )
  ]
);

// Export mode-specific configurations
export const NYCPSStaffCreateFieldConfig = nycpsStaffConfigFactory.create();
export const NYCPSStaffEditFieldConfig = nycpsStaffConfigFactory.edit();

// Legacy export
export const NYCPSStaffFieldConfig = NYCPSStaffCreateFieldConfig;

export const createNYCPSStaffFormConfig = (mode: FormMode): FormConfiguration => ({
  fields: mode === 'create' ? NYCPSStaffCreateFieldConfig : NYCPSStaffEditFieldConfig,
  schema: NYCPSStaffInputZodSchema,
  title: mode === 'create' ? 'Add NYCPS Staff' : 'Edit NYCPS Staff Information',
  description: mode === 'create'
    ? 'Add a new NYCPS staff member to the system'
    : 'Update NYCPS staff member details'
});

// Export specific form configurations
export const nycpsStaffCreateFormConfig = createNYCPSStaffFormConfig('create');
export const nycpsStaffEditFormConfig = createNYCPSStaffFormConfig('edit');

// Legacy export
export const nycpsStaffFormConfig = nycpsStaffCreateFormConfig; 