import { captureError, createErrorContext } from '@/lib/error';
import { registerStandardSelectors } from './selectors/common-selectors';

/**
 * Initialization state tracking
 */
let isInitialized = false;

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