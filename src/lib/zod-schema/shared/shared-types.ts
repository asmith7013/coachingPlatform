import { z } from "zod";

// ✅ Grade Levels Supported Enum
export const GradeLevelsSupportedZod = z.enum([
  "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
]);

// ✅ Subjects Enum
export const SubjectsZod = z.enum([
  "Math 6", "Math 7", "Math 8", "Algebra I", "Geometry", "Algebra II"
]);

// ✅ Special Groups Enum
export const SpecialGroupsZod = z.enum(["SPED", "ELL"]);

// ✅ Day Type Enum
export const DayTypeZod = z.enum([
  "uniform", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "A", "B", "C"
]);

// ✅ Block Day Type Enum
export const BlockDayTypeZod = z.enum(["A", "B", "C"]);

// ✅ Bell Schedule Type Enum
export const BellScheduleTypeZod = z.enum(["uniform", "weeklyCycle", "abcCycle"]);

// ✅ Period Type Enum
export const PeriodTypeZod = z.enum(["class", "prep", "lunch", "meeting"]);


// ✅ Duration Enum
export const DurationZod = z.enum(["15", "30", "45", "60", "75", "90"]).transform((val) => Number(val));
// ✅ Event Type Enum
export const EventTypeZod = z.enum(["observation", "debrief"]);

// ✅ Roles in NYC Public Schools
export const RolesNYCPSZod = z.enum([
    "Teacher", 
    "Principal", 
    "AP", 
    "Coach", 
    "Administrator"
  ]);
  
  // ✅ Roles in Teaching Lab
  export const RolesTLZod = z.enum([
    "Coach", 
    "CPM", 
    "Director", 
    "Senior Director"
  ]);
  
  // ✅ Admin Level Enum
  export const AdminLevelZod = z.enum([
    "Coach", 
    "Manager", 
    "CPM", 
    "Director", 
    "Senior Director"
  ]);

// ✅ Auto-generate TypeScript Types
export type GradeLevelsSupported = z.infer<typeof GradeLevelsSupportedZod>;
export type Subjects = z.infer<typeof SubjectsZod>;
export type SpecialGroups = z.infer<typeof SpecialGroupsZod>;
export type DayType = z.infer<typeof DayTypeZod>;
export type BlockDayType = z.infer<typeof BlockDayTypeZod>;
export type BellScheduleType = z.infer<typeof BellScheduleTypeZod>;
export type PeriodType = z.infer<typeof PeriodTypeZod>;
export type Duration = z.infer<typeof DurationZod>;
export type EventType = z.infer<typeof EventTypeZod>;
export type RolesNYCPS = z.infer<typeof RolesNYCPSZod>;
export type RolesTL = z.infer<typeof RolesTLZod>;
export type AdminLevel = z.infer<typeof AdminLevelZod>;