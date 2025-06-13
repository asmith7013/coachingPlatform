import type { Field } from '@ui-types/form';
import type { ClassroomObservationNoteInput } from "@zod-schema/observations/classroom-observation";
import { set } from 'lodash';

/**
 * Simple field configuration for Classroom Observation forms
 * Following the new domain-specific pattern
 */
export const ClassroomObservationFieldConfig: Field<ClassroomObservationNoteInput>[] = [
  // Basic Information
  {
    name: "cycle",
    label: "Cycle",
    type: "text",
    placeholder: "Enter cycle name",
  },
  {
    name: "session",
    label: "Session",
    type: "text",
    placeholder: "Enter session name",
  },
  {
    name: "date",
    label: "Date",
    type: "date",
  },
  {
    name: "teacherId",
    label: "Teacher",
    type: "reference",
    url: "/api/staff?role=teacher",
  },
  {
    name: "coachId",
    label: "Coach",
    type: "reference",
    url: "/api/staff?role=coach",
  },
  {
    name: "schoolId",
    label: "School",
    type: "reference",
    url: "/api/schools",
  },
  {
    name: "visitId",
    label: "Visit",
    type: "reference",
    url: "/api/visits",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "reviewed", label: "Reviewed" }
    ]
  },
  {
    name: "isSharedWithTeacher",
    label: "Share with Teacher",
    type: "checkbox",
  },
  
  // Lesson Details
  {
    name: "lesson.title" as keyof ClassroomObservationNoteInput,
    label: "Lesson Title",
    type: "text",
    placeholder: "Enter lesson title",
  },
  {
    name: "lesson.course" as keyof ClassroomObservationNoteInput,
    label: "Course",
    type: "text",
    placeholder: "Enter course name",
  },
  {
    name: "lesson.unit" as keyof ClassroomObservationNoteInput,
    label: "Unit",
    type: "text",
    placeholder: "Enter unit name",
  },
  {
    name: "lesson.lessonNumber" as keyof ClassroomObservationNoteInput,
    label: "Lesson Number",
    type: "text",
    placeholder: "Enter lesson number",
  },
  {
    name: "otherContext",
    label: "Other Context",
    type: "textarea",
    placeholder: "Additional context or notes",
  },
  {
    name: "learningTargets",
    label: "Learning Targets",
    type: "textarea",
    placeholder: "Enter learning targets (one per line)",
  },
  {
    name: "coolDown",
    label: "Cool Down",
    type: "textarea",
    placeholder: "Cool down activity or notes",
  },
  
  // Lesson Flow - Warm Up
  {
    name: "lessonFlow.warmUp.launch" as keyof ClassroomObservationNoteInput,
    label: "Warm Up - Launch",
    type: "textarea",
  },
  {
    name: "lessonFlow.warmUp.workTime" as keyof ClassroomObservationNoteInput,
    label: "Warm Up - Work Time",
    type: "textarea",
  },
  {
    name: "lessonFlow.warmUp.synthesis" as keyof ClassroomObservationNoteInput,
    label: "Warm Up - Synthesis",
    type: "textarea",
  },
  
  // Lesson Flow - Activity 1
  {
    name: "lessonFlow.activity1.launch" as keyof ClassroomObservationNoteInput,
    label: "Activity 1 - Launch",
    type: "textarea",
  },
  {
    name: "lessonFlow.activity1.workTime" as keyof ClassroomObservationNoteInput,
    label: "Activity 1 - Work Time",
    type: "textarea",
  },
  {
    name: "lessonFlow.activity1.synthesis" as keyof ClassroomObservationNoteInput,
    label: "Activity 1 - Synthesis",
    type: "textarea",
  },
  
  // Lesson Flow - Synthesis
  {
    name: "lessonFlow.lessonSynthesis.launch" as keyof ClassroomObservationNoteInput,
    label: "Lesson Synthesis - Launch",
    type: "textarea",
  },
  {
    name: "lessonFlow.lessonSynthesis.workTime" as keyof ClassroomObservationNoteInput,
    label: "Lesson Synthesis - Work Time",
    type: "textarea",
  },
  {
    name: "lessonFlow.lessonSynthesis.synthesis" as keyof ClassroomObservationNoteInput,
    label: "Lesson Synthesis - Synthesis",
    type: "textarea",
  },
  
  // Progress Monitoring & Time Tracking
  {
    name: "progressMonitoring.overallNotes" as keyof ClassroomObservationNoteInput,
    label: "Progress Monitoring Notes",
    type: "textarea",
    placeholder: "Overall progress monitoring observations",
  },
  {
    name: "timeTracking.classStartTime" as keyof ClassroomObservationNoteInput,
    label: "Class Start Time",
    type: "text",
    placeholder: "e.g., 08:00",
  },
  {
    name: "timeTracking.classEndTime" as keyof ClassroomObservationNoteInput,
    label: "Class End Time",
    type: "text",
    placeholder: "e.g., 09:00",
  }
];

// Export subsets for complex nested forms if needed
export const LessonFieldConfig = ClassroomObservationFieldConfig.filter((field: Field<ClassroomObservationNoteInput>) => 
  String(field.name).startsWith('lesson.')
);

export const LessonFlowFieldConfig = ClassroomObservationFieldConfig.filter((field: Field<ClassroomObservationNoteInput>) =>
  String(field.name).startsWith('lessonFlow.')
);

/**
 * Helper function to handle nested field updates in classroom observation forms
 */
export function updateNestedObservationField(
  data: Partial<ClassroomObservationNoteInput>,
  fieldKey: string,
  value: unknown
): Partial<ClassroomObservationNoteInput> {
  const result = { ...data };
  
  // Handle nested field paths (e.g., "lesson.title", "lessonFlow.warmUp.launch")
  if (fieldKey.includes('.')) {
    set(result, fieldKey, value);
  } else {
    (result as Record<string, unknown>)[fieldKey] = value;
  }
  
  return result;
}

// Alias for backward compatibility
export const observationFields = ClassroomObservationFieldConfig; 