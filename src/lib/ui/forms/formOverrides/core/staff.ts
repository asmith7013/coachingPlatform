// import { NYCPSStaffInput } from '@zod-schema/core/staff';
import { FieldOverrideMap } from '@ui-types/form';

export const NYCPSStaffOverrides: FieldOverrideMap = {
  email: {
    helpText: 'This email is synced with your NYCPS account and cannot be edited.',
    disabled: true,
  },
  schools: {
    type: 'reference',
    label: 'Schools',
    url: '/api/reference/schools',
    helpText: 'Select all schools this staff member is associated with.',
    required: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/reference/staff',
    helpText: 'Choose at least one coaching owner for this staff member.',
    required: true,
  },
  gradeLevelsSupported: {
    type: 'multi-select',
    label: 'Grade Levels',
    helpText: 'Select all grade levels this staff member supports.',
  },
  subjects: {
    type: 'multi-select',
    label: 'Subjects',
    helpText: 'Select all subjects this staff member teaches or supports.',
  },
};
