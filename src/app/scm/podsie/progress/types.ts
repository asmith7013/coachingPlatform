import { RampUpQuestion } from "@zod-schema/313/student";
import type { LessonType } from "@/lib/utils/lesson-display";

export interface LessonConfig {
  scopeAndSequenceId: string;
  unitLessonId: string;
  lessonName: string;
  lessonType?: LessonType;
  lessonTitle?: string;
  grade: string;
  podsieAssignmentId: string;
  totalQuestions: number;
  podsieQuestionMap?: Array<{ questionNumber: number; questionId: string }>;
  section?: string;
  unitNumber: number;
  activityType?: 'sidekick' | 'mastery-check';
  hasZearnActivity?: boolean;
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
