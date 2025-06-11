import { createFormFields } from '@tanstack-form/factory/field-factory';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';

/**
 * Schema-derived field configuration for Visit forms
 * Used primarily in Monday.com integration workflows
 * Follows established domain-organized configuration pattern
 */
export const visitFields = createFormFields(VisitInputZodSchema, {
  fieldOrder: ["school", "coach", "owners", "date", "mode", "status"],
  labels: {
    school: "School",
    coach: "Coach",
    owners: "Owners", 
    date: "Visit Date",
    mode: "Mode",
    status: "Status"
  },
  fieldTypes: {
    school: "reference",
    coach: "reference",
    owners: "reference",
    date: "date",
    mode: "select",
    status: "select"
  },
  urls: {
    school: "/api/schools",
    coach: "/api/staff",
    owners: "/api/staff"
  },
  options: {
    mode: [
      { value: "Virtual", label: "Virtual" },
      { value: "In-person", label: "In-person" },
      { value: "Hybrid", label: "Hybrid" }
    ],
    status: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" }
    ]
  }
});

// Legacy export for backward compatibility during migration
export const VisitFieldConfig = visitFields; 