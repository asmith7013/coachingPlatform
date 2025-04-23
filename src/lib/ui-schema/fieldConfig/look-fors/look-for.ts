import { Field } from "@/lib/ui-schema/types";
import { LookForInput } from "@/lib/zod-schema";
import { RubricZodSchema } from "../../../zod-schema";

export const LookForFieldConfig: Field<LookForInput>[] = [
  {
    key: "lookForIndex",
    label: "Look For Index",
    type: "text",
    inputType: "number",
    required: true,
    editable: true,
    placeholder: "Enter look for index"
  },
  {
    key: "schools",
    label: "Schools",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select associated schools"
  },
  {
    key: "teachers",
    label: "Teachers",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select associated teachers"
  },
  {
    key: "topic",
    label: "Topic",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the main topic"
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter a detailed description"
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter category"
  },
  {
    key: "status",
    label: "Status",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter status"
  },
  {
    key: "studentFacing",
    label: "Student Facing",
    type: "select",
    inputType: "radio",
    options: ["Yes", "No"],
    required: true,
    editable: true,
    placeholder: "Select if student facing"
  },
  {
    key: "rubric",
    label: "Rubric",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Attach a related rubric",
    schemaName: RubricZodSchema
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