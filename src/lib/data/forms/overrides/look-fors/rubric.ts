import { FieldOverrideMap } from '@/lib/data/forms/types';

// Placeholder for RubricInput type - to be properly imported once created
type RubricInput = {
  title: string;
  description: string;
  criteria: unknown;
  scorePoints: unknown;
  owners: string[];
};

export const RubricOverrides: FieldOverrideMap<RubricInput> = {
  title: {
    type: 'text',
    label: 'Rubric Title',
    helpText: 'Descriptive title for this rubric',
    required: true,
  },
  description: {
    type: 'text',
    label: 'Description',
    helpText: 'Detailed description of this rubric and how it should be applied',
    required: true,
  },
  criteria: {
    type: 'multi-select',
    label: 'Criteria',
    helpText: 'The evaluation criteria for this rubric',
    multiple: true,
    required: true,
  },
  scorePoints: {
    type: 'multi-select',
    label: 'Score Points',
    helpText: 'The possible score points for this rubric',
    multiple: true,
    required: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/staff',
    helpText: 'Staff members responsible for this rubric',
    multiple: true,
    required: true,
  },
};
