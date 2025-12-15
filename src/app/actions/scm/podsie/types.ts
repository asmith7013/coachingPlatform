import { RampUpQuestion } from "@zod-schema/scm/student/student";

// =====================================
// PODSIE API TYPES
// =====================================

/**
 * Question data from Podsie API
 */
export interface PodsieQuestionData {
  id: number;
  questionContent: {
    type: string;
    questionText: string;
    d3Content?: string;
    explanation?: string;
    [key: string]: unknown;
  };
}

/**
 * Information about a Podsie assignment
 */
export interface PodsieAssignmentInfo {
  assignmentId: number;
  assignmentName: string;
  groupName: string;
  moduleName?: string | null;
  totalQuestions: number;
  questionIds: number[];
  questions?: PodsieQuestionData[]; // Full question data for variant analysis
}

// =====================================
// SYNC TYPES
// =====================================

/**
 * Result of syncing a single student
 */
export interface SyncResult {
  studentId: string;
  studentName: string;
  success: boolean;
  completedCount?: number;
  totalQuestions?: number;
  error?: string;
}

/**
 * Result of syncing an entire section
 */
export interface SyncSectionResult {
  success: boolean;
  totalStudents: number;
  successfulSyncs: number;
  failedSyncs: number;
  results: SyncResult[];
  error?: string;
}

/**
 * Mapping of question ID to its actual questionNumber in the assignment
 * Used to ensure sync stores data at the correct positions
 */
export interface QuestionIdToNumberMap {
  [questionId: string]: number;  // questionId -> questionNumber
}

/**
 * Options for sync operations
 */
export interface SyncOptions {
  testMode?: boolean;           // If true, only sync first student with email
  testStudentId?: string;        // Specific student ID to test with
  questionMapping?: number[][];  // Mapping of logical positions to question_ids
  baseQuestionIds?: number[];    // Base question IDs from assignment (in order)
  questionIdToNumber?: QuestionIdToNumberMap;  // Map of questionId -> actual questionNumber
  variations?: number;           // Number of variations per question (default: 3)
  q1HasVariations?: boolean;     // Whether Question 1 has variations (default: false)
  activityType?: 'sidekick' | 'mastery-check' | 'assessment';  // Type of Podsie activity
}

// =====================================
// PROGRESS DATA TYPES
// =====================================

/**
 * Student progress data for a specific assignment
 */
export interface StudentRampUpProgressData {
  studentId: string;
  studentName: string;
  scopeAndSequenceId: string;
  podsieAssignmentId: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  activityType?: 'sidekick' | 'mastery-check' | 'assessment';
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
  zearnCompleted?: boolean;
  zearnCompletionDate?: string;
  // Activity data for small group/inquiry tracking
  smallGroupToday?: boolean;
  smallGroupYesterday?: boolean;
  inquiryToday?: boolean;
  inquiryYesterday?: boolean;
}

/**
 * Internal type for processed question data
 */
export interface ProcessedQuestionData {
  completed: boolean;
  completedAt?: string;
  correctScore?: number;
  explanationScore?: number;
}
