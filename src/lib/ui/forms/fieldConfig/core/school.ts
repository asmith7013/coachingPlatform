import { Field } from "@/components/composed/forms/RigidResourceForm";
import { SchoolInput } from "@zod-schema/core/school";
import { GradeLevelsSupportedZod } from "@enums";

export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    key: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
    editable: true,
  },
  {
    key: 'district',
    label: 'District',
    type: 'text',
    required: true,
    editable: true,
  },
  {
    key: 'schoolName',
    label: 'School Name',
    type: 'text',
    required: true,
    editable: true,
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
    required: false,
    editable: true,
  },
  {
    key: 'emoji',
    label: 'Emoji',
    type: 'text',
    required: false,
    editable: true,
  },
  {
    key: 'gradeLevelsSupported',
    label: 'Grade Levels Supported',
    type: 'multi-select',
    options: GradeLevelsSupportedZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
    editable: true,
  },
  {
    key: 'owners',
    label: 'Owners',
    type: 'multi-select',
    options: [],
    required: true,
    editable: true,
  }
]; 