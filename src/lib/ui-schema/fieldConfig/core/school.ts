import { Field } from "@/lib/ui-schema/types";
import { SchoolInput } from "@/lib/zod-schema";
import { GradeLevelsSupportedValues } from "../../fieldValues";

export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    key: "schoolNumber",
    label: "School Number",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter school number"
  },
  {
    key: "district",
    label: "District",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter district"
  },
  {
    key: "schoolName",
    label: "School Name",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter school name"
  },
  {
    key: "address",
    label: "Address",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter school address"
  },
  {
    key: "emoji",
    label: "Emoji",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter representative emoji"
  },
  {
    key: "gradeLevelsSupported",
    label: "Grade Levels",
    inputType: "multi-select",
    options: GradeLevelsSupportedValues,
    required: true,
    editable: true,
    placeholder: "Select supported grade levels"
  },
  {
    key: "staffList",
    label: "Staff Members",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select staff members"
  },
  {
    key: "schedules",
    label: "Schedules",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select schedules"
  },
  {
    key: "cycles",
    label: "Cycles",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select cycles"
  },
  {
    key: "owners",
    label: "Owners",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select owners"
  }
]; 