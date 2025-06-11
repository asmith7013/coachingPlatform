import { createFormFields } from '@/lib/ui/forms/tanstack/factory/field-factory';
import { ClassroomObservationNoteInputZodSchema, ClassroomObservationNoteInput } from "@zod-schema/observations/classroom-observation";
import { set } from 'lodash';

/**
 * Schema-derived field configuration for Classroom Observation forms
 * Uses createFormFields factory with ClassroomObservationNoteInputZodSchema
 * Follows established domain-organized configuration pattern
 */
export const observationFields = createFormFields(ClassroomObservationNoteInputZodSchema, {
  fieldOrder: [
    // Basic Information
    "cycle", "session", "date", "teacherId", "coachId", "schoolId", "visitId", "status", "isSharedWithTeacher",
    
    // Lesson Details  
    "lesson.title", "lesson.course", "lesson.unit", "lesson.lessonNumber", "otherContext", "learningTargets", "coolDown",
    
    // Lesson Flow - Warm Up
    "lessonFlow.warmUp.launch", "lessonFlow.warmUp.workTime", "lessonFlow.warmUp.synthesis",
    
    // Lesson Flow - Activity 1
    "lessonFlow.activity1.launch", "lessonFlow.activity1.workTime", "lessonFlow.activity1.synthesis",
    
    // Lesson Flow - Synthesis
    "lessonFlow.lessonSynthesis.launch", "lessonFlow.lessonSynthesis.workTime", "lessonFlow.lessonSynthesis.synthesis",
    
    // Progress Monitoring & Time Tracking
    "progressMonitoring.overallNotes", "timeTracking.classStartTime", "timeTracking.classEndTime"
  ],
  labels: {
    cycle: "Cycle",
    session: "Session", 
    date: "Date",
    teacherId: "Teacher",
    coachId: "Coach",
    schoolId: "School",
    visitId: "Visit",
    status: "Status",
    isSharedWithTeacher: "Share with Teacher",
    
    "lesson.title": "Lesson Title",
    "lesson.course": "Course",
    "lesson.unit": "Unit", 
    "lesson.lessonNumber": "Lesson Number",
    otherContext: "Other Context",
    learningTargets: "Learning Targets",
    coolDown: "Cool Down",
    
    "lessonFlow.warmUp.launch": "Warm Up - Launch",
    "lessonFlow.warmUp.workTime": "Warm Up - Work Time",
    "lessonFlow.warmUp.synthesis": "Warm Up - Synthesis",
    
    "lessonFlow.activity1.launch": "Activity 1 - Launch",
    "lessonFlow.activity1.workTime": "Activity 1 - Work Time",
    "lessonFlow.activity1.synthesis": "Activity 1 - Synthesis",
    
    "lessonFlow.lessonSynthesis.launch": "Lesson Synthesis - Launch",
    "lessonFlow.lessonSynthesis.workTime": "Lesson Synthesis - Work Time",
    "lessonFlow.lessonSynthesis.synthesis": "Lesson Synthesis - Synthesis",
    
    "progressMonitoring.overallNotes": "Progress Monitoring Notes",
    "timeTracking.classStartTime": "Class Start Time",
    "timeTracking.classEndTime": "Class End Time"
  },
  placeholders: {
    cycle: "Enter cycle name",
    session: "Enter session name",
    "lesson.title": "Enter lesson title",
    "lesson.course": "Enter course name",
    "lesson.unit": "Enter unit name",
    "lesson.lessonNumber": "Enter lesson number",
    otherContext: "Additional context or notes",
    learningTargets: "Enter learning targets (one per line)",
    coolDown: "Cool down activity or notes",
    "progressMonitoring.overallNotes": "Overall progress monitoring observations",
    "timeTracking.classStartTime": "e.g., 08:00",
    "timeTracking.classEndTime": "e.g., 09:00"
  },
  fieldTypes: {
    teacherId: "reference",
    coachId: "reference", 
    schoolId: "reference",
    visitId: "reference",
    date: "date",
    status: "select",
    isSharedWithTeacher: "checkbox",
    learningTargets: "textarea",
    coolDown: "textarea",
    otherContext: "textarea",
    "lessonFlow.warmUp.launch": "textarea",
    "lessonFlow.warmUp.workTime": "textarea", 
    "lessonFlow.warmUp.synthesis": "textarea",
    "lessonFlow.activity1.launch": "textarea",
    "lessonFlow.activity1.workTime": "textarea",
    "lessonFlow.activity1.synthesis": "textarea",
    "lessonFlow.lessonSynthesis.launch": "textarea",
    "lessonFlow.lessonSynthesis.workTime": "textarea",
    "lessonFlow.lessonSynthesis.synthesis": "textarea",
    "progressMonitoring.overallNotes": "textarea"
  },
  urls: {
    teacherId: "/api/staff?role=teacher",
    coachId: "/api/staff?role=coach",
    schoolId: "/api/schools",
    visitId: "/api/visits"
  },
  options: {
    status: [
      { value: "draft", label: "Draft" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "reviewed", label: "Reviewed" }
    ]
  }
});

// Export subsets for complex nested forms if needed
export const LessonFieldConfig = observationFields.filter(field => 
  String(field.name).startsWith('lesson.')
);

export const LessonFlowFieldConfig = observationFields.filter(field =>
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

// Legacy export for backward compatibility during migration
export const ClassroomObservationFieldConfig = observationFields; 