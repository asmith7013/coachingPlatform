/**
 * Domain Types
 * Centralizes all domain-specific types for easy import
 */

// Re-export all domain types
export * from './staff';
export * from './school';
export * from './look-fors';
export * from './visit';
export * from './cycle';
export * from './shared';
export * from './schedule';

// Add any cross-domain types here
export interface DomainEntityReference {
  id: string;
  type: 'school' | 'staff' | 'look-for' | 'visit' | 'cycle';
  displayName: string;
}