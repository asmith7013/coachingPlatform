import { Field } from "@/lib/ui-schema/types";
import { Visit, EventItem, SessionLink } from "@/lib/zod-schema";
import { 
  GradeLevelsSupportedValues,
  EventTypeValues,
  DurationValues,
  AllowedPurposeValues,
  ModeDoneValues,
  SessionPurposeValues
} from "../../fieldValues";

export const EventItemFieldConfig: Field<EventItem>[] = [
  {
    key: "eventType",
    label: "Event Type",
    type: "select",
    inputType: "select",
    options: EventTypeValues,
    required: true,
    editable: true,
    placeholder: "Select event type"
  },
  {
    key: "staff",
    label: "Staff",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select staff members"
  },
  {
    key: "duration",
    label: "Duration",
    type: "select",
    inputType: "select",
    options: DurationValues,
    required: true,
    editable: true,
    placeholder: "Select duration"
  }
];

export const SessionLinkFieldConfig: Field<SessionLink>[] = [
  {
    key: "purpose",
    label: "Purpose",
    type: "select",
    inputType: "select",
    options: SessionPurposeValues,
    required: true,
    editable: true,
    placeholder: "Select session purpose"
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter session title"
  },
  {
    key: "url",
    label: "URL",
    type: "text",
    inputType: "url",
    required: true,
    editable: true,
    placeholder: "Enter session URL"
  },
  {
    key: "staff",
    label: "Staff",
    type: "multi-select",
    inputType: "multi-select",
    options: [],
    required: true,
    editable: true,
    placeholder: "Select staff members"
  }
];

export const VisitFieldConfig: Field<Visit>[] = [
  {
    key: "date",
    label: "Date",
    type: "text",
    inputType: "date",
    required: true,
    editable: true,
    placeholder: "Select visit date"
  },
  {
    key: "school",
    label: "School",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter school ID"
  },
  {
    key: "coach",
    label: "Coach",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter coach ID"
  },
  {
    key: "cycleRef",
    label: "Cycle Reference",
    type: "text",
    inputType: "text",
    required: true,
    editable: true,
    placeholder: "Enter cycle reference"
  },
  {
    key: "allowedPurpose",
    label: "Allowed Purpose",
    type: "select",
    inputType: "select",
    options: AllowedPurposeValues,
    required: false,
    editable: true,
    placeholder: "Select allowed purpose"
  },
  {
    key: "modeDone",
    label: "Mode Done",
    type: "select",
    inputType: "select",
    options: ModeDoneValues,
    required: false,
    editable: true,
    placeholder: "Select mode done"
  },
  {
    key: "gradeLevelsSupported",
    label: "Grade Levels",
    type: "multi-select",
    inputType: "multi-select",
    options: GradeLevelsSupportedValues,
    required: true,
    editable: true,
    placeholder: "Select grade levels"
  },
  {
    key: "events",
    label: "Events",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: false,
    editable: true,
    placeholder: "Add events"
  },
  {
    key: "sessionLinks",
    label: "Session Links",
    type: "multi-select",
    inputType: "array",
    options: [],
    required: false,
    editable: true,
    placeholder: "Add session links"
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