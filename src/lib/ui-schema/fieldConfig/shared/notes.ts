import { Field } from "@/components/composed/forms/ResourceForm";
import { Note } from "@/lib/zod-schema";
import { NoteTypeZod } from "@/lib/zod-schema/shared/enums";

export const NoteFieldConfig: Field<Note>[] = [
  {
    name: "date",
    label: "Date",
    type: "text",
    required: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: NoteTypeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "heading",
    label: "Heading",
    type: "text",
    required: true,
  },
  {
    name: "subheading",
    label: "Subheadings",
    type: "select",
    options: [], // This should be populated with available subheadings
    defaultValue: [],
    required: true,
  }
]; 