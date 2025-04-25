import { Field } from "@/lib/ui/forms/types";
import { Rubric } from "@/lib/data-schema/zod-schema/look-fors/rubric";

export const RubricFieldConfig: Field<Rubric>[] = [
  {
    key: "category",
    label: "Category",
    type: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select category"
  },
  {
    key: "score",
    label: "Score",
    type: "select",
    options: [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" }
    ],
    required: true,
    editable: true,
    placeholder: "Select score"
  },
  {
    key: "content",
    label: "Content",
    type: "multi-select",
    options: [],
    required: false,
    editable: true,
    placeholder: "Select content"
  },
  {
    key: "hex",
    label: "Hex Color",
    type: "text",
    required: false,
    editable: true,
    placeholder: "Enter hex color (e.g. #FF5733)"
  }
]; 