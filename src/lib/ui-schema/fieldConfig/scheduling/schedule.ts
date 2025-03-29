import { Field } from "@/lib/ui-schema/types";
import { BellScheduleInput, TeacherScheduleInput } from "@/lib/zod-schema";
import { BellScheduleTypeValues } from "../../fieldValues";

export const BellScheduleFieldConfig: Field<BellScheduleInput>[] = [
  {
    key: "school",
    label: "School",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the associated school"
  },
  {
    key: "bellScheduleType",
    label: "Bell Schedule Type",
    type: "select",
    inputType: "select",
    options: BellScheduleTypeValues,
    required: true,
    editable: true,
    placeholder: "Select the type of bell schedule"
  },
  {
    key: "classSchedule",
    label: "Class Schedule",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "List the class schedule"
  },
  {
    key: "assignedCycleDays",
    label: "Assigned Cycle Days",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Specify assigned cycle days"
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

export const TeacherScheduleFieldConfig: Field<TeacherScheduleInput>[] = [
  {
    key: "teacher",
    label: "Teacher",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the teacher's name"
  },
  {
    key: "school",
    label: "School",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the associated school"
  },
  {
    key: "scheduleByDay",
    label: "Schedule By Day",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "List the teacher's schedule by day"
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