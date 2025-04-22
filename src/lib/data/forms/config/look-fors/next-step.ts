import { Field } from "@/lib/data/forms/types";
import { NextStepInput } from "@/lib/data/schemas";

export const NextStepFieldConfig: Field<NextStepInput>[] = [
  {
    key: "description",
    label: "Description",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter description of the next step"
  },
  {
    key: "lookFor",
    label: "Look For",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter LookFor reference ID"
  },
  {
    key: "teacher",
    label: "Teacher",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter Teacher reference ID"
  },
  {
    key: "school",
    label: "School",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter School reference ID"
  },
  {
    key: "owners",
    label: "Owners",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select owners"
  }
]; 