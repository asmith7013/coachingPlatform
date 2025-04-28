import { Field } from "@/components/composed/forms/ResourceForm";
import { Visit, EventItemZodSchema, SessionLinkZodSchema } from "@zod-schema/visits/visit";
import { 
  GradeLevelsSupportedZod,
  EventTypeZod,
  DurationValues,
  AllowedPurposeZod,
  ModeDoneZod,
  SessionPurposeZod
} from "@enums"; 
import { z } from "zod";

// Use inferred types from the Zod schemas
type EventItem = z.infer<typeof EventItemZodSchema>;
type SessionLink = z.infer<typeof SessionLinkZodSchema>;

export const EventItemFieldConfig: Field<EventItem>[] = [
  {
    key: "eventType",
    label: "Event Type",
    type: "select",
    options: EventTypeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "staff",
    label: "Staff",
    type: "select",
    options: [], // This should be populated with available staff
    defaultValue: [],
    required: true,
  },
  {
    key: "duration",
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
    key: "purpose",
    label: "Purpose",
    type: "select",
    options: SessionPurposeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: true,
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    required: true,
  },
  {
    key: "url",
    label: "URL",
    type: "text",
    required: true,
  },
  {
    key: "staff",
    label: "Staff",
    type: "select",
    options: [], // This should be populated with available staff
    defaultValue: [],
    required: true,
  }
];

export const VisitFieldConfig: Field<Visit>[] = [
  {
    key: "date",
    label: "Date",
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
    key: "coach",
    label: "Coach",
    type: "text",
    required: true,
  },
  {
    key: "cycleRef",
    label: "Cycle Reference",
    type: "text",
    required: true,
  },
  {
    key: "allowedPurpose",
    label: "Allowed Purpose",
    type: "select",
    options: AllowedPurposeZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: false,
  },
  {
    key: "modeDone",
    label: "Mode Done",
    type: "select",
    options: ModeDoneZod.options.map((value) => ({
      value,
      label: value,
    })),
    required: false,
  },
  {
    key: "gradeLevelsSupported",
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
    key: "events",
    label: "Events",
    type: "select",
    options: [], // This should be populated with available events
    defaultValue: [],
    required: false,
  },
  {
    key: "sessionLinks",
    label: "Session Links",
    type: "select",
    options: [], // This should be populated with available session links
    defaultValue: [],
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