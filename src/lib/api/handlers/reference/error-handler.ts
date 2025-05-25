// src/lib/api/handlers/reference/error-handler.ts

import { NextResponse } from "next/server";
import { createMonitoredErrorResponse } from "@api-responses/action-response-helper";

/**
 * Handles errors for reference endpoints with proper logging and monitoring
 * 
 * @param error The error that occurred
 * @param component Component identifier for error tracking
 * @param endpoint API endpoint where the error occurred
 * @returns Formatted error response
 */
export function handleReferenceError(
  error: unknown,
  component: string,
) {
  // Use the monitored error response helper
  const errorResponse = createMonitoredErrorResponse(
    error,
    { component, operation: 'getReferenceData' }
  );
  
  console.error(`❌ Error in ${component}: ${errorResponse.error || 'Unknown error'}`);
  
  return NextResponse.json(
    errorResponse,
    { status: 500 }
  );
}

/**
 * Handles fetch errors in reference endpoints
 * 
 * @param error The fetch error
 * @param endpoint API endpoint where the error occurred
 * @returns Formatted error response
 */
export function handleFetchError(error: unknown, endpoint: string) {
  return NextResponse.json(
    createMonitoredErrorResponse(
      error,
      { component: endpoint, operation: 'fetchData' }
    ),
    { status: 400 }
  );
}