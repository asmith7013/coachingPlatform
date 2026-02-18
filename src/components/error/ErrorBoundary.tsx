import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  logError,
  classifyError,
  createErrorContext,
  formatErrorMessage,
} from "@error";
import { cn } from "@ui/utils/formatters";
import { Alert } from "@components/core/feedback/Alert";
import { Button } from "@components/core/Button";
import { ErrorCategory, ErrorSeverity, ErrorContext } from "@error-types";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  className?: string;
  context?: ErrorContext | string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorId?: boolean;
  variant?: "default" | "minimal" | "detailed";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCategory: ErrorCategory;
  errorSeverity: ErrorSeverity;
  errorId: string | null;
}

/**
 * Unified error boundary that combines advanced error classification with
 * flexible context handling and configurable UI presentation
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCategory: "system",
      errorSeverity: "error",
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    const { category, severity } = classifyError(error);
    return {
      hasError: true,
      error,
      errorCategory: category,
      errorSeverity: severity,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Get component name from errorInfo for better context
    const componentMatch =
      errorInfo.componentStack?.match(/\n\s+in\s+([^\s]+)/);
    const component = componentMatch ? componentMatch[1] : "Unknown";

    // Create error context based on props
    const errorContext: ErrorContext =
      typeof this.props.context === "object"
        ? {
            ...this.props.context,
            component: this.props.context.component || component,
            operation: this.props.context.operation || "render",
            category: this.state.errorCategory,
            severity: this.state.errorSeverity,
            metadata: {
              ...this.props.context.metadata,
              componentStack: errorInfo.componentStack,
              reactError: true,
              errorId: this.state.errorId,
            },
          }
        : typeof this.props.context === "string"
          ? createErrorContext(component, this.props.context, {
              category: this.state.errorCategory,
              severity: this.state.errorSeverity,
              metadata: {
                componentStack: errorInfo.componentStack,
                reactError: true,
                errorId: this.state.errorId,
              },
            })
          : {
              component,
              operation: "render",
              category: this.state.errorCategory,
              severity: this.state.errorSeverity,
              metadata: {
                componentStack: errorInfo.componentStack,
                reactError: true,
                errorId: this.state.errorId,
              },
            };

    // Log error through unified system
    logError(error, errorContext);

    // Call custom onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCategory: "system",
      errorSeverity: "error",
      errorId: null,
    });
  };

  render() {
    const { hasError, error, errorCategory, errorSeverity, errorId } =
      this.state;
    const {
      children,
      fallback,
      className,
      showErrorId = false,
      variant = "default",
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided as a function
      if (typeof fallback === "function") {
        return fallback(error, this.resetError);
      }

      // Use custom fallback component if provided
      if (fallback) {
        return fallback;
      }

      // Get alert intent based on error severity
      const getAlertIntent = () => {
        switch (errorSeverity) {
          case "fatal":
          case "error":
            return "error";
          case "warning":
            return "warning";
          case "info":
            return "info";
          default:
            return "error";
        }
      };

      // Get category-specific message
      const getCategoryMessage = () => {
        switch (errorCategory) {
          case "validation":
            return "There was a validation error.";
          case "permission":
            return "You don't have permission to perform this action.";
          case "network":
            return "There was a network error. Please check your connection.";
          case "business":
            return "A business rule prevented this operation.";
          case "system":
            return "There was a system error. Our team has been notified.";
          case "unknown":
          default:
            return "An unexpected error occurred.";
        }
      };

      // Return UI based on the selected variant
      if (variant === "minimal") {
        return (
          <div
            className={cn(
              "p-4 bg-red-50 border border-red-200 rounded-md",
              className,
            )}
          >
            <h2 className="text-lg font-medium text-red-800">
              Something went wrong
            </h2>
            <p className="mt-1 text-sm text-red-700">
              {error.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.resetError}
              className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        );
      }

      if (variant === "detailed") {
        return (
          <Alert intent={getAlertIntent()} className={cn("w-full", className)}>
            <Alert.Title>{getCategoryMessage()}</Alert.Title>
            <Alert.Description>
              {formatErrorMessage(error)}
              {showErrorId && errorId && (
                <div className="mt-2 text-xs text-gray-500">
                  Error ID: {errorId}
                </div>
              )}
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">
                  Error Details
                </summary>
                <pre className="text-xs mt-1 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            </Alert.Description>
            <div className="mt-4">
              <Button
                intent="primary"
                appearance="solid"
                onClick={this.resetError}
              >
                Try Again
              </Button>
            </div>
          </Alert>
        );
      }

      // Default variant
      return (
        <Alert intent={getAlertIntent()} className={cn("w-full", className)}>
          <Alert.Title>{getCategoryMessage()}</Alert.Title>
          <Alert.Description>
            {formatErrorMessage(error)}
            {showErrorId && errorId && (
              <div className="mt-2 text-xs text-gray-500">
                Error ID: {errorId}
              </div>
            )}
          </Alert.Description>
          <div className="mt-4">
            <Button
              intent="primary"
              appearance="solid"
              onClick={this.resetError}
            >
              Try Again
            </Button>
          </div>
        </Alert>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
