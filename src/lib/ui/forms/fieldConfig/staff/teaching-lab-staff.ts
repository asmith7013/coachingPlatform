import { createFormFields } from '@/lib/ui/forms/tanstack/factory/field-factory';
import { TeachingLabStaffInputZodSchema } from '@zod-schema/core/staff';

/**
 * Schema-derived field configuration for Teaching Lab Staff forms
 * Uses createFormFields factory with TeachingLabStaffInputZodSchema
 * Follows established domain-organized configuration pattern
 */
export const teachingLabStaffFields = createFormFields(TeachingLabStaffInputZodSchema, {
  fieldOrder: ["staffName", "email", "adminLevel", "rolesTL", "schools", "owners", "assignedDistricts"],
  labels: {
    staffName: "Full Name",
    email: "Email Address",
    adminLevel: "Admin Level",
    rolesTL: "Teaching Lab Roles",
    schools: "Assigned Schools",
    owners: "Owners",
    assignedDistricts: "Assigned Districts"
  },
  placeholders: {
    staffName: "Enter full name",
    email: "Enter email address"
  },
  fieldTypes: {
    adminLevel: "select",
    rolesTL: "select",
    schools: "reference",
    owners: "reference",
    assignedDistricts: "reference"
  },
  urls: {
    schools: "/api/schools",
    owners: "/api/staff",
    assignedDistricts: "/api/districts"
  },
  options: {
    adminLevel: [
      { value: "Coach", label: "Coach" },
      { value: "Manager", label: "Manager" },
      { value: "Admin", label: "Admin" }
    ],
    rolesTL: [
      { value: "Math Specialist", label: "Math Specialist" },
      { value: "ELA Specialist", label: "ELA Specialist" },
      { value: "Coach", label: "Coach" },
      { value: "Manager", label: "Manager" }
    ]
  }
});

// Legacy export for backward compatibility during migration
export const TeachingLabStaffFieldConfig = teachingLabStaffFields; 