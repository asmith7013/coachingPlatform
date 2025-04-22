import { Field } from "@/lib/ui-schema/types";
import { Rubric } from "@/lib/zod-schema";

export const RubricFieldConfig: Field<Rubric>[] = [
  {
    key: "score",
    label: "Score",
    type: "text",
    inputType: "number",
    required: true,
    editable: true,
    placeholder: "Enter the rubric score"
  },
  {
    key: "category",
    label: "Category",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Enter rubric categories (comma-separated)"
  },
  {
    key: "content",
    label: "Content",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Add rubric content"
  },
  {
    key: "parentId",
    label: "Parent ID",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the parent rubric ID"
  },
  {
    key: "collectionId",
    label: "Collection ID",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the rubric collection ID"
  },
  {
    key: "hex",
    label: "Color",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the hexadecimal color code"
  }
]; 