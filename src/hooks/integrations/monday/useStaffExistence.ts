'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useErrorHandledMutation, ServerResponse } from '@/hooks/error/useErrorHandledMutation';
// Import client-safe function instead of server-only fetcher
import { checkStaffExistenceByEmail } from '@/lib/api/client/staff';

// Define the exact type that will be returned in the data property
interface StaffExistenceData {
  exists: boolean;
}

// Define a type for debug information
interface DebugInfo {
  result?: ServerResponse<StaffExistenceData>;
  error?: unknown;
  timestamp?: number;
  cached?: boolean;
}

interface UseStaffExistenceResult {
  exists: boolean | null;
  checking: boolean;
  error: string | null;
  checkExistence: (email: string) => Promise<boolean>;
  debugInfo?: DebugInfo; // For debugging only - remove in production
}

/**
 * Hook to check if a staff member exists by email
 * Uses a client-safe API call instead of direct database access
 * Properly handles the response structure from useErrorHandledMutation
 */
export function useStaffExistence(): UseStaffExistenceResult {
  const lastCheckedEmailRef = useRef<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  
  const { 
    mutate, 
    data, 
    isLoading: checking, 
    error 
  } = useErrorHandledMutation<StaffExistenceData, [string]>(
    checkStaffExistenceByEmail,
    { 
      errorContext: "StaffExistenceCheck",
      defaultErrorMessage: "Failed to check if staff exists"
    }
  );
  
  const checkExistence = useCallback(async (email: string): Promise<boolean> => {
    if (!email) {
      console.log("Empty email provided, returning false");
      return false;
    }
    
    // Skip duplicate checks if we have data for this email already
    if (lastCheckedEmailRef.current === email && data !== null) {
      console.log("Using cached existence data:", data);
      setDebugInfo({ 
        timestamp: Date.now(), 
        cached: true,
        result: { success: true, data }
      });
      return data.exists;
    }
    
    lastCheckedEmailRef.current = email;
    
    try {
      console.log("Checking existence for email:", email);
      
      // Call the API through the mutate function
      const result = await mutate(email);
      console.log("Existence check result:", result);
      
      // Store debug info
      setDebugInfo({ 
        result, 
        timestamp: Date.now(),
        cached: false 
      });
      
      // Access the exists property from the result.data
      if (result && result.data) {
        return result.data.exists;
      }
      
      return false;
    } catch (err) {
      console.error('Failed to check staff existence:', err);
      setDebugInfo({ 
        error: err, 
        timestamp: Date.now(),
        cached: false
      });
      return false;
    }
  }, [data, mutate]);

  return {
    // Get the exists value from the data state
    exists: data?.exists ?? null,
    checking,
    error,
    checkExistence,
    debugInfo: debugInfo || undefined // Remove in production
  };
}

/**
 * Self-test function for debugging the useStaffExistence hook
 * This should be used in a React component
 * 
 * Example usage:
 * ```
 * function TestComponent() {
 *   const testResult = useStaffExistenceTest();
 *   return <pre>{JSON.stringify(testResult, null, 2)}</pre>;
 * }
 * ```
 */
export function useStaffExistenceTest(testEmail = "test@example.com") {
  const { checkExistence, exists, checking, error, debugInfo } = useStaffExistence();
  const [testResult, setTestResult] = useState<{ exists: boolean | null, ran: boolean }>({ 
    exists: null, 
    ran: false 
  });
  
  useEffect(() => {
    async function runTest() {
      console.log("Starting staff existence check test");
      
      try {
        console.log("Checking existence for:", testEmail);
        const result = await checkExistence(testEmail);
        console.log("Test result:", result);
        setTestResult({ exists: result, ran: true });
      } catch (err) {
        console.error("Test error:", err);
        setTestResult({ exists: null, ran: true });
      }
    }
    
    runTest();
  }, [checkExistence, testEmail]);
  
  return { 
    exists, 
    checking, 
    error, 
    debugInfo,
    testResult
  };
} 