import { FieldOverrideMap } from '@ui-types/form';
import { NYCPSStaffInput } from '@zod-schema/core/staff';

export const NYCPSStaffOverrides: FieldOverrideMap<NYCPSStaffInput> = {
  schools: {
    type: 'reference',
    label: 'Schools',
    url: '/api/schools',
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/staff',
  },
  // Add other overrides as needed
}; 