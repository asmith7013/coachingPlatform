import { z } from "zod";
import { zDateField } from '@zod-schema/shared/dateHelpers';
import { TimeSlotZodSchema, ScheduleAssignmentTypeZod } from './planned-visit';

// Teacher Selection State Schema
export const TeacherSelectionStateZodSchema = z.object({
  teacherId: z.string(),
  isSelected: z.boolean(),
  selectedAt: zDateField.optional(), // When teacher was selected
  selectionOrder: z.number().optional(), // Order of selection for UX feedback
});

// Assignment State Schema
export const AssignmentStateZodSchema = z.object({
  teacherId: z.string(),
  timeSlot: TimeSlotZodSchema,
  purpose: z.string().optional(), // May be assigned later
  assignmentType: ScheduleAssignmentTypeZod,
  isTemporary: z.boolean().default(true), // Whether assignment is temporary (drag preview)
  assignedAt: zDateField.optional(), // When assignment was made
});

// Teacher Accountability State Schema
export const TeacherAccountabilityStateZodSchema = z.object({
  teacherId: z.string(),
  isScheduled: z.boolean(), // Whether teacher has been scheduled
  isCrossedOff: z.boolean().default(false), // Whether marked as "not needed"
  isCompleted: z.boolean().default(false), // Whether coverage is complete
  notes: z.string().optional(), // Optional accountability notes
});

// Schedule Builder UI State Schema
export const ScheduleBuilderUIStateZodSchema = z.object({
  // Selection state
  selectedTeachers: z.array(TeacherSelectionStateZodSchema),
  multiSelectMode: z.boolean().default(false),
  
  // Assignment state
  activeAssignments: z.array(AssignmentStateZodSchema),
  dragState: z.object({
    isDragging: z.boolean(),
    draggedTeacherId: z.string().optional(),
    hoveredTimeSlot: TimeSlotZodSchema.optional(),
    hoveredZone: ScheduleAssignmentTypeZod.optional(),
  }).optional(),
  
  // Accountability tracking
  teacherAccountability: z.array(TeacherAccountabilityStateZodSchema),
  
  // UI preferences
  showAccountabilityGrid: z.boolean().default(true),
  autoAssignPurposes: z.boolean().default(false),
  
  // Unsaved changes tracking
  hasUnsavedChanges: z.boolean().default(false),
  lastSavedAt: zDateField.optional(),
});

// Visit Schedule Builder State Schema (main container)
export const VisitScheduleBuilderStateZodSchema = z.object({
  // Context information
  date: zDateField, // Planning date
  school: z.string(), // School ID
  coach: z.string(), // Coach ID
  
  // Builder state
  uiState: ScheduleBuilderUIStateZodSchema,
  
  // Session metadata
  sessionId: z.string().optional(), // Unique session ID for state tracking
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
  
  // Persistence flags
  isPersisted: z.boolean().default(false), // Whether state is saved to server
  isLocalBackup: z.boolean().default(false), // Whether this is a local storage backup
});

// Purpose Options Schema (for dropdown management)
export const PurposeOptionsZodSchema = z.object({
  predefinedPurposes: z.array(z.string()), // Standard coaching purposes
  customPurposes: z.array(z.string()), // User-defined purposes
  recentPurposes: z.array(z.string()), // Recently used purposes
  defaultPurpose: z.string().optional(), // Coach's default purpose
});

// Auto-generate TypeScript types
export type TeacherSelectionState = z.infer<typeof TeacherSelectionStateZodSchema>;
export type AssignmentState = z.infer<typeof AssignmentStateZodSchema>;
export type TeacherAccountabilityState = z.infer<typeof TeacherAccountabilityStateZodSchema>;
export type ScheduleBuilderUIState = z.infer<typeof ScheduleBuilderUIStateZodSchema>;
export type VisitScheduleBuilderState = z.infer<typeof VisitScheduleBuilderStateZodSchema>;
export type PurposeOptions = z.infer<typeof PurposeOptionsZodSchema>; 