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
  GRADE_1 = "1st Grade",      // ✅ Changed from "Grade 1"
  GRADE_2 = "2nd Grade",      // ✅ Changed from "Grade 2" 
  GRADE_3 = "3rd Grade",      // ✅ Changed from "Grade 3"
  GRADE_4 = "4th Grade",      // ✅ Changed from "Grade 4"
  GRADE_5 = "5th Grade",      // ✅ Changed from "Grade 5"
  GRADE_6 = "6th Grade",      // ✅ Changed from "Grade 6"
  GRADE_7 = "7th Grade",      // ✅ Changed from "Grade 7"
  GRADE_8 = "8th Grade",      // ✅ Changed from "Grade 8"
  GRADE_9 = "9th Grade",      // ✅ Changed from "Grade 9"
  GRADE_10 = "10th Grade",    // ✅ Changed from "Grade 10"
  GRADE_11 = "11th Grade",    // ✅ Changed from "Grade 11"
  GRADE_12 = "12th Grade",    // ✅ Changed from "Grade 12"
  ALGEBRA_I = "Algebra I",
  ALGEBRA_II = "Algebra II", 
  GEOMETRY = "Geometry",
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
  DUTY = "duty"
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
 * IPG Core Actions (High-level focus areas)
 */
export enum IPGCoreActions {
  CA1 = "CA1", // Ensure the work reflects Focus, Coherence, and Rigor
  CA2 = "CA2", // Employ instructional practices for all students  
  CA3 = "CA3"  // Provide opportunities for mathematical practices
}

/**
 * IPG Sub Categories (Specific areas within each core action)
 */
export enum IPGSubCategories {
  // CA1 sections
  CA1A = "CA1A", // Grade-level cluster focus
  CA1B = "CA1B", // Relates new content to prior math
  CA1C = "CA1C", // Targets appropriate rigor aspects
  
  // CA2 sections  
  CA2A = "CA2A", // Makes mathematics explicit
  CA2B = "CA2B", // Strategically shares student representations
  
  // CA3 sections
  CA3A = "CA3A", // Grade-level problems and exercises
  CA3B = "CA3B", // Cultivates reasoning and problem solving
  CA3C = "CA3C", // Prompts students to explain thinking
  CA3D = "CA3D", // Creates conditions for student conversations
  CA3E = "CA3E"  // Connects informal to precise mathematical language
}

/**
 * IPG Indicators (Legacy - maintained for backward compatibility)
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
 * Implementation Experience Levels (Parent Categories for Hierarchical Coaching Log)
 */
export enum ImplementationExperience {
  FIRST_YEAR = "First year of Implementation",
  EXPERIENCED = "Experienced with Implementation"
}

/**
 * Primary Strategy Categories (Parent Categories for Hierarchical Coaching Log)
 */
export enum PrimaryStrategyCategory {
  PREPARING = "Preparing to Teach",
  IN_CLASS = "In-class support", 
  PROFESSIONAL = "Professional Learning",
  COLLABORATION = "Sustaining Teacher-Led Collaboration"
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

/**
 * Metric Collection Methods
 */
export enum MetricCollectionMethods {
  OBSERVATION = "observation",
  STUDENT_WORK_ANALYSIS = "student_work_analysis", 
  ASSESSMENT_DATA = "assessment_data",
  INTERVIEW = "interview",
  SURVEY = "survey",
  DOCUMENTATION_REVIEW = "documentation_review",
  SELF_REFLECTION = "self_reflection",
  OTHER = "other"
}

/**
 * Visit Status for Coaching Plans
 */
export enum VisitStatuses {
  PLANNED = "planned",
  COMPLETED = "completed", 
  CANCELLED = "cancelled",
  RESCHEDULED = "rescheduled"
}

/**
 * Coaching Cycle Numbers
 */
export enum CoachingCycleNumbers {
  CYCLE_1 = "1",
  CYCLE_2 = "2",
  CYCLE_3 = "3"
}

/**
 * Visit Numbers within a Cycle
 */
export enum VisitNumbers {
  VISIT_1 = "1",
  VISIT_2 = "2",
  VISIT_3 = "3"
}

/**
 * Coaching Action Plan Status
 */
export enum CoachingActionPlanStatuses {
  DRAFT = "draft",
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

/**
 * Evidence Types
 */
export enum EvidenceTypes {
  WRITTEN_SUMMARY = "written_summary",
  LINK = "link",
  DOCUMENT = "document",
  PHOTO = "photo",
  VIDEO = "video"
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
  LEADER_SUPPORT = "Leader support only",
  TEACHER_OR_LEADER = "Teacher OR teacher & leader support",
}

/**
 * NYC Solves Admin Meeting Types
 */
export enum NYCSolvesAdmin {
  YES_TEACHER_SUPPORT = "Yes - debriefed teacher support only",
  YES_LEADER_SUPPORT = "Yes - provided leader specific support",
  NO = "No"
}

/**
 * Admin Meeting Completion Status
 */
export enum AdminDone {
  YES = "Yes",
  NO = "No"
}

/**
 * Teacher Support Types
 */
export enum TeacherSupportTypes {
  SPECIAL_ED = "Special Education Teachers", 
  ENL_ELL = "English as New Language or English Language Learner Teachers",
  BILINGUAL_DUAL = "Bilingual/Dual Language Teachers",
  NONE_OF_ABOVE = "None of the above"
}

/**
 * Academic Years
 */
export enum AcademicYears {
  YEAR_2021_2022 = "2021-2022",
  YEAR_2022_2023 = "2022-2023", 
  YEAR_2023_2024 = "2023-2024",
  YEAR_2024_2025 = "2024-2025",
  YEAR_2025_2026 = "2025-2026",
  YEAR_2026_2027 = "2026-2027",
  YEAR_2027_2028 = "2027-2028",
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Creates a Zod enum from a TypeScript enum
 */
export function createZodEnum<T extends Record<string, string>>(enumObj: T) {
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

// IPG Core Actions
export const IPGCoreActionZod = createZodEnum(IPGCoreActions);
export type IPGCoreAction = z.infer<typeof IPGCoreActionZod>;

// IPG Sub Categories
export const IPGSubCategoryZod = createZodEnum(IPGSubCategories);
export type IPGSubCategory = z.infer<typeof IPGSubCategoryZod>;

// IPG Indicators (Legacy)
export const IPGIndicatorZod = createZodEnum(IPGIndicators);
export type IPGIndicator = z.infer<typeof IPGIndicatorZod>;

// Metric Collection Methods
export const MetricCollectionMethodZod = createZodEnum(MetricCollectionMethods);
export type MetricCollectionMethod = z.infer<typeof MetricCollectionMethodZod>;

// Visit Statuses
export const VisitStatusZod = createZodEnum(VisitStatuses);
export type VisitStatus = z.infer<typeof VisitStatusZod>;

// Coaching Cycle Numbers
export const CoachingCycleNumberZod = createZodEnum(CoachingCycleNumbers);
export type CoachingCycleNumber = z.infer<typeof CoachingCycleNumberZod>;

// Visit Numbers
export const VisitNumberZod = createZodEnum(VisitNumbers);
export type VisitNumber = z.infer<typeof VisitNumberZod>;

// Coaching Action Plan Statuses
export const CoachingActionPlanStatusZod = createZodEnum(CoachingActionPlanStatuses);
export type CoachingActionPlanStatus = z.infer<typeof CoachingActionPlanStatusZod>;

// Evidence Types
export const EvidenceTypeZod = createZodEnum(EvidenceTypes);
export type EvidenceType = z.infer<typeof EvidenceTypeZod>;

// Implementation Indicators
export const ImplementationIndicatorZod = createZodEnum(ImplementationIndicators);
export type ImplementationIndicator = z.infer<typeof ImplementationIndicatorZod>;

// Implementation Experience
export const ImplementationExperienceZod = createZodEnum(ImplementationExperience);
export type ImplementationExperienceType = z.infer<typeof ImplementationExperienceZod>;

// Primary Strategy Category
export const PrimaryStrategyCategoryZod = createZodEnum(PrimaryStrategyCategory);
export type PrimaryStrategyCategoryType = z.infer<typeof PrimaryStrategyCategoryZod>;

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

export const NYCSolvesAdminZod = createZodEnum(NYCSolvesAdmin);
export type NYCSolvesAdminType = z.infer<typeof NYCSolvesAdminZod>;

export const AdminDoneZod = createZodEnum(AdminDone);
export type AdminDoneType = z.infer<typeof AdminDoneZod>;

// Teacher Support Types
export const TeacherSupportTypesZod = createZodEnum(TeacherSupportTypes);
export type TeacherSupportType = z.infer<typeof TeacherSupportTypesZod>;

// Academic Year
export const AcademicYearZod = z.enum([
  AcademicYears.YEAR_2021_2022,
  AcademicYears.YEAR_2022_2023,
  AcademicYears.YEAR_2023_2024,
  AcademicYears.YEAR_2024_2025,
  AcademicYears.YEAR_2025_2026,
  AcademicYears.YEAR_2026_2027,
  AcademicYears.YEAR_2027_2028,
]);
export type AcademicYear = z.infer<typeof AcademicYearZod>;

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
export { NYCSolvesAdmin as NYCSolvesAdminEnum };
export { AdminDone as AdminDoneEnum };
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