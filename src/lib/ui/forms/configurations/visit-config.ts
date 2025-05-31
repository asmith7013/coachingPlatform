import type { FormConfiguration } from '@ui-types/form';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import { createModeAwareConfig, type FormMode } from './schema-aware-builders';

/**
 * Schema-aware Visit Form Configuration
 */
const visitConfigFactory = createModeAwareConfig(
  VisitInputZodSchema,
  (builder, _mode) => [
    builder.createDateField(
      'date', 
      'Visit Date', 
      true, 
      'Date of the school visit'
    ),
    builder.createReferenceField(
      'school', 
      'School', 
      '/api/reference/schools', 
      false, 
      true, 
      'School being visited'
    ),
    builder.createReferenceField(
      'coach', 
      'Coach', 
      '/api/reference/staff', 
      false, 
      true, 
      'Coach conducting the visit'
    ),
    builder.createEnumField(
      'gradeLevelsSupported', 
      'Grade Levels', 
      true, 
      'Grade levels involved in this visit'
    ),
    builder.createReferenceField(
      'owners', 
      'Owners', 
      '/api/reference/staff', 
      true, 
      true, 
      'Staff members responsible for this visit'
    )
  ]
);

// Export mode-specific configurations
export const VisitCreateFieldConfig = visitConfigFactory.create();
export const VisitEditFieldConfig = visitConfigFactory.edit();

// Legacy export
export const VisitFieldConfig = VisitCreateFieldConfig;

export const createVisitFormConfig = (mode: FormMode): FormConfiguration => ({
  fields: mode === 'create' ? VisitCreateFieldConfig : VisitEditFieldConfig,
  schema: VisitInputZodSchema,
  title: mode === 'create' ? 'Create Visit' : 'Edit Visit Information',
  description: mode === 'create' 
    ? 'Schedule a new school visit' 
    : 'Update visit details'
});

// Export specific form configurations
export const visitCreateFormConfig = createVisitFormConfig('create');
export const visitEditFormConfig = createVisitFormConfig('edit');

// Legacy export
export const visitFormConfig = visitCreateFormConfig; 