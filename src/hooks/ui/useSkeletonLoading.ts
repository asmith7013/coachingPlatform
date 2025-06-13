import { useState, useEffect } from 'react';

/**
 * Hook for managing skeleton loading states with smart timing
 * Prevents flickering for fast loads and ensures minimum loading time for better UX
 */
interface UseSkeletonLoadingProps {
  isLoading: boolean;
  minimumLoadingTime?: number; // ms - prevents flash of loading
  showSkeletonAfter?: number; // ms - prevents skeleton flash for fast loads
}

export function useSkeletonLoading({
  isLoading,
  minimumLoadingTime = 0,
  showSkeletonAfter = 200
}: UseSkeletonLoadingProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hasFinishedMinimumTime, setHasFinishedMinimumTime] = useState(
    minimumLoadingTime === 0
  );

  useEffect(() => {
    let skeletonTimer: NodeJS.Timeout;
    let minimumTimer: NodeJS.Timeout;

    if (isLoading) {
      // Show skeleton after delay to prevent flash for fast loads
      skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
      }, showSkeletonAfter);

      // Ensure minimum loading time for consistent UX
      if (minimumLoadingTime > 0) {
        setHasFinishedMinimumTime(false);
        minimumTimer = setTimeout(() => {
          setHasFinishedMinimumTime(true);
        }, minimumLoadingTime);
      }
    } else {
      // Clear timers when loading stops
      setShowSkeleton(false);
      if (minimumLoadingTime === 0) {
        setHasFinishedMinimumTime(true);
      }
    }

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(minimumTimer);
    };
  }, [isLoading, showSkeletonAfter, minimumLoadingTime]);

  const shouldShowSkeleton = isLoading && showSkeleton;
  const canHideLoading = !isLoading && hasFinishedMinimumTime;

  return {
    showSkeleton: shouldShowSkeleton,
    canHideLoading,
    isLoading
  };
}

/**
 * Simpler hook for basic skeleton loading without timing complexity
 */
export function useSimpleSkeletonLoading(isLoading: boolean, delay = 150) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);

  return showSkeleton;
} 