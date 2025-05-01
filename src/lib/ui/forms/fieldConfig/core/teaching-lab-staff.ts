import { Field } from '@/components/composed/forms/RigidResourceForm';
import { TeachingLabStaffInput } from '@zod-schema/core/staff';
import { AdminLevelZod, RolesTLZod } from '@enums';

export const TeachingLabStaffFieldConfig: Field<TeachingLabStaffInput>[] = [
  {
    key: 'staffName',
    label: 'Staff Name',
    type: 'text',
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
  },
  {
    key: 'adminLevel',
    label: 'Admin Level',
    type: 'select',
    options: AdminLevelZod.options.map((value: string) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: 'rolesTL',
    label: 'Roles',
    type: 'select',
    options: RolesTLZod.options.map((value: string) => ({
      value,
      label: value,
    })),
    multiple: true,
    defaultValue: [],
  },
  {
    key: 'schools',
    label: 'Schools',
    type: 'reference',
    url: '/api/reference/schools',
    multiple: true,
    required: true,
    helpText: 'Select at least one school',
    defaultValue: [],
  },
  {
    key: 'assignedDistricts',
    label: 'Assigned Districts',
    type: 'reference',
    url: '/api/reference/districts',
    multiple: true,
    required: true,
    helpText: 'Select at least one district',
    defaultValue: [],
  },
  {
    key: 'owners',
    label: 'Owners',
    type: 'reference',
    url: '/api/reference/staff',
    multiple: true,
    required: true,
    helpText: 'Select at least one owner',
    defaultValue: [],
  },
]; 