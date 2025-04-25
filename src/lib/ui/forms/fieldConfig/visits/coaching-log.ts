import { Field } from "@/components/composed/forms/ResourceForm";
import { CoachingLog } from "@zod-schema/visits/coaching-log";
import { 
  ReasonDoneZod,
  TotalDurationZod,
  SolvesTouchpointZod
} from "@data-schema/enum";

export const CoachingLogFieldConfig: Field<CoachingLog>[] = [
  {
    key: "reasonDone",
    label: "Reason Done",
    type: "select",
    options: ReasonDoneZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "microPLTopic",
    label: "Micro PL Topic",
    type: "text",
    required: false,
  },
  {
    key: "microPLDuration",
    label: "Micro PL Duration",
    type: "number",
    required: false,
  },
  {
    key: "modelTopic",
    label: "Model Topic",
    type: "text",
    required: false,
  },
  {
    key: "modelDuration",
    label: "Model Duration",
    type: "number",
    required: false,
  },
  {
    key: "adminMeet",
    label: "Admin Meeting",
    type: "checkbox",
    required: false,
  },
  {
    key: "adminMeetDuration",
    label: "Admin Meeting Duration",
    type: "number",
    required: false,
  },
  {
    key: "NYCDone",
    label: "NYC Work Done",
    type: "checkbox",
    required: false,
  },
  {
    key: "totalDuration",
    label: "Total Duration",
    type: "select",
    options: TotalDurationZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "solvesTouchpoint",
    label: "SOLVES Touchpoint",
    type: "select",
    options: SolvesTouchpointZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "primaryStrategy",
    label: "Primary Strategy",
    type: "text",
    required: true,
  },
  {
    key: "solvesSpecificStrategy",
    label: "SOLVES Specific Strategy",
    type: "text",
    required: true,
  },
  {
    key: "aiSummary",
    label: "AI Summary",
    type: "text",
    required: false,
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