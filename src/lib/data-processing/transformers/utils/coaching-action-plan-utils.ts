// accept conditionally - needs further review later

// import { BaseResponse } from '@core-types/response';
import { validateSafe } from '@/lib/data-processing/validation/zod-validation';
import { handleClientError } from '@error/handlers/client';
import { semanticColorMap } from '@/lib/tokens/semantic-colors';
import { 
  CoachingActionPlan,
  NeedsAndFocusZodSchema,
  GoalZodSchema 
} from '@zod-schema/core/cap';

// Updated type definitions using proper base type composition
export interface StageProgress {
  stage: string;
  isValid: boolean;
  completionPercentage: number;
  missingFields: string[];
  errors: string[];
  warnings: string[];
  success: boolean;
  message?: string;
  error?: string;
}

export interface PlanProgress {
  progressPercentage: number;
  completedStages: number;
  totalStages: number;
  stageDetails: StageProgress[];
  canComplete: boolean;
}

// Keep existing types but ensure they extend proper base types
export type PlanStatus = "draft" | "active" | "completed" | "archived";

export interface StatusTransition {
  from: PlanStatus;
  to: PlanStatus;
  allowed: boolean;
  requires?: string[];
  description: string;
}

export interface StatusWorkflow {
  transitions: StatusTransition[];
  canTransition: (from: PlanStatus, to: PlanStatus, plan?: CoachingActionPlan) => boolean;
  getNextStatuses: (current: PlanStatus, plan?: CoachingActionPlan) => PlanStatus[];
  validateTransition: (from: PlanStatus, to: PlanStatus, plan: CoachingActionPlan) => { valid: boolean; errors: string[] };
}

// Configuration-driven validation system
const STAGE_CONFIGS = {
  needsAndFocus: {
    requiredFields: ['ipgCoreAction', 'ipgSubCategory', 'rationale'],
    fieldLabels: {
      ipgCoreAction: 'Core Action',
      ipgSubCategory: 'Subsection',
      rationale: 'Rationale'
    }
  },
  goal: {
    requiredFields: ['description', 'teacherOutcomes', 'studentOutcomes'],
    fieldLabels: {
      description: 'SMART Goal Statement',
      teacherOutcomes: 'Teacher Outcomes',
      studentOutcomes: 'Student Outcomes'
    }
  },
  weeklyPlans: {
    requiredFields: ['weeklyPlans'],
    fieldLabels: {
      weeklyPlans: 'Weekly Visit Plans'
    }
  },
  implementationRecords: {
    requiredFields: [],
    fieldLabels: {}
  },
  endOfCycleAnalysis: {
    requiredFields: ['goalMet', 'impactOnLearning'],
    fieldLabels: {
      goalMet: 'Goal Completion Assessment',
      impactOnLearning: 'Impact Analysis'
    }
  }
} as const;

// Refactored stage validation using configuration and existing patterns
export function validateStageCompleteness(stage: string, planData: CoachingActionPlan): StageProgress {
  const config = STAGE_CONFIGS[stage as keyof typeof STAGE_CONFIGS];
  
  if (!config) {
    return {
      stage,
      isValid: false,
      completionPercentage: 0,
      missingFields: ['Unknown stage'],
      errors: ['Unknown stage'],
      warnings: [],
      success: false,
      error: 'Unknown stage'
    };
  }

  let isValid = true;
  const missingFields: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Use schema validation for specific stages
  try {
    if (stage === 'needsAndFocus' && planData.needsAndFocus) {
      const validated = validateSafe(NeedsAndFocusZodSchema, planData.needsAndFocus);
      if (!validated) {
        isValid = false;
        errors.push('Schema validation failed for needs and focus');
      }
    }
    
    if (stage === 'goal' && planData.goal) {
      const validated = validateSafe(GoalZodSchema, planData.goal);
      if (!validated) {
        isValid = false;
        errors.push('Schema validation failed for goal');
      }
    }
  } catch (error) {
    isValid = false;
    errors.push(`Schema validation error: ${handleClientError(error)}`);
  }

  // Check required fields based on stage-specific logic
  switch (stage) {
    case 'needsAndFocus':
      const needsAndFocus = planData.needsAndFocus;
      if (!needsAndFocus?.ipgCoreAction) missingFields.push('Core Action');
      if (!needsAndFocus?.ipgSubCategory) missingFields.push('Subsection');
      if (!needsAndFocus?.rationale) missingFields.push('Rationale');
      break;

    case 'goal':
      const goal = planData.goal;
      if (!goal?.description) missingFields.push('SMART Goal Statement');
      if (!goal?.teacherOutcomes?.length) missingFields.push('Teacher Outcomes');
      if (!goal?.studentOutcomes?.length) missingFields.push('Student Outcomes');
      break;

    case 'weeklyPlans':
      if (!planData.weeklyPlans?.length) missingFields.push('Weekly Visit Plans');
      break;

    case 'implementationRecords':
      // Optional during creation
      break;

    case 'endOfCycleAnalysis':
      const analysis = planData.endOfCycleAnalysis;
      if (analysis?.goalMet === undefined) missingFields.push('Goal Completion Assessment');
      if (!analysis?.impactOnLearning) missingFields.push('Impact Analysis');
      break;
  }

  // Calculate completion percentage
  const totalChecks = config.requiredFields.length || 1;
  const completedChecks = totalChecks - missingFields.length;
  const completionPercentage = Math.round((completedChecks / totalChecks) * 100);

  // Update validity based on missing fields
  if (missingFields.length > 0) {
    isValid = false;
    errors.push(`Missing: ${missingFields.join(', ')}`);
  }

  return {
    stage,
    isValid,
    completionPercentage,
    missingFields,
    errors,
    warnings,
    success: isValid,
    message: isValid ? 'Stage completed' : undefined,
    error: errors.length > 0 ? errors.join('; ') : undefined
  };
}

// Progress calculation utility (enhanced with better error handling)
export function calculatePlanProgress(planData: CoachingActionPlan): PlanProgress {
  const stages = ['needsAndFocus', 'goal', 'weeklyPlans', 'implementationRecords', 'endOfCycleAnalysis'];
  
  const stageDetails = stages.map(stage => validateStageCompleteness(stage, planData));
  
  const completedStages = stageDetails.filter(stage => stage.isValid).length;
  const totalStages = stages.length;
  const progressPercentage = Math.round((completedStages / totalStages) * 100);

  return {
    progressPercentage,
    completedStages,
    totalStages,
    stageDetails,
    canComplete: progressPercentage >= 80 // Require 80% completion to mark as complete
  };
}

// Status workflow definition with improved error handling
export const statusWorkflow: StatusWorkflow = {
  transitions: [
    // From Draft
    {
      from: "draft",
      to: "active",
      allowed: true,
      requires: ["needsAndFocus", "goal"],
      description: "Activate plan when initial stages are complete"
    },
    {
      from: "draft",
      to: "archived",
      allowed: true,
      description: "Archive unused draft plans"
    },
    
    // From Active
    {
      from: "active",
      to: "draft",
      allowed: true,
      description: "Return to draft for major revisions"
    },
    {
      from: "active",
      to: "completed",
      allowed: true,
      requires: ["endOfCycleAnalysis"],
      description: "Complete plan when all stages finished"
    },
    {
      from: "active",
      to: "archived",
      allowed: true,
      description: "Archive discontinued active plans"
    },
    
    // From Completed
    {
      from: "completed",
      to: "archived",
      allowed: true,
      description: "Archive completed plans for long-term storage"
    },
    {
      from: "completed",
      to: "active",
      allowed: true,
      description: "Reactivate for additional cycles or corrections"
    },
    
    // From Archived
    {
      from: "archived",
      to: "active",
      allowed: true,
      description: "Restore archived plan for continued use"
    },
    {
      from: "archived",
      to: "completed",
      allowed: true,
      description: "Restore to completed status"
    }
  ],

  canTransition: (from: PlanStatus, to: PlanStatus, plan?: CoachingActionPlan): boolean => {
    const transition = statusWorkflow.transitions.find(t => t.from === from && t.to === to);
    if (!transition?.allowed) return false;

    if (plan && transition.requires) {
      const progress = calculatePlanProgress(plan);
      return transition.requires.every(requiredStage => 
        progress.stageDetails.find(s => s.stage === requiredStage)?.isValid
      );
    }

    return true;
  },

  getNextStatuses: (current: PlanStatus, plan?: CoachingActionPlan): PlanStatus[] => {
    return statusWorkflow.transitions
      .filter(t => t.from === current && statusWorkflow.canTransition(current, t.to, plan))
      .map(t => t.to);
  },

  validateTransition: (from: PlanStatus, to: PlanStatus, plan: CoachingActionPlan): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    try {
      const transition = statusWorkflow.transitions.find(t => t.from === from && t.to === to);

      if (!transition) {
        errors.push(`Transition from ${from} to ${to} is not allowed`);
        return { valid: false, errors };
      }

      if (!transition.allowed) {
        errors.push(`Transition from ${from} to ${to} is currently disabled`);
        return { valid: false, errors };
      }

      // Use existing progress calculation
      if (transition.requires) {
        const progress = calculatePlanProgress(plan);
        const missingStages = transition.requires.filter(requiredStage => 
          !progress.stageDetails.find(s => s.stage === requiredStage)?.isValid
        );

        if (missingStages.length > 0) {
          errors.push(`Missing required stages: ${missingStages.join(', ')}`);
        }
      }

      // Additional validations
      if (to === "completed") {
        const progress = calculatePlanProgress(plan);
        if (!progress.canComplete) {
          errors.push('Plan must be at least 80% complete to mark as completed');
        }
      }

      if (to === "active" && from === "draft") {
        const hasBasicInfo = plan.title && plan.teachers?.length > 0 && plan.school;
        if (!hasBasicInfo) {
          errors.push('Plan must have title, teachers, and school before activation');
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      const errorMessage = handleClientError(error, 'validateTransition');
      return { valid: false, errors: [errorMessage] };
    }
  }
};

// Status color system using semantic colors
const STATUS_COLOR_MAP: Record<PlanStatus, keyof typeof semanticColorMap> = {
  draft: 'muted',
  active: 'primary', 
  completed: 'success',
  archived: 'subtleText'
} as const;

export function getStatusColor(status: PlanStatus): string {
  const colorKey = STATUS_COLOR_MAP[status] || 'muted';
  return semanticColorMap[colorKey];
}

export function getStatusLabel(status: PlanStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Improved bulk operations with error handling
export function canBulkTransition(plans: CoachingActionPlan[], targetStatus: PlanStatus): { 
  canTransition: CoachingActionPlan[]; 
  cannotTransition: Array<{ plan: CoachingActionPlan; errors: string[] }>;
} {
  const canTransition: CoachingActionPlan[] = [];
  const cannotTransition: Array<{ plan: CoachingActionPlan; errors: string[] }> = [];

  plans.forEach(plan => {
    try {
      const validation = statusWorkflow.validateTransition(plan.status, targetStatus, plan);
      if (validation.valid) {
        canTransition.push(plan);
      } else {
        cannotTransition.push({ plan, errors: validation.errors });
      }
    } catch (error) {
      const errorMessage = handleClientError(error, 'canBulkTransition');
      cannotTransition.push({ plan, errors: [errorMessage] });
    }
  });

  return { canTransition, cannotTransition };
}

// Utility functions with improved validation
export function isValidStage(stage: string): boolean {
  return stage in STAGE_CONFIGS;
}

export function getStageFieldPath(stage: string): string {
  if (!isValidStage(stage)) {
    throw new Error(`Invalid stage: ${stage}`);
  }
  return stage;
}