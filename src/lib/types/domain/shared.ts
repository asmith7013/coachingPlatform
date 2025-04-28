/**
 * Notes shared types
 * Re-exports types from Zod schemas for centralized imports
 */

// Re-export types directly from the schema
export type {
    Note,
    NoteInput
  } from '@zod-schema/shared/notes';
  
  // Additional note-related types
  export type NoteCategory = 'observation' | 'feedback' | 'action' | 'reflection';
  
  export interface NoteFilters {
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }