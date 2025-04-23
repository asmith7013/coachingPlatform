import { z } from "zod";

// ✅ Grade Levels Supported Enum
export const GradeLevelsSupportedZod = z.enum([
  "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
]);
export type GradeLevelsSupported = z.infer<typeof GradeLevelsSupportedZod>;

// ✅ Subjects Enum
export const SubjectsZod = z.enum([
  "Math 6", "Math 7", "Math 8", "Algebra I", "Geometry", "Algebra II"
]);
export type Subjects = z.infer<typeof SubjectsZod>;

// ✅ Special Groups Enum
export const SpecialGroupsZod = z.enum(["SPED", "ELL"]);
export type SpecialGroups = z.infer<typeof SpecialGroupsZod>;

// ✅ Day Type Enum
export const DayTypeZod = z.enum([
  "uniform", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "A", "B", "C"
]);
export type DayType = z.infer<typeof DayTypeZod>;

// ✅ Block Day Type Enum
export const BlockDayTypeZod = z.enum(["A", "B", "C"]);
export type BlockDayType = z.infer<typeof BlockDayTypeZod>;

// ✅ Bell Schedule Type Enum
export const BellScheduleTypeZod = z.enum(["uniform", "weeklyCycle", "abcCycle"]);
export type BellScheduleType = z.infer<typeof BellScheduleTypeZod>;

// ✅ Period Type Enum
export const PeriodTypeZod = z.enum(["class", "prep", "lunch", "meeting"]);
export type PeriodType = z.infer<typeof PeriodTypeZod>;

// ✅ Duration Enum
export const RawDurationZod = z.enum(["15", "30", "45", "60", "75", "90"]);
export const DurationZod = RawDurationZod.transform((val) => Number(val));
export const DurationValues = RawDurationZod.options;
export type Duration = z.infer<typeof DurationZod>;

// ✅ Event Type Enum
export const EventTypeZod = z.enum(["observation", "debrief"]);
export type EventType = z.infer<typeof EventTypeZod>;

// ✅ Roles in NYC Public Schools
export const RolesNYCPSZod = z.enum([
  "Teacher", 
  "Principal", 
  "AP", 
  "Coach", 
  "Administrator"
]);
export type RolesNYCPS = z.infer<typeof RolesNYCPSZod>;

// ✅ Roles in Teaching Lab
export const RolesTLZod = z.enum([
  "Coach", 
  "CPM", 
  "Director", 
  "Senior Director"
]);
export type RolesTL = z.infer<typeof RolesTLZod>;

// ✅ Admin Level Enum
export const AdminLevelZod = z.enum([
  "Coach", 
  "Manager", 
  "CPM", 
  "Director", 
  "Senior Director"
]);
export type AdminLevel = z.infer<typeof AdminLevelZod>;

// ✅ Note Type Enum
export const NoteTypeZod = z.enum(["Reflection", "Observation", "Debrief", "Action Plan"]);
export type NoteType = z.infer<typeof NoteTypeZod>;

// ✅ IPG Indicator Enum
export const IPGIndicatorZod = z.enum(["CA1", "CA2", "CA3"]);
export type IPGIndicator = z.infer<typeof IPGIndicatorZod>;

// ✅ Implementation Indicator Enum
export const ImplementationIndicatorZod = z.enum(["Level 1", "Level 2", "Level 3"]);
export type ImplementationIndicator = z.infer<typeof ImplementationIndicatorZod>;

// ✅ Support Cycle Type Enum
export const SupportCycleTypeZod = z.enum(["Launch", "Sustain", "Monitor"]);
export type SupportCycleType = z.infer<typeof SupportCycleTypeZod>;

// ✅ Session Purpose Enum
export const SessionPurposeZod = z.enum(["Observation", "Debrief", "Co-Planning", "PLC"]);
export type SessionPurpose = z.infer<typeof SessionPurposeZod>;

// ✅ Allowed Purpose Enum
export const AllowedPurposeZod = z.enum(["Initial Walkthrough", "Visit", "Final Walkthrough"]);
export type AllowedPurpose = z.infer<typeof AllowedPurposeZod>;

// ✅ Mode Done Enum
export const ModeDoneZod = z.enum(["In-person", "Virtual", "Hybrid"]);
export type ModeDone = z.infer<typeof ModeDoneZod>;

// ✅ Reason Done Enum
export const ReasonDoneZod = z.enum(["Yes", "No"]);
export type ReasonDone = z.infer<typeof ReasonDoneZod>;

// ✅ Total Duration Enum
export const TotalDurationZod = z.enum(["Full day - 6 hours", "Half day - 3 hours"]);
export type TotalDuration = z.infer<typeof TotalDurationZod>;

// ✅ Solves Touchpoint Enum
export const SolvesTouchpointZod = z.enum([
  "Teacher support",
  "Leader support",
  "Teacher OR teacher & leader support",
]);
export type SolvesTouchpoint = z.infer<typeof SolvesTouchpointZod>;
