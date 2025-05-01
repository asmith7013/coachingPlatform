import { Field } from "@/components/composed/forms/RigidResourceForm";
import { Note } from "@zod-schema/shared/notes";
import { NoteTypeZod } from "@enums";

export const NoteFieldConfig: Field<Note>[] = [
  {
    key: "date",
    label: "Date",
    type: "text",
    required: true,
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: NoteTypeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "heading",
    label: "Heading",
    type: "text",
    required: true,
  },
  {
    key: "subheading",
    label: "Subheadings",
    type: "select",
    options: [], // This should be populated with available subheadings
    defaultValue: [],
    required: true,
  }
]; 