import type { Field } from "@ui-types/form";
import type { StaffInput } from "@zod-schema/core/staff";

/**
 * Field configuration for admin-level staff fields
 * (adminLevel, assignedDistricts)
 */
export const AdminStaffFieldConfig: Field<StaffInput>[] = [
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
      { value: "CPM", label: "CPM" },
      { value: "Director", label: "Director" },
      { value: "Senior Director", label: "Senior Director" },
    ],
  },
  {
    name: "roles",
    label: "Roles",
    type: "select",
    multiple: true,
    options: [
      { value: "Coach", label: "Coach" },
      { value: "CPM", label: "CPM" },
      { value: "Director", label: "Director" },
      { value: "Senior Director", label: "Senior Director" },
    ],
  },
  {
    name: "schoolIds",
    label: "Assigned Schools",
    type: "reference",
    url: "/api/schools",
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

/** @deprecated Use AdminStaffFieldConfig */
export const TeachingLabStaffFieldConfig = AdminStaffFieldConfig;
