import { Field } from '@/components/composed/forms/ResourceForm';
import { NYCPSStaffInput } from '@/lib/zod-schema';
import { GradeLevelsSupportedZod, SubjectsZod, SpecialGroupsZod, RolesNYCPSZod } from '@/lib/zod-schema/shared/enums';

export const NYCPSStaffFieldConfig: Field<NYCPSStaffInput>[] = [
  {
    name: 'staffName',
    label: 'Staff Name',
    type: 'text',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    editable: false,
  },
  {
    name: 'schools',
    label: 'Schools',
    type: 'reference',
    url: '/api/reference/schools',
    multiple: true,
    required: true,
  },
  {
    name: 'owners',
    label: 'Owners',
    type: 'reference',
    url: '/api/reference/staff',
    multiple: true,
    required: true,
  },
  {
    name: 'gradeLevelsSupported',
    label: 'Grade Levels Supported',
    type: 'select',
    options: GradeLevelsSupportedZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    name: 'subjects',
    label: 'Subjects',
    type: 'select',
    options: SubjectsZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    name: 'specialGroups',
    label: 'Special Groups',
    type: 'select',
    options: SpecialGroupsZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    name: 'rolesNYCPS',
    label: 'NYCPS Roles',
    type: 'select',
    options: RolesNYCPSZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
  },
  {
    name: 'pronunciation',
    label: 'Pronunciation',
    type: 'text',
  },
]; 