import { useState, useCallback, useEffect, useRef } from 'react';
import { StudentData } from '@/lib/schema/zod-schema/313/student-data';
import { fetchStudentData, authenticateStudent } from '@/app/actions/313/student-data';
import { handleClientError } from '@/lib/error/handlers/client';

/**
 * Custom hook for managing student dashboard data
 * Follows established patterns from other domain hooks
 */
export function useStudentData(studentId: string) {
  const [data, setData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // TODO: Remove this
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Use ref to track if we've already loaded data for this studentId
  const loadedStudentIdRef = useRef<string | null>(null);

  /**
   * Load student data from server
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Hook: Loading student data for ID: ${studentId}`);
      
      const result = await fetchStudentData(studentId);
      
      if (result.success && result.data) {
        setData(result.data);
        loadedStudentIdRef.current = studentId; // Mark as loaded
      } else {
        setError(result.error || 'Failed to load student data');
        setData(null);
      }
    } catch (err) {
      const errorMsg = handleClientError(err, 'Student Data Loading');
      setError(errorMsg);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  /**
   * Auto-load student data on component mount or studentId change
   * Fixed: Remove problematic dependencies that cause race conditions
   */
  useEffect(() => {
    // Only load if authenticated, no existing data for this studentId, and not currently loading
    if (isAuthenticated && loadedStudentIdRef.current !== studentId && !isLoading) {
      console.log(`🚀 Hook: Auto-loading data on mount for student: ${studentId}`);
      loadData();
    }
  }, [studentId, isAuthenticated]); // Removed data, isLoading, and loadData dependencies

  /**
   * Reset state when studentId changes
   */
  useEffect(() => {
    if (loadedStudentIdRef.current && loadedStudentIdRef.current !== studentId) {
      console.log(`🔄 Hook: StudentId changed, resetting state`);
      setData(null);
      setError(null);
      loadedStudentIdRef.current = null;
    }
  }, [studentId]);

  /**
   * Authenticate student with email
   */
  const authenticate = useCallback(async (email: string) => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log(`🔐 Hook: Authenticating student ${studentId} with email: ${email}`);
      
      const authResult = await authenticateStudent(email.trim(), studentId);
      
      if (authResult.success) {
        setIsAuthenticated(true);
        // Reset loaded tracking to trigger data load
        loadedStudentIdRef.current = null;
        // Automatically load data after successful authentication
        await loadData();
      } else {
        setError(authResult.error || "Authentication failed");
        setIsAuthenticated(false);
      }
    } catch (err) {
      const errorMsg = handleClientError(err, 'Student Authentication');
      setError(errorMsg);
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  }, [studentId, loadData]);

  /**
   * Reset authentication state
   */
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setData(null);
    setError(null);
    loadedStudentIdRef.current = null;
  }, []);

  /**
   * Refresh data (re-fetch from server)
   */
  const refreshData = useCallback(async () => {
    if (isAuthenticated) {
      loadedStudentIdRef.current = null; // Reset tracking
      await loadData();
    }
  }, [isAuthenticated, loadData]);

  return {
    // Data state
    data,
    isLoading,
    error,
    
    // Authentication state
    isAuthenticated,
    isAuthenticating: isAuthenticating || isLoading,
    
    // Actions
    authenticate,
    logout,
    refreshData,
    
    // Computed values
    hasError: !!error,
    hasData: !!data,
    isReady: isAuthenticated && !isLoading && !!data
  };
}