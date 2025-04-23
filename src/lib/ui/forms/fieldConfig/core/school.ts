import { Field } from "@/lib/ui/forms/types";
import { SchoolInput } from '@zod-schema/core/school';
import { GradeLevelsSupportedZod } from '@zod-schema/shared/enums';

export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    key: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    inputType: 'text',
    required: true,
    editable: true,
    placeholder: 'Enter school number'
  },
  {
    key: 'district',
    label: 'District',
    type: 'text',
    inputType: 'text',
    required: true,
    editable: true,
    placeholder: 'Enter district'
  },
  {
    key: 'schoolName',
    label: 'School Name',
    type: 'text',
    inputType: 'text',
    required: true,
    editable: true,
    placeholder: 'Enter school name'
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
    inputType: 'text',
    required: false,
    editable: true,
    placeholder: 'Enter address'
  },
  {
    key: 'emoji',
    label: 'Emoji',
    type: 'text',
    inputType: 'text',
    required: false,
    editable: true,
    placeholder: 'Choose an emoji'
  },
  {
    key: 'gradeLevelsSupported',
    label: 'Grade Levels Supported',
    type: 'multi-select',
    inputType: 'multi-select',
    options: GradeLevelsSupportedZod.options,
    required: true,
    editable: true,
    placeholder: 'Select grade levels'
  },
  {
    key: 'owners',
    label: 'Owners',
    type: 'multi-select',
    inputType: 'multi-select',
    options: [],
    required: true,
    editable: true,
    placeholder: 'Select owners'
  }
]; 