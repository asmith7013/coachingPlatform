"use client";

import React, { ReactNode } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "./ErrorBoundary";
import { createErrorContext } from "@error";
import { ErrorContext } from "@error-types";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  context?: ErrorContext | string;
  errorComponent?: React.ComponentType<{ error: Error; reset: () => void }>;
  className?: string;
  variant?: "default" | "minimal" | "detailed";
}

/**
 * Specialized error boundary for React Query operations
 * Integrates with React Query's reset mechanism
 */
export function QueryErrorBoundary({
  children,
  fallback,
  context,
  errorComponent: ErrorComponent,
  className,
  variant,
}: QueryErrorBoundaryProps) {
  // Get React Query's reset function
  const { reset } = useQueryErrorResetBoundary();

  // Create query-specific error context
  const queryContext: ErrorContext =
    typeof context === "object"
      ? { ...context, component: context.component || "ReactQuery" }
      : typeof context === "string"
        ? createErrorContext("ReactQuery", context)
        : createErrorContext("ReactQuery", "boundary");

  return (
    <ErrorBoundary
      context={queryContext}
      className={className}
      variant={variant}
      fallback={(error: Error, resetError: () => void) => {
        // Combined reset function that resets both error boundary and React Query
        const resetBoth = () => {
          resetError();
          reset();
        };

        // Use custom error component if provided
        if (ErrorComponent) {
          return <ErrorComponent error={error} reset={resetBoth} />;
        }

        // Use custom fallback if provided
        if (typeof fallback === "function") {
          return fallback(error, resetBoth);
        }

        if (fallback) {
          return fallback;
        }

        // Otherwise, let the ErrorBoundary handle it with its default UI
        // But provide a function that resets both
        return (
          <ErrorBoundary
            variant={variant}
            className={className}
            fallback={<div />} // Empty div that will never render
          >
            {/* Trigger error to show fallback with combined reset */}
            {(() => {
              // This immediately throws to trigger ErrorBoundary's fallback
              throw error;
            })()}
          </ErrorBoundary>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default QueryErrorBoundary;
