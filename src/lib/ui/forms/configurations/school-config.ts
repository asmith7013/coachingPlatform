import type { FormConfiguration } from '@ui-types/form';
import { SchoolInputZodSchema } from '@zod-schema/core/school';
// import type { SchoolInput } from '@domain-types/school';
import { createModeAwareConfig, type FormMode } from './schema-aware-builders';

/**
 * Schema-aware School Form Configuration
 * Type-safe field builders that validate against SchoolInputZodSchema
 */
const schoolConfigFactory = createModeAwareConfig(
  SchoolInputZodSchema,
  (builder, mode) => [
    builder.createTextField(
      'schoolNumber',
      'School Number',
      true,
      mode === 'create', // Only editable during creation
      'Official school identifier used by NYCPS'
    ),
    builder.createTextField(
      'district',
      'District',
      true,
      mode === 'create', // District shouldn't change after creation
      'The district this school belongs to'
    ),
    builder.createTextField(
      'schoolName',
      'School Name',
      true,
      true, // Always editable
      'Full, official name of the school'
    ),
    builder.createTextField(
      'address',
      'Address',
      false,
      true,
      'Physical address of the school'
    ),
    builder.createTextField(
      'emoji',
      'Emoji',
      false,
      true,
      'An emoji that represents this school (optional)'
    ),
    builder.createEnumField(
      'gradeLevelsSupported', // This will auto-generate options from GradeLevelsSupportedZod
      'Grade Levels Supported',
      true,
      'Select all grade levels this school supports'
    ),
    builder.createReferenceField(
      'ownerIds',
      'Owners',
      '/api/reference/staff',
      true, // multiple
      true,
      'Staff members responsible for managing this school'
    )
  ]
);

// Export mode-specific configurations
export const SchoolCreateFieldConfig = schoolConfigFactory.create();
export const SchoolEditFieldConfig = schoolConfigFactory.edit();

// Legacy export (defaults to create)
export const SchoolFieldConfig = SchoolCreateFieldConfig;

/**
 * Form configuration factory
 */
export const createSchoolFormConfig = (mode: FormMode): FormConfiguration => ({
  fields: mode === 'create' ? SchoolCreateFieldConfig : SchoolEditFieldConfig,
  schema: SchoolInputZodSchema,
  title: mode === 'create' ? 'Create School' : 'Edit School Information',
  description: mode === 'create' 
    ? 'Add a new school to the system'
    : 'Update school details and configuration'
});

// Export specific form configurations
export const schoolCreateFormConfig = createSchoolFormConfig('create');
export const schoolEditFormConfig = createSchoolFormConfig('edit');

// Legacy export
export const schoolFormConfig = schoolCreateFormConfig; 