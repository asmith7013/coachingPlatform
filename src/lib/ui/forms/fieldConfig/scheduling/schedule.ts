import { Field } from "@/components/composed/forms/ResourceForm";
import { BellScheduleInput, TeacherScheduleInput } from "@/lib/data-schema/zod-schema/schedule/schedule";
import { BellScheduleTypeZod } from "@enums";

export const BellScheduleFieldConfig: Field<BellScheduleInput>[] = [
  {
    key: "school",
    label: "School",
    type: "text",
    required: true,
  },
  {
    key: "bellScheduleType",
    label: "Bell Schedule Type",
    type: "select",
    options: BellScheduleTypeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "classSchedule",
    label: "Class Schedule",
    type: "select",
    options: [], // This should be populated with available class schedules
    defaultValue: [],
    required: true,
  },
  {
    key: "assignedCycleDays",
    label: "Assigned Cycle Days",
    type: "select",
    options: [], // This should be populated with available cycle days
    defaultValue: [],
    required: true,
  },
  {
    key: "owners",
    label: "Owners",
    type: "select",
    options: [], // This should be populated with available owners
    defaultValue: [],
    required: true,
  }
];

export const TeacherScheduleFieldConfig: Field<TeacherScheduleInput>[] = [
  {
    key: "teacher",
    label: "Teacher",
    type: "text",
    required: true,
  },
  {
    key: "school",
    label: "School",
    type: "text",
    required: true,
  },
  {
    key: "scheduleByDay",
    label: "Schedule By Day",
    type: "select",
    options: [], // This should be populated with available schedules
    defaultValue: [],
    required: true,
  },
  {
    key: "owners",
    label: "Owners",
    type: "select",
    options: [], // This should be populated with available owners
    defaultValue: [],
    required: true,
  }
]; 