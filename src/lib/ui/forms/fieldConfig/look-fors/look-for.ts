import { Field } from "@ui-types/form";
import { LookForInput } from "@domain-types/look-fors";

export const LookForFieldConfig: Field<LookForInput>[] = [
  {
    key: "lookForIndex",
    label: "Look For Index",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter look for index"
  },
  {
    key: "schools",
    label: "Schools",
    type: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select associated schools"
  },
  {
    key: "teachers",
    label: "Teachers",
    type: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select associated teachers"
  },
  {
    key: "topic",
    label: "Topic",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter the main topic"
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter a detailed description"
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    required: false,
    editable: true,
    placeholder: "Enter category"
  },
  {
    key: "status",
    label: "Status",
    type: "text",
    required: false,
    editable: true,
    placeholder: "Enter status"
  },
  {
    key: "studentFacing",
    label: "Student Facing",
    type: "select",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" }
    ],
    required: true,
    editable: true,
    placeholder: "Select if student facing"
  },
  {
    key: "rubric",
    label: "Rubric",
    type: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Attach a related rubric"
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