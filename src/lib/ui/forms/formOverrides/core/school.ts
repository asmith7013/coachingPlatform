import { SchoolInput } from '@zod-schema/core/school';
import { FieldOverrideMap } from '@ui-forms/types';

export const SchoolOverrides: FieldOverrideMap<SchoolInput> = {
  schoolNumber: {
    type: 'text',
    label: 'School Number',
    helpText: 'The official school number used by NYCPS',
    required: true,
  },
  district: {
    type: 'text',
    label: 'District',
    helpText: 'The district this school belongs to',
    required: true,
  },
  schoolName: {
    type: 'text',
    label: 'School Name',
    helpText: 'The full, official name of the school',
    required: true,
  },
  address: {
    type: 'text',
    label: 'Address',
    helpText: 'Physical address of the school',
  },
  emoji: {
    type: 'text',
    label: 'Emoji',
    helpText: 'An emoji that represents this school (optional)',
  },
  gradeLevelsSupported: {
    type: 'multi-select',
    label: 'Grade Levels',
    helpText: 'Select all grade levels this school supports',
    multiple: true,
    required: true,
  },
  staffList: {
    type: 'reference',
    label: 'Staff Members',
    url: '/api/reference/staff',
    helpText: 'Staff members associated with this school',
    multiple: true,
  },
  schedules: {
    type: 'reference',
    label: 'Schedules',
    url: '/api/reference/schedules',
    helpText: 'Class schedules for this school',
    multiple: true,
  },
  cycles: {
    type: 'reference',
    label: 'Cycles',
    url: '/api/reference/cycles',
    helpText: 'Implementation cycles related to this school',
    multiple: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/reference/staff',
    helpText: 'Staff members responsible for managing this school',
    multiple: true,
    required: true,
  },
};
