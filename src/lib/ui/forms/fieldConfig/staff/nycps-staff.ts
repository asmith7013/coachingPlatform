import type { Field } from '@ui-types/form';
import type { NYCPSStaffInput } from '@zod-schema/core/staff';

/**
 * Simple field configuration for NYCPS Staff forms
 * Following the new domain-specific pattern
 */
export const NYCPSStaffFieldConfig: Field<NYCPSStaffInput>[] = [
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
      { value: "Grade 8", label: "Grade 8" }
    ]
  },
  {
    name: "subjects",
    label: "Subjects Taught",
    type: "select",
    multiple: true,
    options: [
      { value: "Math 6", label: "Math 6" },
      { value: "Math 7", label: "Math 7" }, 
      { value: "Math 8", label: "Math 8" },
      { value: "Algebra I", label: "Algebra I" },
      { value: "Geometry", label: "Geometry" },
      { value: "Algebra II", label: "Algebra II" }
    ]
  },
  {
    name: "specialGroups",
    label: "Special Groups",
    type: "select",
    multiple: true,
    options: [
      { value: "SPED", label: "SPED" },
      { value: "ELL", label: "ELL" }
    ]
  },
  {
    name: "rolesNYCPS",
    label: "NYCPS Roles",
    type: "select",
    multiple: true,
    options: [
      { value: "Teacher", label: "Teacher" },
      { value: "Principal", label: "Principal" },
      { value: "AP", label: "Assistant Principal" },
      { value: "Coach", label: "Coach" },
      { value: "Administrator", label: "Administrator" }
    ]
  },
  {
    name: "pronunciation",
    label: "Name Pronunciation",
    type: "text",
    placeholder: "Phonetic pronunciation guide",
  }
]; 