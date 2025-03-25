import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; // Import Mongoose

export enum AllowedPurposeEnum {
  INITIAL_WALKTHROUGH = "Initial Walkthrough",
  VISIT = "Visit",
  FINAL_WALKTHROUGH = "Final Walkthrough",
}

export enum AllowedGradeEnum {
  KINDERGARTEN = "Kindergarten",
  GRADE_1 = "Grade 1",
  GRADE_2 = "Grade 2",
  GRADE_3 = "Grade 3",
  GRADE_4 = "Grade 4",
  GRADE_5 = "Grade 5",
  GRADE_6 = "Grade 6",
  GRADE_7 = "Grade 7",
  GRADE_8 = "Grade 8",
  GRADE_9 = "Grade 9",
  GRADE_10 = "Grade 10",
  GRADE_11 = "Grade 11",
  GRADE_12 = "Grade 12",
}

export enum AllowedSubjectsEnum {
  MATH_6 = "Math 6",
  MATH_7 = "Math 7",
  MATH_8 = "Math 8",
  ALGEBRA_I = "Algebra I",
  GEOMETRY = "Geometry",
  ALGEBRA_II = "Algebra II",
}

export enum AllowedSpecialGroupsEnum {
  SPED = "SPED",
  ELL = "ELL",
}

export enum AllowedRolesNYCPSEnum {
  TEACHER = "Teacher",
  PRINCIPAL = "Principal",
  AP = "AP",
  COACH = "Coach",
  ADMINISTRATOR = "Administrator",
}

export enum AllowedRolesTLEnum {
  COACH = "Coach",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director",
}

export enum DayTypeEnum {
  UNIFORM = "uniform",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  A = "A",
  B = "B",
  C = "C",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class ClassScheduleItem {
  @prop({ enum: DayTypeEnum, type: String, required: true })
  day!: DayTypeEnum;
  @prop({ type: String, required: true })
  startTime!: string;
  @prop({ type: String, required: true })
  endTime!: string;
}

export enum BlockDayTypeEnum {
  A = "A",
  B = "B",
  C = "C",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class AssignedCycleDay {
  @prop({ type: Date, required: true })
  date!: Date;
  @prop({ enum: BlockDayTypeEnum, type: String, required: true })
  blockDayType!: BlockDayTypeEnum;
}

export enum BellScheduleTypesEnum {
  UNIFORM = "uniform",
  WEEKLYCYCLE = "weeklyCycle",
  ABCCYCLE = "abcCycle",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class BellSchedule {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  // MongoDB will auto-generate this
  school!: string;
  @prop({ enum: BellScheduleTypesEnum, type: String, required: true })
  // School ID
  bellScheduleType!: BellScheduleTypesEnum;
  @prop({ type: () => [ClassScheduleItem], required: true })
  classSchedule!: ClassScheduleItem[];
  @prop({ type: () => [AssignedCycleDay], required: true })
  assignedCycleDays!: AssignedCycleDay[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date
}

export enum PeriodTypesEnum {
  CLASS = "class",
  PREP = "prep",
  LUNCH = "lunch",
  MEETING = "meeting",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Period {
  @prop({ type: Number, required: true })
  periodNum!: number;
  @prop({ type: String, required: true })
  className!: string;
  @prop({ type: String })
  room?: string;
  @prop({ enum: PeriodTypesEnum, type: String, required: true })
  periodType!: PeriodTypesEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class DailySchedule {
  @prop({ enum: DayTypeEnum, type: String, required: true })
  day!: DayTypeEnum;
  @prop({ type: () => [Period], required: true })
  periods!: Period[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class TeacherSchedule {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  // MongoDB will auto-generate this
  teacher!: string;
  @prop({ type: String, required: true })
  school!: string;
  @prop({ type: () => [DailySchedule], required: true })
  scheduleByDay!: DailySchedule[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class RubricScore {
  @prop({ type: String, required: true })
  date!: string;
  @prop({ type: Number, required: true })
  score!: number;
  @prop({ type: String, required: true })
  staffId!: string;
  @prop({ type: String, required: true })
  school!: string;
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Note {
  @prop({ type: String, required: true })
  date!: string;
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: String, required: true })
  heading!: string;
  @prop({ type: () => [String], required: true })
  subheading!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class NextStep {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  // MongoDB will auto-generate this
  description!: string;
  @prop({ type: String, required: true })
  lookFor!: string;
  @prop({ type: String, required: true })
  teacher!: string;
  @prop({ type: String, required: true })
  school!: string;
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class SessionLink {
  @prop({ type: String, required: true })
  purpose!: string;
  @prop({ type: String, required: true })
  title!: string;
  @prop({ type: String, required: true })
  url!: string;
  @prop({ type: () => [String], required: true })
  staff!: string[];
}

export enum DurationTypesEnum {
  MIN_15 = 15,
  MIN_30 = 30,
  MIN_45 = 45,
  MIN_60 = 60,
  MIN_75 = 75,
  MIN_90 = 90,
}

export enum EventTypesEnum {
  OBSERVATION = "observation",
  DEBRIEF = "debrief",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class EventItem {
  @prop({ enum: EventTypesEnum, type: String, required: true })
  type!: EventTypesEnum;
  @prop({ type: () => [String], required: true })
  staff!: string[];
  @prop({ enum: DurationTypesEnum, type: Number, required: true })
  duration!: DurationTypesEnum;
}

export enum SettingTypesEnum {
  IN_PERSON = "In-person",
  VIRTUAL = "Virtual",
  HYBRID = "Hybrid",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Visit {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  // MongoDB will auto-generate this
  date!: string;
  @prop({ type: String, required: true })
  school!: string;
  @prop({ type: String, required: true })
  coach!: string;
  @prop({ type: String, required: true })
  cycleRef!: string;
  @prop({ enum: AllowedPurposeEnum, type: String, required: false })
  purpose?: AllowedPurposeEnum;
  @prop({ enum: SettingTypesEnum, type: String, required: false })
  modeDone?: SettingTypesEnum;
  @prop({ enum: AllowedGradeEnum, type: String, required: true, default: [] })
  gradeLevelsSupported!: AllowedGradeEnum[];
  @prop({ type: () => [EventItem] })
  events?: EventItem[];
  @prop({ type: () => [SessionLink] })
  sessionLinks?: SessionLink[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

export enum YesNoEnum {
  YES = "Yes",
  NO = "No",
}

export enum LengthTypeEnum {
  FULL_DAY___6_HOURS = "Full day - 6 hours",
  HALF_DAY___3_HOURS = "Half day - 3 hours",
}

export enum TeacherLeaderTypeEnum {
  TEACHER_SUPPORT = "Teacher support",
  LEADER_SUPPORT = "Leader support",
  TEACHER_OR_TEACHER___LEADER_SUPPORT = "Teacher OR teacher & leader support",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class CoachingLog {
  @prop({ type: String })
  _id?: string;
  @prop({ enum: YesNoEnum, type: String, required: true })
  // MongoDB will auto-generate this
  reasonDone!: YesNoEnum;
  @prop({ type: String })
  microPLTopic?: string;
  @prop({ type: Number })
  microPLDuration?: number;
  @prop({ type: String })
  modelTopic?: string;
  @prop({ type: Number })
  modelDuration?: number;
  @prop({ type: Boolean })
  adminMeet?: boolean;
  @prop({ type: Number })
  adminMeetDuration?: number;
  @prop({ type: Boolean })
  NYCDone?: boolean;
  @prop({ enum: LengthTypeEnum, type: String, required: true })
  totalDuration!: LengthTypeEnum;
  @prop({ enum: TeacherLeaderTypeEnum, type: String, required: true })
  Solvestouchpoint!: TeacherLeaderTypeEnum;
  @prop({ type: String, required: true })
  PrimaryStrategy!: string;
  @prop({ type: String, required: true })
  solvesSpecificStrategy!: string;
  @prop({ type: String })
  aiSummary?: string;
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Rubric {
  @prop({ type: Number, required: true })
  score!: number;
  @prop({ type: () => [String], required: true })
  category!: string[];
  @prop({ type: () => [String] })
  content?: string[];
  @prop({ type: String })
  parentId?: string;
  @prop({ type: String })
  collectionId?: string;
  @prop({ type: String })
  hex?: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class LookFor {
  @prop({ type: mongoose.Schema.Types.ObjectId, auto: true }) // ✅ Explicitly define `_id`
  _id?: mongoose.Types.ObjectId;
  @prop({ type: () => [String], required: true })
  schools!: string[];
  @prop({ type: () => [String], required: true })
  teachers!: string[];
  @prop({ type: String, required: true })
  topic!: string;
  @prop({ type: String, required: true })
  description!: string;
  @prop({ type: String, required: true })
  studentFacing!: string;
  @prop({ type: String })
  category?: string;
  @prop({ type: String })
  status?: string;
  @prop({ type: () => [Rubric], required: true })
  rubric!: Rubric[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;

  // Add a method to handle circular references
  // toJSON() {
  //   const obj = (this as any).toObject?.() || this;
  //   return {
  //     ...obj,
  //     _id: obj._id?.toString(),
  //     createdAt: obj.createdAt?.toISOString(),
  //     updatedAt: obj.updatedAt?.toISOString(),
  //     owners: obj.owners?.map((owner: string) => owner.toString()),
  //     rubric: obj.rubric?.map((rubric: Rubric) => ({
  //       ...rubric,
  //       // Add any additional transformations if needed
  //     })),
  //   };
  // }
}

@modelOptions({ schemaOptions: { timestamps: true } })
class LookForItem {
  @prop({ type: mongoose.Schema.Types.ObjectId, auto: true }) // ✅ Explicitly define `_id`
  _id!: mongoose.Types.ObjectId;
  @prop({ type: String, required: true })
  originalLookFor!: string;
  @prop({ type: String, required: true })
  title!: string;
  @prop({ type: String, required: true })
  description!: string;
  @prop({ type: () => [String], required: true })
  tags!: string[];
  @prop({ type: Number, required: true })
  lookForIndex!: number;
  @prop({ type: () => [String], required: true })
  teacherIDs!: string[];
  @prop({ type: () => [String], required: true })
  chosenBy!: string[];
  @prop({ type: Boolean, required: true })
  active!: boolean;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Cycle {
  @prop({ type: String })
  _id?: string;
  @prop({ type: Number, required: true })
  cycleNum!: number;
  @prop({ type: String })
  ipgIndicator?: string;
  @prop({ type: String })
  actionPlanURL?: string;
  @prop({ type: String, required: true })
  implementationIndicator!: string;
  @prop({ type: String })
  supportCycle?: string;
  @prop({ type: () => [LookForItem], required: true, default: [] })
  lookFors!: LookForItem[];
  @prop({ type: () => [String], required: true, default: [] })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class StaffMember {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  // MongoDB will auto-generate this
  id!: string;
  @prop({ type: String, required: true })
  staffName!: string;
  @prop({ type: String })
  email?: string;
  @prop({ type: () => [String], required: true })
  schools!: string[];
  @prop({ type: String })
  schedule?: string;
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Experience {
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: Number, required: true })
  years!: number;
}

export enum TLAdminTypeEnum {
  COACH = "Coach",
  MANAGER = "Manager",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class NYCPSStaff extends StaffMember {
  @prop({ type: () => [String], required: true })
  gradeLevelsSupported!: string[]; // Array of supported grade levels

  @prop({ type: () => [String], required: true })
  subjects!: string[]; // Array of subjects

  @prop({ type: () => [String], required: true })
  specialGroups!: string[]; // Array of special groups (SPED, ELL, etc.)

  @prop({ type: () => [Note], default: [] })
  notes?: Note[];

  @prop({ type: () => [String], enum: AllowedRolesNYCPSEnum }) 
  allowedRolesNYCPS?: AllowedRolesNYCPSEnum[];

  @prop({ type: String })
  pronunciation?: string; // ✅ Match `pronunciation` from Zod

  @prop({ type: String }) 
  schedule?: string; // Stores the schedule structure

  @prop({ type: () => [Experience], default: [] }) 
  experience?: Experience[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class TeachingLabStaff extends StaffMember {
  @prop({ type: String, required: true })
  adminLevel!: string; // ✅ Match `AdminLevelZod`

  @prop({ type: () => [String], required: true })
  assignedDistricts!: string[]; // Array of assigned districts

  @prop({ type: () => [String], enum: AllowedRolesTLEnum }) 
  allowedRolesTL?: AllowedRolesTLEnum[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class School {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  // MongoDB will auto-generate this
  schoolNumber!: string;
  @prop({ type: String, required: true })
  district!: string;
  @prop({ type: String, required: true })
  schoolName!: string;
  @prop({ type: String })
  address?: string;
  @prop({ type: String })
  emoji?: string;
  @prop({ enum: AllowedGradeEnum, type: String, required: true, default: [] })
  gradeLevelsSupported!: AllowedGradeEnum[];
  @prop({ type: () => [String], required: true })
  staffList!: string[];
  @prop({ type: () => [String], required: true })
  schedules!: string[];
  @prop({ type: () => [String], required: true })
  cycles!: string[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

export const ClassScheduleItemModel =
  mongoose.models.ClassScheduleItem ||
  getModelForClass(ClassScheduleItem);

export const AssignedCycleDayModel =
  mongoose.models.AssignedCycleDay ||
  getModelForClass(AssignedCycleDay);

export const BellScheduleModel =
  mongoose.models.BellSchedule || getModelForClass(BellSchedule);

export const PeriodModel =
  mongoose.models.Period || getModelForClass(Period);

export const DailyScheduleModel =
  mongoose.models.DailySchedule || getModelForClass(DailySchedule);

export const TeacherScheduleModel =
  mongoose.models.TeacherSchedule || getModelForClass(TeacherSchedule);

export const RubricScoreModel =
  mongoose.models.RubricScore || getModelForClass(RubricScore);

export const NoteModel =
  mongoose.models.Note || getModelForClass(Note);

export const NextStepModel =
  mongoose.models.NextStep || getModelForClass(NextStep);

export const SessionLinkModel =
  mongoose.models.SessionLink || getModelForClass(SessionLink);

export const EventItemModel =
  mongoose.models.EventItem || getModelForClass(EventItem);

export const VisitModel =
  mongoose.models.Visit || getModelForClass(Visit);

export const CoachingLogModel =
  mongoose.models.CoachingLog || getModelForClass(CoachingLog);

export const RubricModel =
  mongoose.models.Rubric || getModelForClass(Rubric);

export const LookForModel =
  mongoose.models.LookFor || getModelForClass(LookFor);

export const LookForItemModel =
  mongoose.models.LookForItem || getModelForClass(LookForItem);

export const CycleModel =
  mongoose.models.Cycle || getModelForClass(Cycle);

export const StaffMemberModel =
  mongoose.models.StaffMember || getModelForClass(StaffMember);

export const NYCPSStaffModel = 
  mongoose.models.NYCPSStaff || getModelForClass(NYCPSStaff);

export const TeachingLabStaffModel = 
  mongoose.models.TeachingLabStaff || getModelForClass(TeachingLabStaff);

export const ExperienceModel =
  mongoose.models.Experience || getModelForClass(Experience);

export const SchoolModel =
  mongoose.models.School || getModelForClass(School);
// 🔹✏️ Auto-Generated Typegoose Models
// export const ClassScheduleItemModel = getModelForClass(ClassScheduleItem);
// export const AssignedCycleDayModel = getModelForClass(AssignedCycleDay);
// export const BellScheduleModel = getModelForClass(BellSchedule);
// export const PeriodModel = getModelForClass(Period);
// export const DailyScheduleModel = getModelForClass(DailySchedule);
// export const TeacherScheduleModel = getModelForClass(TeacherSchedule);
// export const RubricScoreModel = getModelForClass(RubricScore);
// export const NoteModel = getModelForClass(Note);
// export const NextStepModel = getModelForClass(NextStep);
// export const SessionLinkModel = getModelForClass(SessionLink);
// export const EventItemModel = getModelForClass(EventItem);
// export const VisitModel = getModelForClass(Visit);
// export const CoachingLogModel = getModelForClass(CoachingLog);
// export const RubricModel = getModelForClass(Rubric);
// export const LookForModel = getModelForClass(LookFor);
// export const LookForItemModel = getModelForClass(LookForItem);
// export const CycleModel = getModelForClass(Cycle);
// export const StaffMemberModel = getModelForClass(StaffMember);
// export const ExperienceModel = getModelForClass(Experience);
// export const SchoolModel = getModelForClass(School);


// // List of all Typegoose model classes
// const modelClasses = {
//   ClassScheduleItem,
//   AssignedCycleDay,
//   BellSchedule,
//   Period,
//   DailySchedule,
//   TeacherSchedule,
//   RubricScore,
//   Note,
//   NextStep,
//   SessionLink,
//   EventItem,
//   Visit,
//   CoachingLog,
//   Rubric,
//   LookFor,
//   LookForItem,
//   Cycle,
//   StaffMember,
//   Experience,
//   School,
// } as const;

// // Dynamically create models while preserving `mongoose.models` cache
// export const models = Object.fromEntries(
//   Object.entries(modelClasses).map(([name, modelClass]) => [
//     `${name}Model`,
//     mongoose.models[name] || getModelForClass(modelClass),
//   ])
// ) as Record<`${keyof typeof modelClasses}Model`, any>;