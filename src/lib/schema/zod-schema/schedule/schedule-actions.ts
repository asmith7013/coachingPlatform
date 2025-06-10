// src/lib/schema/zod-schema/schedule/schedule-actions.ts
import { z } from 'zod';
import { ScheduleAssignmentTypeZod, SessionPurposeZod } from '@enums';
import { EventItemZodSchema } from '@zod-schema/visits/visit';

/**
 * Schema for visit creation data in schedule builder
 */
export const VisitCreationDataSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  periodNumber: z.number().int().min(1).max(10),
  portion: ScheduleAssignmentTypeZod,
  purpose: SessionPurposeZod
});

/**
 * Schema for visit update operations in schedule builder
 */
export const VisitUpdateDataSchema = z.object({
  purpose: SessionPurposeZod.optional(),
  portion: ScheduleAssignmentTypeZod.optional(),
  events: z.array(EventItemZodSchema).optional()
});

/**
 * Schema for conflict detection data
 */
export const ConflictCheckDataSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  periodNumber: z.number().int().min(1).max(10),
  portion: ScheduleAssignmentTypeZod
});

/**
 * Schema for teacher-period queries
 */
export const TeacherPeriodQuerySchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  period: z.number().int().min(1).max(10)
});

/**
 * Schema for visit ID validation (handles both visit IDs and event IDs)
 */
export const VisitIdSchema = z.string().min(1, "Visit ID is required");

/**
 * Schema for event-specific operations
 */
export const EventOperationSchema = z.object({
  visitId: z.string().min(1),
  eventIndex: z.number().int().min(0),
  purpose: SessionPurposeZod.optional(),
});

// ===== DERIVED TYPES =====
export type VisitCreationData = z.infer<typeof VisitCreationDataSchema>;
export type VisitUpdateData = z.infer<typeof VisitUpdateDataSchema>;
export type ConflictCheckData = z.infer<typeof ConflictCheckDataSchema>;
export type TeacherPeriodQuery = z.infer<typeof TeacherPeriodQuerySchema>;
export type EventOperation = z.infer<typeof EventOperationSchema>;

// ===== VALIDATION HELPERS =====
export const validateVisitCreation = (data: unknown) => VisitCreationDataSchema.safeParse(data);
export const validateVisitUpdate = (data: unknown) => VisitUpdateDataSchema.safeParse(data);
export const validateConflictCheck = (data: unknown) => ConflictCheckDataSchema.safeParse(data);
export const validateTeacherPeriodQuery = (data: unknown) => TeacherPeriodQuerySchema.safeParse(data);
export const validateVisitId = (id: unknown) => VisitIdSchema.safeParse(id); 