import { Field } from "@/components/features/shared/form/GenericResourceForm";
import { Visit, EventItem, SessionLink } from "@/lib/zod-schema";
import { 
  GradeLevelsSupportedZod,
  EventTypeZod,
  DurationValues,
  AllowedPurposeZod,
  ModeDoneZod,
  SessionPurposeZod
} from "@/lib/zod-schema/shared/enums";

export const EventItemFieldConfig: Field<EventItem>[] = [
  {
    name: "eventType",
    label: "Event Type",
    type: "select",
    options: EventTypeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "staff",
    label: "Staff",
    type: "select",
    options: [], // This should be populated with available staff
    defaultValue: [],
    required: true,
  },
  {
    name: "duration",
    label: "Duration",
    type: "select",
    options: DurationValues.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  }
];

export const SessionLinkFieldConfig: Field<SessionLink>[] = [
  {
    name: "purpose",
    label: "Purpose",
    type: "select",
    options: SessionPurposeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
  },
  {
    name: "url",
    label: "URL",
    type: "text",
    required: true,
  },
  {
    name: "staff",
    label: "Staff",
    type: "select",
    options: [], // This should be populated with available staff
    defaultValue: [],
    required: true,
  }
];

export const VisitFieldConfig: Field<Visit>[] = [
  {
    name: "date",
    label: "Date",
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
    name: "coach",
    label: "Coach",
    type: "text",
    required: true,
  },
  {
    name: "cycleRef",
    label: "Cycle Reference",
    type: "text",
    required: true,
  },
  {
    name: "allowedPurpose",
    label: "Allowed Purpose",
    type: "select",
    options: AllowedPurposeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: false,
  },
  {
    name: "modeDone",
    label: "Mode Done",
    type: "select",
    options: ModeDoneZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: false,
  },
  {
    name: "gradeLevelsSupported",
    label: "Grade Levels",
    type: "select",
    options: GradeLevelsSupportedZod.options.map((value) => ({
      value,
      label: value,
    })),
    defaultValue: [],
    required: true,
  },
  {
    name: "events",
    label: "Events",
    type: "select",
    options: [], // This should be populated with available events
    defaultValue: [],
    required: false,
  },
  {
    name: "sessionLinks",
    label: "Session Links",
    type: "select",
    options: [], // This should be populated with available session links
    defaultValue: [],
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