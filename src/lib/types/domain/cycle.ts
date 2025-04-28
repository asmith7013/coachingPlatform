/**
 * Cycle domain types
 * Re-exports types from Zod schemas for centralized imports
 */

// Re-export types directly from the schema
export type {
    Cycle,
    CycleInput
} from '@zod-schema/core/cycle';
  
// Additional domain-specific types
export interface CycleFilters {
  cycleNum?: number;
  implementationIndicator?: string;
  supportCycle?: string;
  search?: string;
}

/**
 * Helper to format cycle display name
 */
export function formatCycleDisplayName(cycle: Pick<import('@zod-schema/core/cycle').Cycle, 'cycleNum'>): string {
  return `Cycle ${cycle.cycleNum}`;
}