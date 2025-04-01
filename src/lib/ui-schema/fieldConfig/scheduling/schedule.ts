import { Field } from "@/components/features/shared/form/GenericAddForm";
import { BellScheduleInput, TeacherScheduleInput } from "@/lib/zod-schema";
import { BellScheduleTypeZod } from "@/lib/zod-schema/shared/enums";

export const BellScheduleFieldConfig: Field<BellScheduleInput>[] = [
  {
    name: "school",
    label: "School",
    type: "text",
    required: true,
  },
  {
    name: "bellScheduleType",
    label: "Bell Schedule Type",
    type: "select",
    options: BellScheduleTypeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "classSchedule",
    label: "Class Schedule",
    type: "select",
    options: [], // This should be populated with available class schedules
    defaultValue: [],
    required: true,
  },
  {
    name: "assignedCycleDays",
    label: "Assigned Cycle Days",
    type: "select",
    options: [], // This should be populated with available cycle days
    defaultValue: [],
    required: true,
  },
  {
    name: "owners",
    label: "Owners",
    type: "select",
    options: [], // This should be populated with available owners
    defaultValue: [],
    required: true,
  }
];

export const TeacherScheduleFieldConfig: Field<TeacherScheduleInput>[] = [
  {
    name: "teacher",
    label: "Teacher",
    type: "text",
    required: true,
  },
  {
    name: "school",
    label: "School",
    type: "text",
    required: true,
  },
  {
    name: "scheduleByDay",
    label: "Schedule By Day",
    type: "select",
    options: [], // This should be populated with available schedules
    defaultValue: [],
    required: true,
  },
  {
    name: "owners",
    label: "Owners",
    type: "select",
    options: [], // This should be populated with available owners
    defaultValue: [],
    required: true,
  }
]; 