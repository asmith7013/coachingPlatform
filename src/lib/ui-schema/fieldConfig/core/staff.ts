import { 
  GradeLevelsSupportedValues,
  SubjectsValues,
  SpecialGroupsValues,
  RolesNYCPSValues,
  RolesTLValues,
  AdminLevelValues
} from "../../fieldValues";
import { Field } from "@/lib/ui-schema/types";
import { NYCPSStaffInput } from "@/lib/zod-schema";

const StaffFieldConfig = {
  _id: {
    inputType: "text",
    options: null,
    required: false,
    editable: false,
    placeholder: "Auto-generated ID"
  },
  id: {
    inputType: "text",
    options: null,
    required: true,
    editable: true,
    placeholder: "Enter staff member ID"
  },
  staffName: {
    inputType: "text",
    options: null,
    required: true,
    editable: true,
    placeholder: "Enter staff member's full name"
  },
  email: {
    inputType: "email",
    options: null,
    required: true,
    editable: true,
    placeholder: "Enter staff member's email address"
  },
  schools: {
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select associated schools"
  },
  experience: {
    inputType: "array",
    options: "Experience",
    required: true,
    editable: true,
    placeholder: "List teaching/coaching experiences"
  },
  notes: {
    inputType: "array",
    options: "Note",
    required: true,
    editable: true,
    placeholder: "Add relevant staff notes"
  },
  owners: {
    inputType: "array",
    options: [],
    required: true,
    editable: false,
  },
  createdAt: {
    inputType: "date",
    options: null,
    required: false,
    editable: false,
    placeholder: "Auto-generated creation date"
  },
  updatedAt: {
    inputType: "date",
    options: null,
    required: false,
    editable: false,
    placeholder: "Auto-generated last update date"
  }
};

export default StaffFieldConfig;

export const NYCPSStaffFieldConfig: Field<NYCPSStaffInput>[] = [
  {
    key: "staffName",
    label: "Staff Name",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter staff name"
  },
  {
    key: "email",
    label: "Email",
    inputType: "email",
    required: true,
    editable: true,
    placeholder: "Enter email address"
  },
  {
    key: "gradeLevelsSupported",
    label: "Grade Levels",
    inputType: "multi-select",
    options: GradeLevelsSupportedValues,
    required: false,
    editable: true,
    placeholder: "Select grade levels"
  },
  {
    key: "subjects",
    label: "Subjects",
    inputType: "multi-select",
    options: SubjectsValues,
    required: false,
    editable: true,
    placeholder: "Select subjects"
  },
  {
    key: "specialGroups",
    label: "Special Groups",
    inputType: "multi-select",
    options: SpecialGroupsValues,
    required: false,
    editable: true,
    placeholder: "Select special groups"
  },
  {
    key: "rolesNYCPS",
    label: "Roles",
    inputType: "multi-select",
    options: RolesNYCPSValues,
    required: true,
    editable: true,
    placeholder: "Select roles"
  },
  {
    key: "pronunciation",
    label: "Pronunciation",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter pronunciation guide"
  }
];

const TeachingLabStaffFieldConfig = {
  ...StaffFieldConfig,
  adminLevel: {
    inputType: "select",
    options: AdminLevelValues,
    required: true,
    editable: true,
    placeholder: "Select the admin level"
  },
  assignedDistricts: {
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "List assigned districts"
  },
  rolesTL: {
    inputType: "multi-select",
    options: RolesTLValues,
    required: true,
    editable: true,
    placeholder: "Select Teaching Lab roles"
  }
};

export { TeachingLabStaffFieldConfig }; 