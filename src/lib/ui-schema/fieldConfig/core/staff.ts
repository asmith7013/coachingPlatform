import { Field } from '@/components/features/shared/form/GenericAddForm';
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
  },
  {
    name: 'schools',
    label: 'Schools',
    type: 'select',
    options: [], // This should be populated with available schools
    defaultValue: [],
  },
  {
    name: 'owners',
    label: 'Owners',
    type: 'select',
    options: [], // This should be populated with available owners
    defaultValue: [],
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