import React from 'react';
import { useSimpleSkeletonLoading } from '@/hooks/ui/useSkeletonLoading';

interface SkeletonContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delay?: number;
  error?: string | null;
  errorComponent?: React.ReactNode;
}

/**
 * Container component that handles loading, error, and content states
 * Provides clean separation of concerns for any component with loading states
 * 
 * Benefits:
 * - Single responsibility: handles ALL loading states
 * - Zero duplication: one reusable pattern  
 * - Clean components: components focus on their core purpose
 * - Easy maintenance: change loading behavior in one place
 */
export function SkeletonContainer({
  isLoading,
  children,
  skeleton,
  delay = 150,
  error,
  errorComponent
}: SkeletonContainerProps) {
  const showSkeleton = useSimpleSkeletonLoading(isLoading, delay);
  
  // Error state
  if (error) {
    return <>{errorComponent || <div className="text-red-600">Error: {error}</div>}</>;
  }
  
  // Loading state
  if (showSkeleton) {
    return <>{skeleton}</>;
  }
  
  // Content state
  return <>{children}</>;
} 