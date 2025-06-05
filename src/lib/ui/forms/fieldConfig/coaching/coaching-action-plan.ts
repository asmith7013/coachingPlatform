import type { Field } from "@zod-schema/core-types/form";

/**
 * Basic field configuration for Coaching Action Plan forms
 * Following the established pattern from school field configs
 */
export const CoachingActionPlanFieldConfig: Field[] = [
  {
    key: "title",
    label: "Plan Title",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter a descriptive title for this coaching action plan"
  },
  {
    key: "academicYear",
    label: "Academic Year",
    type: "text",
    required: true,
    editable: true,
    placeholder: "e.g., 2024-2025"
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "date",
    required: true,
    editable: true,
    placeholder: "When the coaching plan begins"
  },
  {
    key: "endDate",
    label: "End Date",
    type: "date",
    required: false,
    editable: true,
    placeholder: "When the coaching plan ends (optional)"
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft", disabled: false },
      { value: "active", label: "Active", disabled: false },
      { value: "completed", label: "Completed", disabled: false },
      { value: "archived", label: "Archived", disabled: false }
    ],
    required: false,
    editable: true,
    placeholder: "Select plan status"
  }
];

/**
 * Simplified field configuration for quick creation
 */
export const QuickCreateFieldConfig: Field[] = [
  {
    key: "title",
    label: "Plan Title",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter a descriptive title for this coaching action plan"
  },
  {
    key: "academicYear",
    label: "Academic Year",
    type: "text",
    required: true,
    editable: true,
    placeholder: "e.g., 2024-2025"
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "date",
    required: true,
    editable: true,
    placeholder: "When the coaching plan begins"
  }
]; 