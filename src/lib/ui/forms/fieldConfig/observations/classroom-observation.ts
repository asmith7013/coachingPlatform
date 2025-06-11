import { Field } from "@ui-types/form";
import { ClassroomObservationNoteInput } from "@zod-schema/observations/classroom-observation";
import { set } from 'lodash';

export const ClassroomObservationFieldConfig: Field[] = [
  // Basic Information Section
  {
    key: "cycle",
    label: "Cycle",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter cycle name"
  },
  {
    key: "session", 
    label: "Session",
    type: "text",
    required: true,
    editable: true,
    placeholder: "Enter session name"
  },
  {
    key: "date",
    label: "Date",
    type: "date",
    required: true,
    editable: true
  },
  {
    key: "teacherId",
    label: "Teacher",
    type: "reference",
    url: "/api/staff?role=teacher",
    required: true,
    editable: true,
    multiple: false
  },
  {
    key: "coachId",
    label: "Coach", 
    type: "reference",
    url: "/api/staff?role=coach",
    required: true,
    editable: true,
    multiple: false
  },
  {
    key: "schoolId",
    label: "School",
    type: "reference", 
    url: "/api/schools",
    required: true,
    editable: true,
    multiple: false
  },
  {
    key: "visitId",
    label: "Visit",
    type: "reference", 
    url: "/api/visits",
    required: false,
    editable: true,
    multiple: false
  },
  
  // Lesson Information Section
  {
    key: "lesson.title",
    label: "Lesson Title",
    type: "text",
    required: false,
    editable: true,
    placeholder: "Enter lesson title"
  },
  {
    key: "lesson.course",
    label: "Course",
    type: "text", 
    required: false,
    editable: true,
    placeholder: "Enter course name"
  },
  {
    key: "lesson.unit",
    label: "Unit",
    type: "text",
    required: false,
    editable: true,
    placeholder: "Enter unit name"
  },
  {
    key: "lesson.lessonNumber",
    label: "Lesson Number",
    type: "text",
    required: false,
    editable: true,
    placeholder: "Enter lesson number"
  },
  {
    key: "otherContext",
    label: "Other Context",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Additional context or notes"
  },
  
  // Learning Targets (simplified as text for now)
  {
    key: "learningTargets",
    label: "Learning Targets",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Enter learning targets (one per line)"
  },
  
  // Cool Down
  {
    key: "coolDown",
    label: "Cool Down",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Cool down activity or notes"
  },
  
  // Lesson Flow - Warm Up
  {
    key: "lessonFlow.warmUp.launch",
    label: "Warm Up - Launch",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Warm up launch notes"
  },
  {
    key: "lessonFlow.warmUp.workTime",
    label: "Warm Up - Work Time", 
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Warm up work time notes"
  },
  {
    key: "lessonFlow.warmUp.synthesis",
    label: "Warm Up - Synthesis",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Warm up synthesis notes"
  },
  
  // Lesson Flow - Activity 1
  {
    key: "lessonFlow.activity1.launch",
    label: "Activity 1 - Launch",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Activity 1 launch notes"
  },
  {
    key: "lessonFlow.activity1.workTime",
    label: "Activity 1 - Work Time",
    type: "textarea", 
    required: false,
    editable: true,
    placeholder: "Activity 1 work time notes"
  },
  {
    key: "lessonFlow.activity1.synthesis",
    label: "Activity 1 - Synthesis",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Activity 1 synthesis notes"
  },
  
  // Lesson Synthesis
  {
    key: "lessonFlow.lessonSynthesis.launch",
    label: "Lesson Synthesis - Launch",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Lesson synthesis launch notes"
  },
  {
    key: "lessonFlow.lessonSynthesis.workTime",
    label: "Lesson Synthesis - Work Time",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Lesson synthesis work time notes"
  },
  {
    key: "lessonFlow.lessonSynthesis.synthesis",
    label: "Lesson Synthesis - Synthesis",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Lesson synthesis notes"
  },
  
  // Progress Monitoring
  {
    key: "progressMonitoring.overallNotes",
    label: "Progress Monitoring Notes",
    type: "textarea",
    required: false,
    editable: true,
    placeholder: "Overall progress monitoring observations"
  },
  
  // Time Tracking
  {
    key: "timeTracking.classStartTime",
    label: "Class Start Time",
    type: "text",
    required: false,
    editable: true,
    placeholder: "e.g., 08:00"
  },
  {
    key: "timeTracking.classEndTime", 
    label: "Class End Time",
    type: "text",
    required: false,
    editable: true,
    placeholder: "e.g., 09:00"
  },
  
  // Status
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "reviewed", label: "Reviewed" }
    ],
    required: true,
    editable: true,
    defaultValue: "draft"
  },
  
  // Shared with Teacher
  {
    key: "isSharedWithTeacher",
    label: "Share with Teacher",
    type: "checkbox",
    required: false,
    editable: true,
    defaultValue: false
  }
];

// Export subsets for complex nested forms if needed
export const LessonFieldConfig = ClassroomObservationFieldConfig.filter(field => 
  String(field.key).startsWith('lesson.')
);

export const LessonFlowFieldConfig = ClassroomObservationFieldConfig.filter(field =>
  String(field.key).startsWith('lessonFlow.')
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

// Export field transformer for ResourceForm
export const classroomObservationFieldTransformer = {
  updateField: updateNestedObservationField
}; 