'use client';

import { useCallback, useRef, useState } from 'react';
import { useErrorHandledMutation } from '@/query/client/hooks/mutations/useStandardMutation';
import { checkStaffExistenceByEmail } from '@actions/staff/operations';

// Define the exact type that will be returned
interface StaffExistenceData {
  exists: boolean;
  staffId?: string;
  message?: string;
}

// Define server response type matching our standard format
interface StaffExistenceResponse {
  success: boolean;
  data: StaffExistenceData;
  error?: string;
}

interface UseStaffExistenceResult {
  exists: boolean | null;
  checking: boolean;
  error: string | null;
  checkExistence: (email: string) => Promise<boolean>;
}

/**
 * Hook to check if a staff member exists by email
 * Uses server action with proper error handling
 * Compatible with our new React Query mutation system
 */
export function useStaffExistence(): UseStaffExistenceResult {
  const lastCheckedEmailRef = useRef<string | null>(null);
  const [existsState, setExistsState] = useState<boolean | null>(null);
  
  const { 
    mutate, 
    isPending: checking, 
    error: mutationError 
  } = useErrorHandledMutation<StaffExistenceResponse, Error, string>(
    checkStaffExistenceByEmail,
    {},
    "StaffExistenceCheck"
  );
  
  const checkExistence = useCallback(async (email: string): Promise<boolean> => {
    if (!email?.trim()) {
      console.log("Empty email provided, returning false");
      return false;
    }
    
    // Skip duplicate checks if we have data for this email already
    if (lastCheckedEmailRef.current === email && existsState !== null) {
      console.log("Using cached existence data:", existsState);
      return existsState;
    }
    
    lastCheckedEmailRef.current = email;
    
    try {
      console.log("Checking existence for email:", email);
      
      // Call the server action through the mutate function
      const result = await new Promise<StaffExistenceResponse>((resolve, reject) => {
        mutate(email, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        });
      });
      
      console.log("Existence check result:", result);
      
      // Update local state
      const exists = result?.success && result?.data?.exists || false;
      setExistsState(exists);
      
      return exists;
    } catch (err) {
      console.error('Failed to check staff existence:', err);
      setExistsState(false);
      return false;
    }
  }, [mutate, existsState]);

  return {
    exists: existsState,
    checking,
    error: mutationError instanceof Error ? mutationError.message : null,
    checkExistence
  };
} 