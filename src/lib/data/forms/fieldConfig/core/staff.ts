import { 
  GradeLevelsSupportedOptions, 
  SubjectsOptions, 
  SpecialGroupsOptions, 
  RolesNYCPSOptions 
} from '@/lib/zod-schema/shared/enums';

export const NYCPSStaffFieldConfig = [
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
    required: false,
  },
  {
    name: 'schools',
    label: 'Schools',
    type: 'select',
    options: [],
    defaultValue: [],
    required: true,
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
    name: 'subjects',
    label: 'Subjects',
    type: 'select',
    options: SubjectsOptions.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
    required: true,
  },
  {
    name: 'specialGroups',
    label: 'Special Groups',
    type: 'select',
    options: SpecialGroupsOptions.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
    required: true,
  },
  {
    name: 'rolesNYCPS',
    label: 'NYCPS Roles',
    type: 'select',
    options: RolesNYCPSOptions.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
    required: false,
  },
  {
    name: 'pronunciation',
    label: 'Pronunciation',
    type: 'text',
    required: false,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'select',
    options: [],
    defaultValue: [],
    required: false,
  },
  {
    name: 'experience',
    label: 'Experience',
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