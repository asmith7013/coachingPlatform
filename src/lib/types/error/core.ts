/**
 * Core error types and constants
 */

// Error severity levels
export type ErrorSeverity = "fatal" | "error" | "warning" | "info" | "debug";

// Error category types
export type ErrorCategory =
  | "validation"
  | "network"
  | "permission"
  | "business"
  | "system"
  | "unknown";

// Basic error information interface
export interface ErrorInfo {
  message: string;
  code?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
}

// Error source information
export interface ErrorSource {
  file?: string;
  function?: string;
  line?: number;
  stack?: string;
}

// Standard error options interface
export interface ErrorOptions {
  code?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  source?: ErrorSource;
  meta?: Record<string, unknown>;
}
