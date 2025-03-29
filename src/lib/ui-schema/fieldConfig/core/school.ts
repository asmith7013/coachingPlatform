import { Field } from "@/lib/ui-schema/types";
import { SchoolInput } from "@/lib/zod-schema";
import { GradeLevelsSupportedValues } from "../../fieldValues";

export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    key: "schoolNumber",
    label: "School Number",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter school number"
  },
  {
    key: "district",
    label: "District",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter district"
  },
  {
    key: "schoolName",
    label: "School Name",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter school name"
  },
  {
    key: "address",
    label: "Address",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter school address"
  },
  {
    key: "emoji",
    label: "Emoji",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter representative emoji"
  },
  {
    key: "gradeLevelsSupported",
    label: "Grade Levels",
    type: "multi-select",
    inputType: "multi-select",
    options: GradeLevelsSupportedValues,
    required: true,
    editable: true,
    placeholder: "Select supported grade levels"
  },
  {
    key: "staffList",
    label: "Staff Members",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select staff members"
  },
  {
    key: "schedules",
    label: "Schedules",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select schedules"
  },
  {
    key: "cycles",
    label: "Cycles",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select cycles"
  },
  {
    key: "owners",
    label: "Owners",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select owners"
  }
]; 