// src/lib/data-schema/domain/shared-enums.ts

import { z } from 'zod';

// =====================================
// CORE ENUM DEFINITIONS
// =====================================

/**
 * Grade Levels
 */
export enum GradeLevels {
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

/**
 * Subject Areas
 */
export enum Subjects {
  MATH_6 = "Math 6",
  MATH_7 = "Math 7",
  MATH_8 = "Math 8",
  ALGEBRA_I = "Algebra I",
  GEOMETRY = "Geometry",
  ALGEBRA_II = "Algebra II",
}

/**
 * Special Groups
 */
export enum SpecialGroups {
  SPED = "SPED",
  ELL = "ELL",
}

/**
 * Day Types
 */
export enum DayTypes {
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

/**
 * Block Day Types
 */
export enum BlockDayTypes {
  A = "A",
  B = "B",
  C = "C",
}

/**
 * Bell Schedule Types
 */
export enum BellScheduleTypes {
  UNIFORM = "uniform",
  WEEKLY_CYCLE = "weeklyCycle",
  ABC_CYCLE = "abcCycle",
}

/**
 * Period Types
 */
export enum PeriodTypes {
  CLASS = "class",
  PREP = "prep",
  LUNCH = "lunch",
  MEETING = "meeting",
}

/**
 * Duration Values (in minutes)
 * Stored as strings in Zod validation but converted to numbers in processing
 */
export enum Duration {
  MIN_15 = "15",
  MIN_30 = "30",
  MIN_45 = "45",
  MIN_60 = "60",
  MIN_75 = "75",
  MIN_90 = "90",
}

/**
 * Roles in NYC Public Schools
 */
export enum RolesNYCPS {
  TEACHER = "Teacher",
  PRINCIPAL = "Principal",
  AP = "AP", 
  COACH = "Coach",
  ADMINISTRATOR = "Administrator",
}

/**
 * Roles in Teaching Lab
 */
export enum RolesTL {
  COACH = "Coach",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director",
}

/**
 * Admin Levels
 */
export enum AdminLevels {
  COACH = "Coach",
  MANAGER = "Manager",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director",
}

/**
 * Note Types
 */
export enum NoteTypes {
  REFLECTION = "Reflection",
  OBSERVATION = "Observation",
  DEBRIEF = "Debrief",
  ACTION_PLAN = "Action Plan",
}

/**
 * IPG Indicators
 */
export enum IPGIndicators {
  CA1 = "CA1",
  CA2 = "CA2",
  CA3 = "CA3",
}

/**
 * Implementation Indicators
 */
export enum ImplementationIndicators {
  LEVEL_1 = "Level 1",
  LEVEL_2 = "Level 2",
  LEVEL_3 = "Level 3",
}

/**
 * Support Cycle Types
 */
export enum SupportCycleTypes {
  LAUNCH = "Launch",
  SUSTAIN = "Sustain",
  MONITOR = "Monitor",
}

/**
 * Session Purpose
 */
export enum SessionPurposes {
  OBSERVATION = "Observation",
  DEBRIEF = "Debrief",
  CO_PLANNING = "Co-Planning",
  PLC = "PLC",
}


export enum ScheduleAssignment {
  FULL_PERIOD = "full_period",
  FIRST_HALF = "first_half",
  SECOND_HALF = "second_half",
}

/**
 * Allowed Purpose
 */
export enum AllowedPurposes {
  INITIAL_WALKTHROUGH = "Initial Walkthrough",
  VISIT = "Visit",
  FINAL_WALKTHROUGH = "Final Walkthrough",
}

/**
 * Mode Done (Setting Type)
 */
export enum ModeDone {
  IN_PERSON = "In-person",
  VIRTUAL = "Virtual",
  HYBRID = "Hybrid",
}

/**
 * Reason Done
 */
export enum ReasonDone {
  YES = "Yes",
  NO = "No",
}

/**
 * Total Duration
 */
export enum TotalDuration {
  FULL_DAY = "Full day - 6 hours",
  HALF_DAY = "Half day - 3 hours",
}

/**
 * SOLVES Touchpoint
 */
export enum SolvesTouchpoint {
  TEACHER_SUPPORT = "Teacher support",
  LEADER_SUPPORT = "Leader support",
  TEACHER_OR_LEADER = "Teacher OR teacher & leader support",
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Creates a Zod enum from a TypeScript enum
 */
function createZodEnum<T extends Record<string, string>>(enumObj: T) {
  return z.enum(Object.values(enumObj) as [string, ...string[]]);
}

// =====================================
// ZOD SCHEMA EXPORTS
// =====================================

// Grade Levels
export const GradeLevelsSupportedZod = createZodEnum(GradeLevels);
export type GradeLevelsSupported = z.infer<typeof GradeLevelsSupportedZod>;

// Subjects
export const SubjectsZod = createZodEnum(Subjects);
export type SubjectsType = z.infer<typeof SubjectsZod>;

// Special Groups
export const SpecialGroupsZod = createZodEnum(SpecialGroups);
export type SpecialGroupsType = z.infer<typeof SpecialGroupsZod>;

// Day Types
export const DayTypeZod = createZodEnum(DayTypes);
export type DayType = z.infer<typeof DayTypeZod>;

// Block Day Types
export const BlockDayTypeZod = createZodEnum(BlockDayTypes);
export type BlockDayType = z.infer<typeof BlockDayTypeZod>;

// Bell Schedule Types
export const BellScheduleTypeZod = createZodEnum(BellScheduleTypes);
export type BellScheduleType = z.infer<typeof BellScheduleTypeZod>;

// Period Types
export const PeriodTypeZod = createZodEnum(PeriodTypes);
export type PeriodType = z.infer<typeof PeriodTypeZod>;

export const ScheduleAssignmentTypeZod = createZodEnum(ScheduleAssignment);
export type ScheduleAssignmentType = z.infer<typeof ScheduleAssignmentTypeZod>;

// Duration - special case with transformation
export const DurationZod = createZodEnum(Duration);
// export const DurationZod = RawDurationZod.transform((val) => Number(val));
export const DurationValues = Object.values(Duration);
export type DurationType = z.infer<typeof DurationZod>; // This will be a number type

// Roles NYCPS
export const RolesNYCPSZod = createZodEnum(RolesNYCPS);
export type RolesNYCPSType = z.infer<typeof RolesNYCPSZod>;

// Roles TL
export const RolesTLZod = createZodEnum(RolesTL);
export type RolesTLType = z.infer<typeof RolesTLZod>;

// Admin Levels
export const AdminLevelZod = createZodEnum(AdminLevels);
export type AdminLevel = z.infer<typeof AdminLevelZod>;

// Note Types
export const NoteTypeZod = createZodEnum(NoteTypes);
export type NoteType = z.infer<typeof NoteTypeZod>;

// IPG Indicators
export const IPGIndicatorZod = createZodEnum(IPGIndicators);
export type IPGIndicator = z.infer<typeof IPGIndicatorZod>;

// Implementation Indicators
export const ImplementationIndicatorZod = createZodEnum(ImplementationIndicators);
export type ImplementationIndicator = z.infer<typeof ImplementationIndicatorZod>;

// Support Cycle Types
export const SupportCycleTypeZod = createZodEnum(SupportCycleTypes);
export type SupportCycleType = z.infer<typeof SupportCycleTypeZod>;

// Session Purposes
export const SessionPurposeZod = createZodEnum(SessionPurposes);
export type SessionPurpose = z.infer<typeof SessionPurposeZod>;

// Allowed Purposes
export const AllowedPurposeZod = createZodEnum(AllowedPurposes);
export type AllowedPurpose = z.infer<typeof AllowedPurposeZod>;

// Mode Done
export const ModeDoneZod = createZodEnum(ModeDone);
export type ModeDoneType = z.infer<typeof ModeDoneZod>;

// Reason Done
export const ReasonDoneZod = createZodEnum(ReasonDone);
export type ReasonDoneType = z.infer<typeof ReasonDoneZod>;

// Total Duration
export const TotalDurationZod = createZodEnum(TotalDuration);
export type TotalDurationType = z.infer<typeof TotalDurationZod>;

// SOLVES Touchpoint
export const SolvesTouchpointZod = createZodEnum(SolvesTouchpoint);
export type SolvesTouchpointType = z.infer<typeof SolvesTouchpointZod>;

// =====================================
// MONGOOSE MODEL EXPORTS
// =====================================

// Mongoose-compatible exports - using the same enum definitions
// These exports match the names you're using in Mongoose models
export { GradeLevels as AllowedGradeEnum };
export { Subjects as AllowedSubjectsEnum };
export { SpecialGroups as AllowedSpecialGroupsEnum };
export { RolesNYCPS as AllowedRolesNYCPSEnum };
export { RolesTL as AllowedRolesTLEnum };
export { AdminLevels as TLAdminTypeEnum };
export { DayTypes as DayTypeEnum };
export { BlockDayTypes as BlockDayTypeEnum };
export { BellScheduleTypes as BellScheduleTypesEnum };
export { PeriodTypes as PeriodTypesEnum };
export { ModeDone as SettingTypesEnum };
export { ReasonDone as YesNoEnum };
export { TotalDuration as LengthTypeEnum };
export { SolvesTouchpoint as TeacherLeaderTypeEnum };
export { AllowedPurposes as AllowedPurposeEnum };

// Duration requires special handling for Mongoose
// In Mongoose models, you should use:
// 1. For schema definition: Object.values(Duration)
// 2. For type safe enums in code: DurationTypesEnum

// Define a numeric enum for Mongoose
export enum DurationTypesEnum {
  MIN_15 = 15,
  MIN_30 = 30,
  MIN_45 = 45,
  MIN_60 = 60,
  MIN_75 = 75,
  MIN_90 = 90,
}

// Helper to convert between string and number durations
export const DurationConverter = {
  // Convert the string enum value to number for Mongoose
  toMongoose: (value: keyof typeof Duration): number => {
    return Number(Duration[value]);
  },
  
  // Convert the number from Mongoose to string enum value for Zod
  toZod: (value: number): keyof typeof Duration => {
    const stringValue = String(value);
    // Find the enum key that has this string value
    const entry = Object.entries(Duration).find(([_, val]) => val === stringValue);
    if (!entry) throw new Error(`Invalid duration value: ${value}`);
    return entry[0] as keyof typeof Duration;
  }
};

// =====================================
// METADATA FOR TYPE HANDLING
// =====================================

/**
 * Enum metadata to assist with type handling between systems
 */
export const EnumMetadata = {
  Duration: {
    zodType: 'string',  // What Zod expects for validation
    mongooseType: 'number', // What Mongoose stores
    // How to convert between them:
    toMongoose: (val: string) => Number(val),
    toZod: (val: number) => String(val)
  }
};