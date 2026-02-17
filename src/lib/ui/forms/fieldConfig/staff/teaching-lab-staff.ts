import type { Field } from "@ui-types/form";
import type { TeachingLabStaffInput } from "@zod-schema/core/staff";

/**
 * Simple field configuration for Teaching Lab Staff forms
 * Following the new domain-specific pattern
 */
export const TeachingLabStaffFieldConfig: Field<TeachingLabStaffInput>[] = [
  {
    name: "staffName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter email address",
  },
  {
    name: "adminLevel",
    label: "Admin Level",
    type: "select",
    options: [
      { value: "Coach", label: "Coach" },
      { value: "Manager", label: "Manager" },
      { value: "Admin", label: "Admin" },
    ],
  },
  {
    name: "rolesTL",
    label: "Teaching Lab Roles",
    type: "select",
    multiple: true,
    options: [
      { value: "Math Specialist", label: "Math Specialist" },
      { value: "ELA Specialist", label: "ELA Specialist" },
      { value: "Coach", label: "Coach" },
      { value: "Manager", label: "Manager" },
    ],
  },
  {
    name: "schools",
    label: "Assigned Schools",
    type: "reference",
    url: "/api/schools",
    multiple: true,
  },
  {
    name: "owners",
    label: "Owners",
    type: "reference",
    url: "/api/staff",
    multiple: true,
  },
  {
    name: "assignedDistricts",
    label: "Assigned Districts",
    type: "reference",
    url: "/api/districts",
    multiple: true,
  },
];
