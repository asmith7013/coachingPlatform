// // ✅ Allowed Enums
// export type AllowedPurpose = "Initial Walkthrough" | "Visit" | "Final Walkthrough";
// export type GradeLevelsSupported = 
//   "Kindergarten" | "Grade 1" | "Grade 2" | "Grade 3" | "Grade 4" | "Grade 5" | 
//   "Grade 6" | "Grade 7" | "Grade 8" | "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
// export type Subjects = "Math 6" | "Math 7" | "Math 8" | "Algebra I" | "Geometry" | "Algebra II";
// export type SpecialGroups = "SPED" | "ELL";
// export type RolesNYCPS = "Teacher" | "Principal" | "AP" | "Coach" | "Administrator";
// export type RolesTL = "Coach" | "CPM" | "Director" | "Senior Director";

// export type DayType = "uniform" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "A" | "B" | "C";

// // ✅ Class Schedule
// export type ClassScheduleItem = {
//   dayType: DayType;
//   startTime: string;
//   endTime: string;
// };

// export type BlockDayType = "A" | "B" | "C";
// // ✅ Assigned Cycle Days
// export type AssignedCycleDay = {
//   date: string;
//   blockDayType: BlockDayType;
// };

// export type BellScheduleType = "uniform" | "weeklyCycle" | "abcCycle";

// // ✅ Bell Schedule
// export type BellSchedule = {
//   _id?: string; // MongoDB will auto-generate this
//   school: string;  // School ID
//   bellScheduleType: BellScheduleType;
//   classSchedule: ClassScheduleItem[];
//   assignedCycleDays: AssignedCycleDay[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// export type PeriodType = "class" | "prep" | "lunch" | "meeting";
// // ✅ Period Structure
// export type Period = {
//   periodNum: number;
//   className: string;
//   room?: string;
//   periodType: PeriodType
// };

// // ✅ Teacher Schedule
// export type ScheduleByDay = {
//   day: DayType;
//   periods: Period[];
// };

// export type TeacherSchedule = {
//   _id?: string; // MongoDB will auto-generate this
//   teacher: string;
//   school: string;
//   scheduleByDay: ScheduleByDay[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ Rubric Scores
// export type RubricScore = {
//   date: string;
//   score: number;
//   staffId: string;
//   school: string;
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ Notes
// export type Note = {
//   date: string;
//   type: string;
//   heading: string;
//   subheading: string[];
// };

// // ✅ Next Steps
// export type NextStep = {
//   _id?: string; // MongoDB will auto-generate this
//   description: string;
//   lookFor: string;
//   teacher: string;
//   school: string;
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ Session Links
// export type SessionLink = {
//   purpose: string;
//   title: string;
//   url: string;
//   staff: string[];
// };

// export type Duration = 15 | 30 | 45 | 60 | 75 | 90;
// export type EventType = "observation" | "debrief";
// // ✅ Event Item
// export type EventItem = {
//   eventType: EventType;
//   staff: string[];
//   duration: Duration;
// };

// export type ModeDone = "In-person" | "Virtual" | "Hybrid";
// // ✅ Visits
// export type Visit = {
//   _id?: string; // MongoDB will auto-generate this
//   date: string;
//   school: string;
//   coach: string;
//   cycleRef: string;
//   allowedPurpose?: AllowedPurpose;
//   modeDone?: ModeDone;
//   gradeLevelsSupported: GradeLevelsSupported[];
//   events?: EventItem[];
//   sessionLinks?: SessionLink[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// export type ReasonDone = "Yes" | "No";
// export type TotalDuration = "Full day - 6 hours" | "Half day - 3 hours";
// export type SolvesTouchpoint = "Teacher support" | "Leader support" | "Teacher OR teacher & leader support";

// // ✅ Coaching Logs
// export type CoachingLog = {
//   _id?: string; // MongoDB will auto-generate this
//   reasonDone: ReasonDone;
//   microPLTopic?: string;
//   microPLDuration?: number;
//   modelTopic?: string;
//   modelDuration?: number;
//   adminMeet?: boolean;
//   adminMeetDuration?: number;
//   NYCDone?: boolean;
//   totalDuration: TotalDuration;
//   solvesTouchpoint: SolvesTouchpoint;
//   primaryStrategy: string;
//   solvesSpecificStrategy: string;
//   aiSummary?: string;
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ Rubric
// export type Rubric = {
//   score: number;
//   category: string[];
//   content?: string[];
//   parentId?: string;
//   collectionId?: string;
//   hex?: string;
// };

// // ✅ LookFor
// export type LookFor = {
//   _id?: string; // MongoDB will auto-generate this
//   lookForIndex: number;
//   schools: string[];
//   teachers: string[];
//   topic: string;
//   description: string;
//   category?: string;
//   status?: string;
//   studentFacing: boolean;
//   rubric: Rubric[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ LookForItem
// export type LookForItem = {
//   originalLookFor: string;
//   title: string;
//   description: string;
//   tags: string[];
//   lookForIndex: number;
//   teacherIDs: string[];
//   chosenBy: string[];
//   active: boolean;
// };

// // ✅ Cycle
// export type Cycle = {
//   _id?: string; // MongoDB will auto-generate this
//   cycleNum: number;
//   ipgIndicator?: string;
//   actionPlanURL?: string;
//   implementationIndicator: string;
//   supportCycle?: string;
//   lookFors: LookForItem[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ Staff
// export type StaffMember = {
//   _id?: string; // MongoDB will auto-generate this
//   id: string;
//   staffName: string;
//   email?: string;
//   schools: string[];
//   experience?: Experience[];
//   notes?: Note[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };

// // ✅ Experience
// export type Experience = {
//   type: string;
//   years: number;
// };

// // ✅ NYCPS Staff
// export type NYCPSStaff = StaffMember & {
//   gradeLevelsSupported: GradeLevelsSupported[];
//   subjects: Subjects[];
//   specialGroups: SpecialGroups[];
//   rolesNYCPS?: RolesNYCPS[];
//   pronunciation?: string;
//   schedule: string;
//   experience: Experience[];
// };

// export type AdminLevel = "Coach" | "Manager" | "CPM" | "Director" | "Senior Director";
// // ✅ Teaching Lab Staff
// export type TeachingLabStaff = StaffMember & {
//   adminLevel: AdminLevel;
//   assignedDistricts: string[];
//   notes: Note[];
//   rolesTL?: RolesTL[];
// };

// // ✅ School
// export type School = {
//   _id?: string; // MongoDB will auto-generate this
//   schoolNumber: string;
//   district: string;
//   schoolName: string;
//   address?: string;
//   emoji?: string;
//   gradeLevelsSupported: GradeLevelsSupported[];
//   staffList: string[];
//   schedules: string[];
//   cycles: string[];
//   owners: string[];
//   createdAt?: string;
//   updatedAt?: string;
// };