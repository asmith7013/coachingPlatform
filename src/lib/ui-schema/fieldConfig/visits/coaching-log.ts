import { Field } from "@/lib/ui-schema/types";
import { CoachingLog } from "@/lib/zod-schema";
import { 
  ReasonDoneValues,
  TotalDurationValues,
  SolvesTouchpointValues
} from "../../fieldValues";

export const CoachingLogFieldConfig: Field<CoachingLog>[] = [
  {
    key: "reasonDone",
    label: "Reason Done",
    type: "select",
    inputType: "select",
    options: ReasonDoneValues,
    required: true,
    editable: true,
    placeholder: "Select reason for completion"
  },
  {
    key: "microPLTopic",
    label: "Micro PL Topic",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter the micro PL topic"
  },
  {
    key: "microPLDuration",
    label: "Micro PL Duration",
    type: "text",
    inputType: "number",
    required: false,
    editable: true,
    placeholder: "Enter duration of micro PL (minutes)"
  },
  {
    key: "modelTopic",
    label: "Model Topic",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter the model lesson topic"
  },
  {
    key: "modelDuration",
    label: "Model Duration",
    type: "text",
    inputType: "number",
    required: false,
    editable: true,
    placeholder: "Enter duration of the model lesson (minutes)"
  },
  {
    key: "adminMeet",
    label: "Admin Meeting",
    type: "select",
    inputType: "checkbox",
    options: ["Yes", "No"],
    required: false,
    editable: true,
    placeholder: "Check if there was an admin meeting"
  },
  {
    key: "adminMeetDuration",
    label: "Admin Meeting Duration",
    type: "text",
    inputType: "number",
    required: false,
    editable: true,
    placeholder: "Enter duration of the admin meeting (minutes)"
  },
  {
    key: "NYCDone",
    label: "NYC Work Done",
    type: "select",
    inputType: "checkbox",
    options: ["Yes", "No"],
    required: false,
    editable: true,
    placeholder: "Check if NYC work was completed"
  },
  {
    key: "totalDuration",
    label: "Total Duration",
    type: "select",
    inputType: "select",
    options: TotalDurationValues,
    required: true,
    editable: true,
    placeholder: "Select the total duration of coaching"
  },
  {
    key: "solvesTouchpoint",
    label: "SOLVES Touchpoint",
    type: "select",
    inputType: "select",
    options: SolvesTouchpointValues,
    required: true,
    editable: true,
    placeholder: "Select the SOLVES touchpoint"
  },
  {
    key: "primaryStrategy",
    label: "Primary Strategy",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the primary strategy"
  },
  {
    key: "solvesSpecificStrategy",
    label: "SOLVES Specific Strategy",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter the SOLVES specific strategy"
  },
  {
    key: "aiSummary",
    label: "AI Summary",
    type: "text",
    inputType: "text",
    required: false,
    editable: true,
    placeholder: "Enter the AI-generated summary"
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