import { type SchoolInput } from "@zod-schema/core/school";
import type { Field } from "@ui-types/form";

/**
 * Simple field configuration for School forms
 * Following the new domain-specific pattern
 */
export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: "schoolNumber",
    label: "School Number",
    type: "text",
    placeholder: "Enter school number",
  },
  {
    name: "district",
    label: "District",
    type: "text",
    placeholder: "Enter district name",
  },
  {
    name: "schoolName",
    label: "School Name",
    type: "text",
    placeholder: "Enter school name",
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "Enter full address (optional)",
  },
  {
    name: "emoji",
    label: "Emoji",
    type: "text",
    placeholder: "Choose an emoji (optional)",
  },
  {
    name: "gradeLevelsSupported",
    label: "Grade Levels Supported",
    type: "select",
    multiple: true,
    options: [
      { value: "Kindergarten", label: "Kindergarten" },
      { value: "Grade 1", label: "Grade 1" },
      { value: "Grade 2", label: "Grade 2" },
      { value: "Grade 3", label: "Grade 3" },
      { value: "Grade 4", label: "Grade 4" },
      { value: "Grade 5", label: "Grade 5" },
      { value: "Grade 6", label: "Grade 6" },
      { value: "Grade 7", label: "Grade 7" },
      { value: "Grade 8", label: "Grade 8" },
      { value: "Grade 9", label: "Grade 9" },
      { value: "Grade 10", label: "Grade 10" },
      { value: "Grade 11", label: "Grade 11" },
      { value: "Grade 12", label: "Grade 12" },
    ],
  },
];
