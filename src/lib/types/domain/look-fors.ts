/**
 * Look-For domain types
 * Re-exports types from Zod schemas for centralized imports
 */

// Re-export types from Look-For schemas
export type {
    LookFor,
    LookForInput,
    LookForItem
  } from '@zod-schema/look-fors/look-for';
  
  // Re-export types from Next-Step schema
  export type {
    NextStep,
    NextStepInput
  } from '@zod-schema/look-fors/next-step';
  
  // Re-export types from Rubric schemas
  export type {
    Rubric,
    RubricInput,
    RubricScore
  } from '@zod-schema/look-fors/rubric';
  
  // Additional domain-specific types
  export type LookForStatus = 'active' | 'archived' | 'draft';
  
  export interface LookForFilters {
    schools?: string[];
    teachers?: string[];
    category?: string;
    status?: LookForStatus;
    studentFacing?: boolean;
    search?: string;
  }
  
  /**
   * Helper to format look-for display text
   */
  export function formatLookForDisplay(lookFor: Pick<import('@zod-schema/look-fors/look-for').LookFor, 'lookForIndex' | 'topic'>): string {
    return `${lookFor.lookForIndex}. ${lookFor.topic}`;
  }