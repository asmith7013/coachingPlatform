import type { Field } from "@ui-types/form";
import type { CoachingActionPlanInput } from "@zod-schema/cap";

/**
 * Simple field configuration for Coaching Action Plan forms
 * Following the new domain-specific pattern
 */
export const CoachingActionPlanFieldConfig: Field<CoachingActionPlanInput>[] = [
  {
    name: "title",
    label: "Plan Title",
    type: "text",
    placeholder: "Enter a descriptive title for this coaching action plan",
  },
  {
    name: "teachers",
    label: "Teachers",
    type: "reference",
    url: "/api/staff?role=teacher",
    multiple: true,
  },
  {
    name: "coaches",
    label: "Coaches",
    type: "reference",
    url: "/api/staff?role=coach",
    multiple: true,
  },
  {
    name: "school",
    label: "School",
    type: "reference",
    url: "/api/schools",
  },
  {
    name: "academicYear",
    label: "Academic Year",
    type: "text",
    placeholder: "e.g., 2024-2025",
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    placeholder: "When the coaching plan begins",
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date",
    placeholder: "When the coaching plan ends (optional)",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "active", label: "Active" },
      { value: "completed", label: "Completed" },
      { value: "archived", label: "Archived" },
    ],
  },
];

/**
 * Quick creation field configuration
 * Essential fields only - following YAGNI principle
 */
export const QuickCreateFieldConfig: Field<CoachingActionPlanInput>[] = [
  {
    name: "title",
    label: "Plan Title",
    type: "text",
    placeholder: "Enter a descriptive title for this coaching action plan",
  },
  {
    name: "academicYear",
    label: "Academic Year",
    type: "text",
    placeholder: "e.g., 2024-2025",
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    placeholder: "When the coaching plan begins",
  },
];

// Alias for backward compatibility
export const CoachingActionPlanFields = CoachingActionPlanFieldConfig;
export const QuickCreateFields = QuickCreateFieldConfig;
