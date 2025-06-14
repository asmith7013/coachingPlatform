import { ClassroomObservationV2InputZodSchema, ClassroomObservationV2Input } from '@zod-schema/observations/classroom-observation-v2';

export type ClassroomObservationV2FieldConfig = {
  name: keyof ClassroomObservationV2Input;
  label: string;
  type: 'text' | 'date' | 'checkbox' | 'select' | 'textarea' | 'reference';
  required: boolean;
  options?: { value: string; label: string }[];
};

export const classroomObservationV2FieldConfig: ClassroomObservationV2FieldConfig[] = [
  {
    name: 'cycle',
    label: 'Cycle',
    type: 'text',
    required: false,
  },
  {
    name: 'session',
    label: 'Session',
    type: 'text',
    required: false,
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true,
  },
  {
    name: 'teacherId',
    label: 'Teacher',
    type: 'text',
    required: false,
  },
  {
    name: 'coachId',
    label: 'Coach',
    type: 'text',
    required: false,
  },
  {
    name: 'schoolId',
    label: 'School',
    type: 'text',
    required: false,
  },
  {
    name: 'lessonTitle',
    label: 'Lesson Title',
    type: 'text',
    required: false,
  },
  {
    name: 'lessonCourse',
    label: 'Course',
    type: 'text',
    required: false,
  },
  {
    name: 'lessonUnit',
    label: 'Unit',
    type: 'text',
    required: false,
  },
  {
    name: 'lessonNumber',
    label: 'Lesson Number',
    type: 'text',
    required: false,
  },
  {
    name: 'lessonCurriculum',
    label: 'Curriculum',
    type: 'text',
    required: false,
  },
  {
    name: 'otherContext',
    label: 'Other Context',
    type: 'textarea',
    required: false,
  },
  {
    name: 'coolDown',
    label: 'Cool Down',
    type: 'textarea',
    required: false,
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'reviewed', label: 'Reviewed' },
    ],
    required: true,
  },
  {
    name: 'isSharedWithTeacher',
    label: 'Shared with Teacher',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'visitId',
    label: 'Visit',
    type: 'text',
    required: false,
  },
  {
    name: 'coachingActionPlanId',
    label: 'Coaching Action Plan',
    type: 'text',
    required: false,
  },
];

export const classroomObservationV2Schema = ClassroomObservationV2InputZodSchema; 