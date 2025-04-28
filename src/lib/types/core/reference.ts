/**
 * Reference Types
 * 
 * This file defines standardized reference types used across the application
 * for select components, dropdowns, and other UI elements that reference entities.
 */

/**
 * Base reference interface that all reference types extend
 */
export interface BaseReference {
    _id: string;
    label: string; // The display text for UI components
  }
  
  /**
   * School reference for dropdowns and selects
   */
  export interface SchoolReference extends BaseReference {
    _id: string;
    label: string; // Will be populated with schoolName
    schoolNumber?: string; // Optional additional info
  }
  
  /**
   * Staff reference for dropdowns and selects
   */
  export interface StaffReference extends BaseReference {
    _id: string;
    label: string; // Will be populated with staffName
    email?: string; // Optional additional info
  }
  
  /**
   * Teacher Schedule reference
   */
  export interface ScheduleReference extends BaseReference {
    _id: string;
    label: string; // Computed from teacher and school
    teacher: string; // Teacher ID
    school: string; // School ID
  }
  
  /**
   * Bell Schedule reference
   */
  export interface BellScheduleReference extends BaseReference {
    _id: string;
    label: string; // Computed from school and type
    school: string; // School ID
    bellScheduleType: string;
  }
  
  /**
   * Look For reference
   */
  export interface LookForReference extends BaseReference {
    _id: string;
    label: string; // Will contain topic
    lookForIndex: number;
  }
  
  /**
   * Coaching Log reference
   */
  export interface CoachingLogReference extends BaseReference {
    _id: string;
    label: string; // Will contain primaryStrategy
    solvesTouchpoint: string;
  }
  
  /**
   * Visit reference
   */
  export interface VisitReference extends BaseReference {
    _id: string;
    label: string; // Will contain date and school
    date: string;
    school: string;
  }
  
  /**
   * Map type that defines mapper functions for converting full entities to references
   */
  export type ReferenceMappers = {
    school: (item: any) => SchoolReference;
    staff: (item: any) => StaffReference;
    schedule: (item: any) => ScheduleReference;
    bellSchedule: (item: any) => BellScheduleReference;
    lookFor: (item: any) => LookForReference;
    coachingLog: (item: any) => CoachingLogReference;
    visit: (item: any) => VisitReference;
  };