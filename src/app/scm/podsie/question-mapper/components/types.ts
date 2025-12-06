import type { PodsieQuestionMap } from "@zod-schema/313/podsie/section-config";
import type {
  CurriculumAssignmentSummary,
  ExportQuestionMapResult,
} from "@/app/actions/313/curriculum-question-map";

export type ImportMode = "api" | "json" | "curriculum";

export interface CurriculumQuestion {
  questionNumber: number;
  external_id: string;
  isRoot: boolean;
  hasVariations: boolean;
  variations: Array<{ order: number; external_id: string }>;
}

export interface CurriculumData {
  assignment: {
    external_id: string;
    title: string;
    path?: string;
  };
  questions: CurriculumQuestion[];
  summary: {
    totalRootQuestions: number;
    totalVariations: number;
    totalQuestions: number;
    variationsPerQuestion: number;
    q1HasVariations: boolean;
  };
}

export interface SavedQuestionMap {
  id: string;
  assignmentId: string;
  assignmentName: string;
  totalQuestions: number;
  createdBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExistingMapping {
  assignmentId: string;
  assignmentName: string;
}

// Re-export for convenience
export type { PodsieQuestionMap, CurriculumAssignmentSummary, ExportQuestionMapResult };
