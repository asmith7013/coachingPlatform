import { Field } from "@ui-types/forms";
import { NextStepInput } from "@zod-schema/look-fors/next-step";

export const NextStepFieldConfig: Field<NextStepInput>[] = [
  {
    key: "description",
    label: "Description",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter description of the next step"
  },
  {
    key: "lookFor",
    label: "Look For",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter LookFor reference ID"
  },
  {
    key: "teacher",
    label: "Teacher",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter Teacher reference ID"
  },
  {
    key: "school",
    label: "School",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter School reference ID"
  },
  {
    key: "owners",
    label: "Owners",
    type: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select owners"
  }
]; 