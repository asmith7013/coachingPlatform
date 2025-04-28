import { Field } from '@components/composed/forms/ResourceForm';
import { NYCPSStaffInput } from '@zod-schema/core/staff';
import { GradeLevelsSupportedZod, SubjectsZod, SpecialGroupsZod, RolesNYCPSZod } from '@data-schema/enum';

export const NYCPSStaffFieldConfig: Field<NYCPSStaffInput>[] = [
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
    editable: false,
  },
  {
    key: 'schools',
    label: 'Schools',
    type: 'reference',
    url: '/api/reference/schools',
    multiple: true,
    required: true,
  },
  {
    key: 'owners',
    label: 'Owners',
    type: 'reference',
    url: '/api/reference/staff',
    multiple: true,
    required: true,
  },
  {
    key: 'gradeLevelsSupported',
    label: 'Grade Levels Supported',
    type: 'select',
    options: GradeLevelsSupportedZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    key: 'subjects',
    label: 'Subjects',
    type: 'select',
    options: SubjectsZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    key: 'specialGroups',
    label: 'Special Groups',
    type: 'select',
    options: SpecialGroupsZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    key: 'rolesNYCPS',
    label: 'NYCPS Roles',
    type: 'select',
    options: RolesNYCPSZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    key: 'pronunciation',
    label: 'Pronunciation',
    type: 'text',
  },
]; 