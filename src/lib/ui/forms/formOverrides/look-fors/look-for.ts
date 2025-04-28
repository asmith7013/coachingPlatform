import { LookForInput } from '@zod-schema/look-fors/look-for';
import { FieldOverrideMap } from '@ui-types/forms';

export const LookForOverrides: FieldOverrideMap<LookForInput> = {
  lookForIndex: {
    type: 'text',
    label: 'Identifier',
    helpText: 'Unique identifier for this Look For item',
    required: true,
  },
  topic: {
    type: 'text',
    label: 'Topic',
    helpText: 'The main topic this Look For addresses',
    required: true,
  },
  description: {
    type: 'text',
    label: 'Description',
    helpText: 'Detailed description of what to look for during observation',
    required: true,
  },
  category: {
    type: 'select',
    label: 'Category',
    helpText: 'The category this Look For belongs to',
    required: true,
  },
  studentFacing: {
    type: 'checkbox',
    label: 'Student Facing',
    helpText: 'Check if this Look For is visible to students',
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/staff',
    multiple: true,
    helpText: 'Staff members responsible for this Look For',
    required: true,
  },
};
