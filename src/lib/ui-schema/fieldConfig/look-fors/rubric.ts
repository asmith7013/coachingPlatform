import { Field } from "@/lib/ui-schema/types";
import { Rubric } from "@/lib/zod-schema";

export const RubricFieldConfig: Field<Rubric>[] = [
  {
    key: "score",
    label: "Score",
    inputType: "number",
    required: true,
    editable: true,
    placeholder: "Enter the rubric score"
  },
  {
    key: "category",
    label: "Category",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Enter rubric categories (comma-separated)"
  },
  {
    key: "content",
    label: "Content",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Add rubric content"
  },
  {
    key: "parentId",
    label: "Parent ID",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the parent rubric ID"
  },
  {
    key: "collectionId",
    label: "Collection ID",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the rubric collection ID"
  },
  {
    key: "hex",
    label: "Color",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the hexadecimal color code"
  }
]; 