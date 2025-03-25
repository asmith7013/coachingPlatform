import {
    School,
    StaffMember,
    TeachingLabStaff,
    NYCPSStaff,
    Cycle,
    LookFor,
    LookForItem,
    CoachingLog,
    Visit,
    EventItem,
    NextStep,
    Note,
    RubricScore,
    TeacherSchedule,
    ScheduleByDay,
    Period,
    BellSchedule,
    AssignedCycleDay,
    ClassScheduleItem,
    SessionLink,
  } from "@/models/models";
  
  // 🔹 Generate Type-Safe Labels for Every Model
  
  export const SchoolFieldLabels: Record<keyof School, string> = {
    _id: "ID",
    schoolNumber: "School Number",
    district: "District",
    schoolName: "School Name",
    address: "Address",
    emoji: "Emoji",
    gradeLevelsSupported: "Grades Offered",
    staffList: "Staff Members",
    schedules: "Schedules",
    cycles: "Cycles",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const StaffMemberFieldLabels: Record<keyof StaffMember, string> = {
    _id: "ID",
    id: "Staff ID",
    staffName: "Full Name",
    email: "Email Address",
    schools: "Assigned Schools",
    experience: "Experience",
    notes: "Notes",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const TeachingLabStaffFieldLabels: Record<keyof TeachingLabStaff, string> = {
    ...StaffMemberFieldLabels,
    adminLevel: "Admin Level",
    assignedDistricts: "Assigned Districts",
    rolesTL: "Role",
  };
  
  export const NYCPSStaffFieldLabels: Record<keyof NYCPSStaff, string> = {
    ...StaffMemberFieldLabels,
    gradeLevelsSupported: "Grade Levels",
    subjects: "Subjects Taught",
    specialGroups: "Special Groups",
    rolesNYCPS: "Role",
    schedule: "string",
    pronunciation: "Pronunciation",
  };
  
  export const CycleFieldLabels: Record<keyof Cycle, string> = {
    _id: "ID",
    cycleNum: "Cycle Number",
    ipgIndicator: "IPG Indicator",
    actionPlanURL: "Action Plan URL",
    implementationIndicator: "Implementation Indicator",
    supportCycle: "Support Cycle",
    lookFors: "Look Fors",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const LookForFieldLabels: Record<keyof LookFor, string> = {
    _id: "ID",
    lookForIndex: "Look For Index",
    schools: "Associated Schools",
    teachers: "Teachers",
    topic: "Topic",
    category: "Category",
    status: "Status",
    description: "Description",
    studentFacing: "🍎 Student Facing",
    rubric: "Rubric",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const LookForItemFieldLabels: Record<keyof LookForItem, string> = {
    originalLookFor: "Original Look For",
    title: "Title",
    description: "Description",
    tags: "Tags",
    lookForIndex: "Look For Index",
    teacherIDs: "Teacher IDs",
    chosenBy: "Chosen By",
    active: "Active Status",
  };
  
  export const CoachingLogFieldLabels: Record<keyof CoachingLog, string> = {
    _id: "ID",
    reasonDone: "Reason Done",
    microPLTopic: "Micro PL Topic",
    microPLDuration: "Micro PL Duration",
    modelTopic: "Model Topic",
    modelDuration: "Model Duration",
    adminMeet: "Admin Meeting",
    adminMeetDuration: "Admin Meeting Duration",
    NYCDone: "NYC Done",
    totalDuration: "Total Duration",
    solvesTouchpoint: "Solves Touchpoint",
    primaryStrategy: "Primary Strategy",
    solvesSpecificStrategy: "Solves-Specific Strategy",
    aiSummary: "AI Summary",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const VisitFieldLabels: Record<keyof Visit, string> = {
    _id: "ID",
    date: "Visit Date",
    school: "School",
    coach: "Coach",
    cycleRef: "Cycle Reference",
    allowedPurpose: "Purpose",
    modeDone: "Mode of Visit",
    gradeLevelsSupported: "Supported Grade Levels",
    events: "Events",
    sessionLinks: "Session Links",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const EventItemFieldLabels: Record<keyof EventItem, string> = {
    eventType: "Event Type",
    staff: "Involved Staff",
    duration: "Duration",
  };
  
  export const NextStepFieldLabels: Record<keyof NextStep, string> = {
    _id: "ID",
    description: "Description",
    lookFor: "Associated Look For",
    teacher: "Teacher",
    school: "School",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const NoteFieldLabels: Record<keyof Note, string> = {
    date: "Date",
    type: "Type",
    heading: "Heading",
    subheading: "Subheading",
  };
  
  export const RubricScoreFieldLabels: Record<keyof RubricScore, string> = {
    date: "Date",
    score: "Score",
    staffId: "Staff Member",
    school: "School",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const TeacherScheduleFieldLabels: Record<keyof TeacherSchedule, string> = {
    _id: "ID",
    teacher: "Teacher",
    school: "School",
    scheduleByDay: "Daily Schedule",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const ScheduleByDayFieldLabels: Record<keyof ScheduleByDay, string> = {
    day: "Day",
    periods: "Scheduled Periods",
  };
  
  export const PeriodFieldLabels: Record<keyof Period, string> = {
    periodNum: "Period Number",
    className: "Class Name",
    room: "Room",
    periodType: "Type",
  };
  
  export const BellScheduleFieldLabels: Record<keyof BellSchedule, string> = {
    _id: "ID",
    school: "School",
    bellScheduleType: "Schedule Type",
    classSchedule: "Class Schedule",
    assignedCycleDays: "Assigned Cycle Days",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  
  export const AssignedCycleDayFieldLabels: Record<keyof AssignedCycleDay, string> = {
    date: "Date",
    blockDayType: "Cycle Type",
  };
  
  export const ClassScheduleItemFieldLabels: Record<keyof ClassScheduleItem, string> = {
    dayType: "Day",
    startTime: "Start Time",
    endTime: "End Time",
  };
  
  export const SessionLinkFieldLabels: Record<keyof SessionLink, string> = {
    purpose: "Purpose",
    title: "Title",
    url: "URL",
    staff: "Staff Members",
  };
  
  // ✅ Export All Labels in One Object
  export const FieldLabels = {
    School: SchoolFieldLabels,
    StaffMember: StaffMemberFieldLabels,
    TeachingLabStaff: TeachingLabStaffFieldLabels,
    NYCPSStaff: NYCPSStaffFieldLabels,
    Cycle: CycleFieldLabels,
    LookFor: LookForFieldLabels,
    LookForItem: LookForItemFieldLabels,
    CoachingLog: CoachingLogFieldLabels,
    Visit: VisitFieldLabels,
    EventItem: EventItemFieldLabels,
    NextStep: NextStepFieldLabels,
    Note: NoteFieldLabels,
    RubricScore: RubricScoreFieldLabels,
    TeacherSchedule: TeacherScheduleFieldLabels,
    DailySchedule: ScheduleByDayFieldLabels,
    Period: PeriodFieldLabels,
    BellSchedule: BellScheduleFieldLabels,
    AssignedCycleDay: AssignedCycleDayFieldLabels,
    ClassScheduleItem: ClassScheduleItemFieldLabels,
    SessionLink: SessionLinkFieldLabels,
  };