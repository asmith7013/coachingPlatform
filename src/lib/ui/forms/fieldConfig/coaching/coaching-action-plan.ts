import { createFormFields, createSimpleFields } from "@lib/ui/forms/tanstack/factory/field-factory";
import { CoachingActionPlanInputZodSchema } from "@zod-schema/core/cap";

/**
 * Schema-derived field configuration for Coaching Action Plan forms
 * Uses createFormFields factory with CoachingActionPlanZodSchema
 * Follows createCrudHooks factory pattern for consistency
 */
export const CoachingActionPlanFields = createFormFields(
  CoachingActionPlanInputZodSchema,
  {
    fieldOrder: ["title", "teachers", "coaches", "school", "academicYear", "startDate", "endDate", "status"],
    labels: {
      title: "Plan Title",
      teachers: "Teachers",
      coaches: "Coaches", 
      school: "School",
      academicYear: "Academic Year",
      startDate: "Start Date",
      endDate: "End Date",
      status: "Status"
    },
    placeholders: {
      title: "Enter a descriptive title for this coaching action plan",
      academicYear: "e.g., 2024-2025",
      startDate: "When the coaching plan begins",
      endDate: "When the coaching plan ends (optional)"
    },
    fieldTypes: {
      teachers: "reference",
      coaches: "reference", 
      school: "reference",
      startDate: "date",
      endDate: "date",
      status: "select"
    },
    urls: {
      teachers: "/api/staff?role=teacher",
      coaches: "/api/staff?role=coach",
      school: "/api/schools"
    },
    options: {
      status: [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "archived", label: "Archived" }
      ]
    }
  }
);

/**
 * Quick creation field configuration
 * Essential fields only - following YAGNI principle
 * Uses schema-derived approach for consistency
 */
export const QuickCreateFields = createSimpleFields(
  CoachingActionPlanInputZodSchema,
  ["title", "academicYear", "startDate"],
  {
    title: "Plan Title",
    academicYear: "Academic Year",
    startDate: "Start Date"
  }
);

// Legacy exports for backward compatibility during migration
export const CoachingActionPlanFieldConfig = CoachingActionPlanFields;
export const QuickCreateFieldConfig = QuickCreateFields; 