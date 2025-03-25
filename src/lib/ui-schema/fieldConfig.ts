// 🚀 Auto-Generated FieldConfig.ts
// ✅ DO NOT EDIT DIRECTLY - Regenerate by running "tsx scripts/generateFieldConfig.ts"

import { RubricZodSchema } from "../zod-schema";
import { 
  AllowedPurposeValues, 
  GradeLevelsSupportedValues, 
  SubjectsValues, 
  SpecialGroupsValues, 
  RolesNYCPSValues, 
  RolesTLValues, 
  // DayTypeValues, 
  // BlockDayTypeValues, 
  BellScheduleTypeValues, 
  // PeriodTypeValues, 
  ModeDoneValues, 
  ReasonDoneValues, 
  TotalDurationValues, 
  SolvesTouchpointValues, 
  EventTypeValues, 
  DurationValues, 
  AdminLevelValues
} from "./fieldValues";

type InputType =
  | "text"
  | "number"
  | "date"
  | "multi-select"
  | "select"
  | "radio"
  | "checkbox"
  | "array"
  | "email";

export interface FieldConfigItem {
  inputType: InputType;
  options?: string[] | string | null; 
  required?: boolean;
  editable?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  schemaName?: unknown; // You might refine this type further (e.g. a Zod schema) if needed
}

const FieldConfig: Record<string, Record<string, FieldConfigItem>> = {
  LookFor: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    schools: {
      inputType: "multi-select",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select associated schools"
    },
    teachers: {
      inputType: "multi-select",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select associated teachers"
    },
    topic: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the main topic for this Look For"
    },
    description: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter a detailed description of this Look For"
    },
    studentFacing: {
      inputType: "radio",
      options: ["Yes", "No"], // Define radio options
      defaultValue: "Yes",
      required: true,
      editable: true,
      placeholder: "Select if student facing"
  },
    rubric: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Attach a related rubric",
      schemaName: RubricZodSchema
    },
    owners: {
      inputType: "array",
      options: [],
      // required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  Rubric: {
    score: {
      inputType: "number",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the rubric score"
    },
    category: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Enter rubric categories (comma-separated)"
    },
    content: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Add rubric content"
    },
    parentId: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the parent rubric ID"
    },
    collectionId: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the rubric collection ID"
    },
    hex: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the hexadecimal color code"
    }
  },
  Visit: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    date: {
      inputType: "date",
      options: null,
      required: true,
      editable: true,
      placeholder: "Select the visit date"
    },
    school: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the school name"
    },
    coach: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the coach's name"
    },
    cycleRef: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the cycle reference ID"
    },
    allowedPurpose: {
      inputType: "select",
      options: AllowedPurposeValues,
      required: true,
      editable: true,
      placeholder: "Select the purpose of the visit"
    },
    modeDone: {
      inputType: "select",
      options: ModeDoneValues,
      required: true,
      editable: true,
      placeholder: "Select how the visit was conducted"
    },
    gradeLevelsSupported: {
      inputType: "select",
      options: GradeLevelsSupportedValues,
      required: true,
      editable: true,
      placeholder: "Select applicable grade levels"
    },
    events: {
      inputType: "array",
      options: "EventItem",
      required: true,
      editable: true,
      placeholder: "Add visit events"
    },
    sessionLinks: {
      inputType: "array",
      options: "SessionLink",
      required: true,
      editable: true,
      placeholder: "Attach session links"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  CoachingLog: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    reasonDone: {
      inputType: "select",
      options: ReasonDoneValues,
      required: true,
      editable: true,
      placeholder: "Select reason for completion"
    },
    microPLTopic: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the micro PL topic"
    },
    microPLDuration: {
      inputType: "number",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter duration of micro PL (minutes)"
    },
    modelTopic: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the model lesson topic"
    },
    modelDuration: {
      inputType: "number",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter duration of the model lesson (minutes)"
    },
    adminMeet: {
      inputType: "checkbox",
      options: null,
      required: true,
      editable: true,
      placeholder: "Check if there was an admin meeting"
    },
    adminMeetDuration: {
      inputType: "number",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter duration of the admin meeting (minutes)"
    },
    NYCDone: {
      inputType: "checkbox",
      options: null,
      required: true,
      editable: true,
      placeholder: "Check if NYC work was completed"
    },
    totalDuration: {
      inputType: "select",
      options: TotalDurationValues,
      required: true,
      editable: true,
      placeholder: "Select the total duration of coaching"
    },
    solvesTouchpoint: {
      inputType: "select",
      options: SolvesTouchpointValues,
      required: true,
      editable: true,
      placeholder: "Select the SOLVES touchpoint"
    },
    primaryStrategy: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Describe the primary coaching strategy"
    },
    solvesSpecificStrategy: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Describe the SOLVES-specific strategy"
    },
    aiSummary: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter an AI-generated summary (if available)"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  StaffMember: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    id: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member ID"
    },
    staffName: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member's full name"
    },
    email: {
      inputType: "email",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member's email address"
    },
    schools: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select associated schools"
    },
    experience: {
      inputType: "array",
      options: "Experience",
      required: true,
      editable: true,
      placeholder: "List teaching/coaching experiences"
    },
    notes: {
      inputType: "array",
      options: "Note",
      required: true,
      editable: true,
      placeholder: "Add relevant staff notes"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  School: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    schoolNumber: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the school number"
    },
    district: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the school district"
    },
    schoolName: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the full school name"
    },
    address: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the school address"
    },
    emoji: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter a representative emoji for the school"
    },
    gradeLevelsSupported: {
      inputType: "select",
      options: GradeLevelsSupportedValues,
      required: true,
      editable: true,
      placeholder: "Select supported grade levels"
    },
    staffList: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select staff members at this school"
    },
    schedules: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Attach school schedules"
    },
    cycles: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Attach coaching cycles"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  BellSchedule: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    school: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the associated school"
    },
    bellScheduleType: {
      inputType: "select",
      options: BellScheduleTypeValues,
      required: true,
      editable: true,
      placeholder: "Select the type of bell schedule"
    },
    classSchedule: {
      inputType: "array",
      options: "ClassScheduleItem",
      required: true,
      editable: true,
      placeholder: "List the class schedule"
    },
    assignedCycleDays: {
      inputType: "array",
      options: "AssignedCycleDay",
      required: true,
      editable: true,
      placeholder: "Specify assigned cycle days"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  TeacherSchedule: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    teacher: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the teacher's name"
    },
    school: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the associated school"
    },
    scheduleByDay: {
      inputType: "array",
      options: "ScheduleByDay",
      required: true,
      editable: true,
      placeholder: "List the teacher's schedule by day"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  RubricScore: {
    date: {
      inputType: "date",
      options: null,
      required: true,
      editable: true,
      placeholder: "Select the date of the score"
    },
    score: {
      inputType: "number",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the rubric score"
    },
    staffId: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the staff member ID"
    },
    school: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the associated school"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  Note: {
    date: {
      inputType: "date",
      options: null,
      required: true,
      editable: true,
      placeholder: "Select the date of the note"
    },
    type: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Specify the note type"
    },
    heading: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter a heading for the note"
    },
    subheading: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Add subheading details"
    }
  },
  NextStep: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    description: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Describe the next step in coaching"
    },
    lookFor: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the related Look For"
    },
    teacher: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the teacher's name"
    },
    school: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the associated school"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  SessionLink: {
    purpose: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Specify the purpose of the session link"
    },
    title: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the session title"
    },
    url: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the session URL"
    },
    staff: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select involved staff members"
    }
  },
  EventItem: {
    eventType: {
      inputType: "select",
      options: EventTypeValues,
      required: true,
      editable: true,
      placeholder: "Select the type of event"
    },
    staff: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select staff involved in the event"
    },
    duration: {
      inputType: "select",
      options: DurationValues.map(String),
      required: true,
      editable: true,
      placeholder: "Select the duration of the event"
    }
  },
  Cycle: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    cycleNum: {
      inputType: "number",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the cycle number"
    },
    ipgIndicator: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the IPG indicator"
    },
    actionPlanURL: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the action plan URL"
    },
    implementationIndicator: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter the implementation indicator"
    },
    supportCycle: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Describe the support cycle"
    },
    lookFors: {
      inputType: "array",
      options: "LookForItem",
      required: true,
      editable: true,
      placeholder: "Attach Look Fors related to this cycle"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    }
  },
  NYCPSStaff: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    id: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member ID"
    },
    staffName: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member's full name"
    },
    email: {
      inputType: "email",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member's email address"
    },
    schools: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select associated schools"
    },
    experience: {
      inputType: "array",
      options: "Experience",
      required: true,
      editable: true,
      placeholder: "List teaching/coaching experiences"
    },
    notes: {
      inputType: "array",
      options: "Note",
      required: true,
      editable: true,
      placeholder: "Add relevant staff notes"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    },
    gradeLevelsSupported: {
      inputType: "multi-select",
      options: GradeLevelsSupportedValues,
      required: true,
      editable: true,
      placeholder: "Select grade levels supported"
    },
    subjects: {
      inputType: "multi-select",
      options: SubjectsValues,
      required: true,
      editable: true,
      placeholder: "Select subjects taught"
    },
    specialGroups: {
      inputType: "multi-select",
      options: SpecialGroupsValues,
      required: true,
      editable: true,
      placeholder: "Select special groups served"
    },
    rolesNYCPS: {
      inputType: "multi-select",
      options: RolesNYCPSValues,
      required: true,
      editable: true,
      placeholder: "Select NYCPS roles"
    },
    pronunciation: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Provide pronunciation guidance"
    },
    schedule: {
      inputType: "array",
      options: "ScheduleItem",
      required: true,
      editable: true,
      placeholder: "Enter the staff member's schedule"
    }
  },
  TeachingLabStaff: {
    _id: {
      inputType: "text",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated ID"
    },
    id: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member ID"
    },
    staffName: {
      inputType: "text",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member's full name"
    },
    email: {
      inputType: "email",
      options: null,
      required: true,
      editable: true,
      placeholder: "Enter staff member's email address"
    },
    schools: {
      inputType: "array",
      options: [],
      required: true,
      editable: true,
      placeholder: "Select associated schools"
    },
    experience: {
      inputType: "array",
      options: "Experience",
      required: true,
      editable: true,
      placeholder: "List teaching/coaching experiences"
    },
    notes: {
      inputType: "array",
      options: "Note",
      required: true,
      editable: true,
      placeholder: "Add relevant staff notes"
    },
    owners: {
      inputType: "array",
      options: [],
      required: true,
      editable: false,
    },
    createdAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated creation date"
    },
    updatedAt: {
      inputType: "date",
      options: null,
      required: false,
      editable: false,
      placeholder: "Auto-generated last update date"
    },
    adminLevel: {
      inputType: "select",
      options: AdminLevelValues,
      required: true,
      editable: true,
      placeholder: "Select the admin level"
    },
    assignedDistricts: {
      inputType: "multi-select",
      options: [],
      required: true,
      editable: true,
      placeholder: "List assigned districts"
    },
    rolesTL: {
      inputType: "multi-select",
      options: RolesTLValues,
      required: true,
      editable: true,
      placeholder: "Select Teaching Lab roles"
    }
  }
}

export default FieldConfig;
