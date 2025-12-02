import { RampUpQuestion } from "@zod-schema/313/student";

export interface LessonConfig {
  unitLessonId: string;
  lessonName: string;
  grade: string;
  podsieAssignmentId: string;
  totalQuestions: number;
  podsieQuestionMap?: Array<{ questionNumber: number; questionId: string }>;
  section?: string;
  unitNumber: number;
  assignmentType?: 'lesson' | 'mastery-check';
  hasZearnLesson?: boolean;
}

export interface UnitOption {
  unitNumber: number;
  unitName: string;
  grade: string;
  lessonCount: number;
  scopeSequenceTag?: string;
}

export interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  podsieAssignmentId?: string;
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
  zearnCompleted?: boolean;
  zearnCompletionDate?: string;
}

export interface SummaryStats {
  avgCompletion: number;
  fullyComplete: number;
  totalStudents: number;
  syncedStudents: number;
}
