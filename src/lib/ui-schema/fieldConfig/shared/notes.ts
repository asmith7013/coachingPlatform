import { Field } from "@/lib/ui-schema/types";
import { Note } from "@/lib/zod-schema";
import { NoteTypeValues } from "../../fieldValues";

export const NoteFieldConfig: Field<Note>[] = [
  {
    key: "date",
    label: "Date",
    inputType: "date",
    required: true,
    editable: true,
    placeholder: "Select note date"
  },
  {
    key: "type",
    label: "Type",
    inputType: "select",
    options: NoteTypeValues,
    required: true,
    editable: true,
    placeholder: "Select note type"
  },
  {
    key: "heading",
    label: "Heading",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter note heading"
  },
  {
    key: "subheading",
    label: "Subheadings",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Enter subheadings"
  }
]; 