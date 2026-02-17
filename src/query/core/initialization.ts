// src/lib/query/initialization.ts

import { captureError, createErrorContext } from "@error";

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
  if (isInitialized) {
    return true;
  }

  try {
    isInitialized = true;
    return true;
  } catch (error) {
    captureError(error, createErrorContext("QuerySystem", "initialization"));
    console.warn("Query system initialization failed, but continuing:", error);
    return false;
  }
}

/**
 * Check if the query system has been initialized
 */
export function isQuerySystemInitialized(): boolean {
  return isInitialized;
}
