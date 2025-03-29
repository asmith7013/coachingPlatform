import { Field } from "@/lib/ui-schema/types";
import { BellScheduleInput, TeacherScheduleInput } from "@/lib/zod-schema";
import { BellScheduleTypeValues } from "../../fieldValues";

export const BellScheduleFieldConfig: Field<BellScheduleInput>[] = [
  {
    key: "school",
    label: "School",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the associated school"
  },
  {
    key: "bellScheduleType",
    label: "Bell Schedule Type",
    inputType: "select",
    options: BellScheduleTypeValues,
    required: true,
    editable: true,
    placeholder: "Select the type of bell schedule"
  },
  {
    key: "classSchedule",
    label: "Class Schedule",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "List the class schedule"
  },
  {
    key: "assignedCycleDays",
    label: "Assigned Cycle Days",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "Specify assigned cycle days"
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

export const TeacherScheduleFieldConfig: Field<TeacherScheduleInput>[] = [
  {
    key: "teacher",
    label: "Teacher",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the teacher's name"
  },
  {
    key: "school",
    label: "School",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the associated school"
  },
  {
    key: "scheduleByDay",
    label: "Schedule By Day",
    inputType: "array",
    options: [],
    required: true,
    editable: true,
    placeholder: "List the teacher's schedule by day"
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