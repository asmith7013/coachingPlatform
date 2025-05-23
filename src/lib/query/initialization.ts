// src/lib/query/initialization.ts

import { captureError, createErrorContext } from '@error';
import { registerEntitySelector } from './selectors/registry';
import { 
  schoolSelectors,
  staffSelectors,
  nycpsStaffSelectors,
  teachingLabStaffSelectors,
  visitSelectors,
  lookForSelectors,
  rubricSelectors,
  cycleSelectors
} from './selectors/standard-selectors';

/**
 * Initialization state tracking
 */
let isInitialized = false;

/**
 * Register standard selectors for common entity types
 */
export function registerStandardSelectors(): void {
  try {
    // Core entity types
    registerEntitySelector('schools', schoolSelectors.basic);
    registerEntitySelector('staff', staffSelectors.basic);
    registerEntitySelector('nycps-staff', nycpsStaffSelectors.basic);
    registerEntitySelector('teaching-lab-staff', teachingLabStaffSelectors.basic);
    registerEntitySelector('cycles', cycleSelectors.basic);

    // Visit management
    registerEntitySelector('visits', visitSelectors.basic);

    // Look-fors system
    registerEntitySelector('lookFors', lookForSelectors.basic);
    registerEntitySelector('rubrics', rubricSelectors.basic);

    // Reference selectors (for dropdowns)
    registerEntitySelector('schools-reference', schoolSelectors.reference);
    registerEntitySelector('staff-reference', staffSelectors.reference);
    registerEntitySelector('visits-reference', visitSelectors.reference);

    // Searchable selectors
    registerEntitySelector('schools-searchable', schoolSelectors.searchable);
    registerEntitySelector('staff-searchable', staffSelectors.searchable);
    
    // Detail selectors
    registerEntitySelector('school-detail', schoolSelectors.detail);
    registerEntitySelector('staff-detail', staffSelectors.detail);
    registerEntitySelector('visit-detail', visitSelectors.detail);
  } catch (error) {
    captureError(error, createErrorContext('QuerySystem', 'selectorRegistration'));
    console.error('Failed to register standard selectors:', error);
  }
}

/**
 * Initialize all query-related configurations
 * Should be called once during application startup
 * 
 * @returns {boolean} Whether initialization was successful
 */
export function initializeQuerySystem(): boolean {
  // Skip if already initialized
  if (isInitialized) {
    return true;
  }
  
  try {
    // Register standard selectors for common entity types
    registerStandardSelectors();
    
    // Additional initialization steps can be added here
    
    // Mark as initialized
    isInitialized = true;
    
    return true;
  } catch (error) {
    // Log initialization error
    captureError(error, createErrorContext('QuerySystem', 'initialization'));
    return false;
  }
}

/**
 * Check if the query system has been initialized
 */
export function isQuerySystemInitialized(): boolean {
  return isInitialized;
}