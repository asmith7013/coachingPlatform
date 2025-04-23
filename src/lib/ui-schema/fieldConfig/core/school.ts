import { Field } from '@/components/composed/forms/ResourceForm';
import { SchoolInput } from '@/lib/zod-schema';
import { GradeLevelsSupportedZod } from '@/lib/zod-schema/shared/enums';

export const SchoolFieldConfig: Field<SchoolInput>[] = [
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
  },
  {
    name: 'emoji',
    label: 'Emoji',
    type: 'text',
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
    name: 'owners',
    label: 'Owners',
    type: 'reference',
    url: '/api/reference/staff',
    multiple: true,
    required: true,
  },
]; 