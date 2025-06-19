// src/lib/query/initialization.ts

import { captureError, createErrorContext } from '@error';
import { standardSelectors } from '@query/client/selectors/standard-selectors';

/**
 * Initialization state tracking
 */
let isInitialized = false;

/**
 * Register standard selectors for common entity types
 * 
 * Note: The selectors are already registered during their creation in standard-selectors.ts
 * This function validates that all expected selectors are available and logs any issues
 */
export function registerStandardSelectors(): void {
  try {
    // Try to access each selector to trigger lazy registration
    const selectorChecks = [
      () => standardSelectors.schools,
      () => standardSelectors.staff,
      () => standardSelectors.nycpsStaff,
      () => standardSelectors.teachingLabStaff,
      () => standardSelectors.cycles,
      () => standardSelectors.visits,
      () => standardSelectors.coachingLogs,
      () => standardSelectors.lookFors,
      () => standardSelectors.rubrics
    ];
    
    let _successCount = 0;
    let _failureCount = 0;
    
    for (const check of selectorChecks) {
      try {
        const selector = check();
        if (selector?.base) {
          _successCount++;
        } else {
          _failureCount++;
        }
      } catch (error) {
        _failureCount++;
        console.warn('Selector registration failed:', error);
      }
    }
    
    // console.log(`✅ Selector registration complete: ${successCount} successful, ${failureCount} failed`);
    
  } catch (error) {
    captureError(error, createErrorContext('QuerySystem', 'selectorRegistration'));
    console.error('Failed to validate standard selectors:', error);
  }
}

/**
 * Initialize all query-related configurations
 * Should be called once during application startup
 * 
 * @returns {boolean} Whether initialization was successful
 */
export function initializeQuerySystem(): boolean {
  if (isInitialized) {
    return true;
  }
  
  try {
    // Register standard selectors (now with error handling)
    registerStandardSelectors();
    
    isInitialized = true;
    return true;
  } catch (error) {
    captureError(error, createErrorContext('QuerySystem', 'initialization'));
    console.warn('Query system initialization failed, but continuing:', error);
    return false; // Don't block the app
  }
}

/**
 * Check if the query system has been initialized
 */
export function isQuerySystemInitialized(): boolean {
  return isInitialized;
}