import { Field } from "@/lib/ui-schema/types";
import { Note } from "@/lib/zod-schema";
import { NoteTypeValues } from "../../fieldValues";

export const NoteFieldConfig: Field<Note>[] = [
  {
    key: "date",
    label: "Date",
    type: "text",
    inputType: "date",
    required: true,
    editable: true,
    placeholder: "Select note date"
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    inputType: "select",
    options: NoteTypeValues,
    required: true,
    editable: true,
    placeholder: "Select note type"
  },
  {
    key: "heading",
    label: "Heading",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter note heading"
  },
  {
    key: "subheading",
    label: "Subheadings",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Enter subheadings"
  }
]; 