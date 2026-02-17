// src/lib/zod-schema/schedules/schedule-documents.ts
import { z } from "zod";
import { BellScheduleTypeZod } from "@enums";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";
import {
  BellScheduleBlockSchema,
  TeacherScheduleBlockSchema,
  VisitScheduleBlockSchema,
} from "./schedule-events";

// =====================================
// SHARED SCHEMAS
// =====================================

export const DayIndexZod = z.number().min(0).max(4);
export type DayIndex = z.infer<typeof DayIndexZod>;

const BaseScheduleFields = BaseDocumentSchema.extend({
  schoolId: z.string().describe("Reference to School document _id"),
  dayIndices: z
    .array(DayIndexZod)
    .describe(
      "Days when this schedule applies: [0,1,2,3,4] for M-F, [4] for Friday early release",
    ),
});

// =====================================
// FULL SCHEMAS (USER DATA ONLY)
// =====================================

export const BellScheduleZodSchema = BaseScheduleFields.extend({
  scheduleType: z.literal("bellSchedule"),
  name: z
    .string()
    .describe("Schedule name: 'Regular Day', 'Mon/Wed Block', 'A Day', etc."),
  bellScheduleType: BellScheduleTypeZod.describe("Schedule pattern type"),
  timeBlocks: z
    .array(BellScheduleBlockSchema)
    .describe("Array of bell schedule time blocks"),
});

export const TeacherScheduleZodSchema = BaseScheduleFields.extend({
  scheduleType: z.literal("teacherSchedule"),
  teacherId: z.string().describe("Reference to Staff document _id"),
  bellScheduleId: z
    .string()
    .describe("References which bell schedule this follows"),
  timeBlocks: z
    .array(TeacherScheduleBlockSchema)
    .describe("Period assignments for the specified days"),
});

export const VisitScheduleZodSchema = BaseScheduleFields.extend({
  scheduleType: z.literal("visitSchedule"),
  date: z.string().optional().describe("ISO string for system timestamp"),
  coachingActionPlanId: z.string().describe("Reference to primary aggregate"),
  coachId: z.string().describe("Reference to coach Staff document _id"),
  bellScheduleId: z
    .string()
    .describe("References school's bell schedule for period timing"),
  timeBlocks: z
    .array(VisitScheduleBlockSchema)
    .describe("Flat array of visit time blocks"),
});

// =====================================
// INPUT SCHEMAS
// =====================================

export const BellScheduleInputZodSchema = toInputSchema(BellScheduleZodSchema);
export const TeacherScheduleInputZodSchema = toInputSchema(
  TeacherScheduleZodSchema,
);
export const VisitScheduleInputZodSchema = toInputSchema(
  VisitScheduleZodSchema,
);

// =====================================
// TYPE GENERATION
// =====================================

export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type VisitSchedule = z.infer<typeof VisitScheduleZodSchema>;

export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
export type TeacherScheduleInput = z.infer<
  typeof TeacherScheduleInputZodSchema
>;
export type VisitScheduleInput = z.infer<typeof VisitScheduleInputZodSchema>;

// =====================================
// REFERENCE SCHEMAS
// =====================================

export const BellScheduleReferenceSchema = BaseReferenceZodSchema.extend({
  scheduleType: z.literal("bellSchedule"),
  schoolId: z.string().optional(),
  bellScheduleType: BellScheduleTypeZod.optional(),
  schoolName: z.string().optional(),
  blocksCount: z.number().optional(),
});

export const TeacherScheduleReferenceSchema = BaseReferenceZodSchema.extend({
  scheduleType: z.literal("teacherSchedule"),
  teacherId: z.string().optional(),
  schoolId: z.string().optional(),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
  periodsCount: z.number().optional(),
});

export const VisitScheduleReferenceSchema = BaseReferenceZodSchema.extend({
  scheduleType: z.literal("visitSchedule"),
  coachId: z.string().optional(),
  schoolId: z.string().optional(),
  date: z.string().optional(),
  coachName: z.string().optional(),
  schoolName: z.string().optional(),
  eventsCount: z.number().optional(),
  dateFormatted: z.string().optional(),
});

export const ScheduleReferenceSchema = z.discriminatedUnion("scheduleType", [
  BellScheduleReferenceSchema,
  TeacherScheduleReferenceSchema,
  VisitScheduleReferenceSchema,
]);

export type BellScheduleReference = z.infer<typeof BellScheduleReferenceSchema>;
export type TeacherScheduleReference = z.infer<
  typeof TeacherScheduleReferenceSchema
>;
export type VisitScheduleReference = z.infer<
  typeof VisitScheduleReferenceSchema
>;
export type ScheduleReference = z.infer<typeof ScheduleReferenceSchema>;

// =====================================
// REFERENCE TRANSFORMERS
// =====================================

export function bellScheduleToReference(
  schedule: BellSchedule,
): BellScheduleReference {
  return {
    _id: schedule._id,
    value: schedule._id,
    label: `${schedule.name} (${schedule.bellScheduleType})`,
    scheduleType: "bellSchedule",
    schoolId: schedule.schoolId,
    bellScheduleType: schedule.bellScheduleType,
    blocksCount: schedule.timeBlocks?.length || 0,
  };
}

export function teacherScheduleToReference(
  schedule: TeacherSchedule,
): TeacherScheduleReference {
  return {
    _id: schedule._id,
    value: schedule._id,
    label: "Teacher Schedule",
    scheduleType: "teacherSchedule",
    schoolId: schedule.schoolId,
    teacherId: schedule.teacherId,
    periodsCount: schedule.timeBlocks?.length || 0,
  };
}

export function visitScheduleToReference(
  schedule: VisitSchedule,
): VisitScheduleReference {
  return {
    _id: schedule._id,
    value: schedule._id,
    label: `Visit - ${schedule.date}`,
    scheduleType: "visitSchedule",
    schoolId: schedule.schoolId,
    coachId: schedule.coachId,
    date: schedule.date,
    eventsCount: schedule.timeBlocks?.length || 0,
    dateFormatted: schedule.date
      ? new Date(schedule.date).toLocaleDateString()
      : undefined,
  };
}

export function schedulesToReferences(
  schedules: BellSchedule[] | TeacherSchedule[] | VisitSchedule[],
): ScheduleReference[] {
  return schedules.map((schedule) => {
    switch (schedule.scheduleType) {
      case "bellSchedule":
        return bellScheduleToReference(schedule);
      case "teacherSchedule":
        return teacherScheduleToReference(schedule);
      case "visitSchedule":
        return visitScheduleToReference(schedule);
    }
  });
}
