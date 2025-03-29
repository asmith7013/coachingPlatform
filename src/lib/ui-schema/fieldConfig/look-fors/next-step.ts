import { Field } from "@/lib/ui-schema/types";
import { NextStepInput } from "@/lib/zod-schema";

export const NextStepFieldConfig: Field<NextStepInput>[] = [
  {
    key: "description",
    label: "Description",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter description of the next step"
  },
  {
    key: "lookFor",
    label: "Look For",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter LookFor reference ID"
  },
  {
    key: "teacher",
    label: "Teacher",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter Teacher reference ID"
  },
  {
    key: "school",
    label: "School",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter School reference ID"
  },
  {
    key: "owners",
    label: "Owners",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select owners"
  }
]; 