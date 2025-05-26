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
    // Validate that all standard selectors are properly initialized
    const expectedSelectors = [
      'schools', 'staff', 'nycps-staff', 'teaching-lab-staff', 'cycles',
      'visits', 'coaching-logs', 'look-fors', 'rubrics'
    ];
    
    const selectorVariants = [
      'reference', 'searchable', 'detail'
    ];
    
    // Check base selectors
    for (const selectorName of expectedSelectors) {
      const selector = standardSelectors[selectorName as keyof typeof standardSelectors];
      if (!selector?.base) {
        throw new Error(`Missing base selector for ${selectorName}`);
      }
      
      // Check specialized variants
      for (const variant of selectorVariants) {
        if (!selector[variant as keyof typeof selector]) {
          console.warn(`Missing ${variant} variant for ${selectorName}`);
        }
      }
    }
    
    console.log('✅ All standard selectors validated successfully');
    
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