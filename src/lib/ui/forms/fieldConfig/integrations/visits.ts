import type { Field } from "@ui-types/form";
import type { VisitInput } from "@zod-schema/visits/visit";

/**
 * Simple field configuration for Visit forms
 * Used primarily in Monday.com integration workflows
 * Following the new domain-specific pattern
 */
export const VisitFieldConfig: Field<VisitInput>[] = [
  {
    name: "school",
    label: "School",
    type: "reference",
    url: "/api/schools",
  },
  {
    name: "coach",
    label: "Coach",
    type: "reference",
    url: "/api/staff",
  },
  {
    name: "owners",
    label: "Owners",
    type: "reference",
    url: "/api/staff",
    multiple: true,
  },
  {
    name: "date",
    label: "Visit Date",
    type: "date",
  },
  {
    name: "mode",
    label: "Mode",
    type: "select",
    options: [
      { value: "Virtual", label: "Virtual" },
      { value: "In-person", label: "In-person" },
      { value: "Hybrid", label: "Hybrid" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

// Alias for backward compatibility
export const visitFields = VisitFieldConfig;
