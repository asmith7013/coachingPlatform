// Domain types for Coaching Action Plan components and workflows
// These interfaces match the example component patterns and extend the schema types

import { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/core/cap';

// ===== CORE COMPONENT INTERFACES =====

/**
 * Props for ActionPlanStage wrapper component
 * Matches src/app/examples/cap/components/ActionPlanStage.tsx
 */
export interface ActionPlanStageProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Metric type for MetricsBuilder and MetricsTable components
 * Matches src/app/examples/cap/example3/page.tsx MetricType
 */
export interface MetricType {
  name: string;
  type: 'IPG' | 'L&R' | 'Project' | 'Other';
  ratings: { score: number; description: string }[];
}

/**
 * Coaching move type for CoachingMovesBuilder
 * Matches src/app/examples/cap/components/types.ts CoachingMoveType
 */
export interface CoachingMoveType {
  category: string;
  specificMove: string;
  toolsResources: string;
}

/**
 * Implementation record for tracking actual coaching sessions
 * Matches the implementation records structure in examples
 */
export interface ImplementationRecordType {
  date: string;
  moveSelected: string;
  teacherActions: string;
  studentOutcomes: string;
  nextStep: string;
}

/**
 * Reflection question and response pair
 * Used in ReflectionSection component
 */
export interface ReflectionType {
  question: string;
  response: string;
}

// ===== COMPONENT PROPS INTERFACES =====

/**
 * Props for IPGFocusCards component
 * Handles core action selection with color coding
 */
export interface IPGFocusCardsProps {
  selectedValue?: string;
  onSelect: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    colorCode: 'primary' | 'secondary' | 'success';
  }>;
  className?: string;
}

/**
 * Props for IPGSubsectionCards component
 * Handles subsection selection with color inheritance
 */
export interface IPGSubsectionCardsProps {
  selectedValue?: string;
  onSelect: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  parentColor: 'primary' | 'secondary' | 'success';
  className?: string;
}

/**
 * Props for MetricsBuilder component
 * Handles dynamic metrics creation and editing
 */
export interface MetricsBuilderProps {
  metrics: MetricType[];
  onMetricsChange: (metrics: MetricType[]) => void;
  className?: string;
}

/**
 * Props for CoachingMovesBuilder component
 * Handles coaching moves creation and editing
 */
export interface CoachingMovesBuilderProps {
  moves: CoachingMoveType[];
  onMovesChange: (moves: CoachingMoveType[]) => void;
  className?: string;
}

/**
 * Props for ImplementationRecordCard component
 * Handles individual implementation record entry
 */
export interface ImplementationRecordCardProps {
  record: ImplementationRecordType;
  onRecordChange: (record: ImplementationRecordType) => void;
  availableMoves: CoachingMoveType[];
  className?: string;
}

/**
 * Props for ReflectionSection component
 * Handles reflection questions and responses
 */
export interface ReflectionSectionProps {
  reflections: ReflectionType[];
  onReflectionsChange: (reflections: ReflectionType[]) => void;
  className?: string;
}

// ===== WIZARD AND FORM INTERFACES =====

/**
 * Stage information for wizard navigation
 */
export interface StageInfo {
  number: number;
  title: string;
  description?: string;
  isComplete: boolean;
  isActive: boolean;
}

/**
 * Props for CoachingActionPlanWizard component
 * Main orchestration component for the 4-stage workflow
 */
export interface CoachingActionPlanWizardProps {
  initialData?: Partial<CoachingActionPlanInput>;
  onSave: (data: CoachingActionPlanInput) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  className?: string;
}

/**
 * Stage-specific form data interfaces
 */
export interface Stage1FormData {
  needsAndFocus: {
    ipgCoreAction: string;      // ✅ Aligned with schema: ipgCoreAction
    ipgSubCategory: string;     // ✅ Aligned with schema: ipgSubCategory
    rationale: string;          // ✅ Aligned with schema: rationale
    pdfAttachment?: string;     // ✅ Aligned with schema: pdfAttachment (optional)
  };
}

export interface Stage2FormData {
  smartGoal: string;
  teacherOutcomes: MetricType[];
  studentOutcomes: MetricType[];
  coachingMoves: CoachingMoveType[];
}

export interface Stage3FormData {
  weeklyPlans: Array<{
    week: number;
    visitDate: string;
    focusArea: string;
    plannedMoves: string[];
    expectedOutcomes: string;
  }>;
}

export interface Stage4FormData {
  implementationRecords: ImplementationRecordType[];
  goalMet: boolean;
  impactOnLearning: string;
  lessonsLearned: string;
  recommendationsForNext: string;
  reflections: ReflectionType[];
}

// ===== TABLE AND DISPLAY INTERFACES =====

/**
 * Props for MetricsTable component
 * Displays metrics in tabular format with scores over time
 */
export interface MetricsTableProps {
  metrics: Array<{
    name: string;
    scores: (number | null)[];
  }>;
  dates: string[];
  className?: string;
}

/**
 * Props for CoachingMovesTable component
 * Displays coaching moves organized by category
 */
export interface CoachingMovesTableProps {
  moves: Array<{
    category: string;
    moves: string[];
    tools: string[];
  }>;
  className?: string;
}

/**
 * Props for MonitoringProgress component
 * Shows progress tracking and evidence collection
 */
export interface MonitoringProgressProps {
  metrics: Array<{
    name: string;
    scores: (number | null)[];
  }>;
  dates: string[];
  evidence: string[];
  className?: string;
}

// ===== COMPLETE ACTION PLAN INTERFACE =====

/**
 * Complete ActionPlan component props
 * Matches src/app/examples/cap/components/ActionPlan.tsx ActionPlanProps
 */
export interface ActionPlanProps {
  title: string;
  coach: string;
  teacher: string;
  subject: string;
  startDate: string;
  endDate: string;
  objective: string;
  stageInfo: {
    number: number;
    title: string;
    content: React.ReactNode;
  };
  successMetrics: {
    metrics: Array<{
      name: string;
      scores: (number | null)[];
    }>;
    dates: string[];
  };
  coachingMoves: Array<{
    category: string;
    moves: string[];
    tools: string[];
  }>;
  implementation: {
    records: ImplementationRecordType[];
    dates: string[];
  };
  monitoring: {
    metrics: Array<{
      name: string;
      scores: (number | null)[];
    }>;
    dates: string[];
    evidence: string[];
  };
  reflections: ReflectionType[];
}

// ===== UTILITY AND HELPER INTERFACES =====

/**
 * Color mapping for IPG core actions
 */
export type IPGColorCode = 'primary' | 'secondary' | 'success';

/**
 * Status types for coaching action plans
 */
export type CoachingActionPlanStatus = 'draft' | 'active' | 'completed' | 'archived';

/**
 * Visit arc types for implementation records
 */
export type VisitArcType = 'Pre-Brief' | 'Observation' | 'Debrief';

/**
 * Metric rating scale (1-4 point scale)
 */
export interface MetricRating {
  score: number;
  description: string;
}

/**
 * Evidence type for tracking implementation
 */
export interface EvidenceType {
  type: string;
  description: string;
  url?: string;
  date?: Date;
}

// ===== FORM VALIDATION INTERFACES =====

/**
 * Validation state for form fields
 */
export interface FieldValidation {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Form validation state for each stage
 */
export interface StageValidation {
  stage1: {
    coreAction: FieldValidation;
    subsection: FieldValidation;
    rationale: FieldValidation;
  };
  stage2: {
    smartGoal: FieldValidation;
    teacherOutcomes: FieldValidation;
    studentOutcomes: FieldValidation;
  };
  stage3: {
    weeklyPlans: FieldValidation;
  };
  stage4: {
    goalMet: FieldValidation;
    impactOnLearning: FieldValidation;
  };
}

// ===== HOOK INTERFACES =====

/**
 * Return type for useCoachingActionPlan hook
 */
export interface UseCoachingActionPlanReturn {
  // Data
  actionPlan: CoachingActionPlan | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  save: (data: CoachingActionPlanInput) => Promise<void>;
  update: (id: string, data: Partial<CoachingActionPlanInput>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  
  // Stage management
  currentStage: number;
  setCurrentStage: (stage: number) => void;
  canProceedToStage: (stage: number) => boolean;
  
  // Validation
  validation: StageValidation;
  validateStage: (stage: number) => boolean;
  validateAll: () => boolean;
}

/**
 * Return type for useIPGSelection hook
 */
export interface UseIPGSelectionReturn {
  // Selection state
  selectedCoreAction: string | null;
  selectedSubsection: string | null;
  
  // Actions
  selectCoreAction: (coreAction: string) => void;
  selectSubsection: (subsection: string) => void;
  clearSelection: () => void;
  
  // Data
  coreActionOptions: Array<{ value: string; label: string; colorCode: IPGColorCode }>;
  subsectionOptions: Array<{ value: string; label: string; description: string }>;
  
  // State
  isSelectionComplete: boolean;
  selectedColor: IPGColorCode | null;
}

// ===== EXPORT TYPES FOR CONVENIENCE =====

// Re-export schema types for convenience
export type { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/core/cap'; 