import { Field } from "@/components/features/shared/form/GenericAddForm";
import { CoachingLog } from "@/lib/zod-schema";
import { 
  ReasonDoneZod,
  TotalDurationZod,
  SolvesTouchpointZod
} from "@/lib/zod-schema/shared/enums";

export const CoachingLogFieldConfig: Field<CoachingLog>[] = [
  {
    name: "reasonDone",
    label: "Reason Done",
    type: "select",
    options: ReasonDoneZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "microPLTopic",
    label: "Micro PL Topic",
    type: "text",
    required: false,
  },
  {
    name: "microPLDuration",
    label: "Micro PL Duration",
    type: "number",
    required: false,
  },
  {
    name: "modelTopic",
    label: "Model Topic",
    type: "text",
    required: false,
  },
  {
    name: "modelDuration",
    label: "Model Duration",
    type: "number",
    required: false,
  },
  {
    name: "adminMeet",
    label: "Admin Meeting",
    type: "checkbox",
    required: false,
  },
  {
    name: "adminMeetDuration",
    label: "Admin Meeting Duration",
    type: "number",
    required: false,
  },
  {
    name: "NYCDone",
    label: "NYC Work Done",
    type: "checkbox",
    required: false,
  },
  {
    name: "totalDuration",
    label: "Total Duration",
    type: "select",
    options: TotalDurationZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "solvesTouchpoint",
    label: "SOLVES Touchpoint",
    type: "select",
    options: SolvesTouchpointZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "primaryStrategy",
    label: "Primary Strategy",
    type: "text",
    required: true,
  },
  {
    name: "solvesSpecificStrategy",
    label: "SOLVES Specific Strategy",
    type: "text",
    required: true,
  },
  {
    name: "aiSummary",
    label: "AI Summary",
    type: "text",
    required: false,
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