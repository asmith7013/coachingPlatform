import { GradeLevelsSupportedOptions } from '@/lib/zod-schema/shared/enums';

export const SchoolFieldConfig = [
  {
    name: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
  },
  {
    name: 'district',
    label: 'District',
    type: 'text',
    required: true,
  },
  {
    name: 'schoolName',
    label: 'School Name',
    type: 'text',
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    required: false,
  },
  {
    name: 'emoji',
    label: 'Emoji',
    type: 'text',
    required: false,
  },
  {
    name: 'gradeLevelsSupported',
    label: 'Grade Levels Supported',
    type: 'select',
    options: GradeLevelsSupportedOptions.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
    required: true,
  },
  {
    name: 'staffList',
    label: 'Staff List',
    type: 'select',
    options: [],
    defaultValue: [],
    required: false,
  },
  {
    name: 'schedules',
    label: 'Schedules',
    type: 'select',
    options: [],
    defaultValue: [],
    required: false,
  },
  {
    name: 'cycles',
    label: 'Cycles',
    type: 'select',
    options: [],
    defaultValue: [],
    required: false,
  },
  {
    name: 'owners',
    label: 'Owners',
    type: 'select',
    options: [],
    defaultValue: [],
    required: true,
  },
]; 