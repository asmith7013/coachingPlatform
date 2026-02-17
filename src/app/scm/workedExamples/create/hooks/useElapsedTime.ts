"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for tracking elapsed time during an async operation.
 *
 * Usage:
 * ```tsx
 * const { elapsed, start, reset } = useElapsedTime(isLoading);
 *
 * // When starting an operation:
 * start();
 * setIsLoading(true);
 *
 * // elapsed will auto-update every second while isLoading is true
 * ```
 */
export function useElapsedTime(isActive: boolean) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Start tracking - call this when beginning an operation
  const start = useCallback(() => {
    setStartTime(Date.now());
  }, []);

  // Reset tracking
  const reset = useCallback(() => {
    setStartTime(null);
    setElapsed(0);
  }, []);

  // Update elapsed time every second while active
  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsed(0);
      return;
    }

    // Set initial elapsed time immediately
    setElapsed(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  return {
    /** Elapsed time in seconds */
    elapsed,
    /** Start time (timestamp) or null if not started */
    startTime,
    /** Call to start tracking elapsed time */
    start,
    /** Call to reset the timer */
    reset,
  };
}
