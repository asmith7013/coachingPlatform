import {
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  RateLimitError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
} from '@anthropic-ai/sdk';
import { handleServerError } from '@error/handlers/server';

/**
 * Convert Anthropic SDK errors to user-friendly messages
 *
 * @param error - The error caught from Anthropic API call
 * @param context - Context string for logging (e.g., "analyze problem", "generate slides")
 * @returns User-friendly error message
 */
export function handleAnthropicError(error: unknown, context: string): string {
  // Log through error system for monitoring
  handleServerError(error, context);

  // Return user-friendly message based on error type
  if (error instanceof APIConnectionTimeoutError) {
    return 'Request timed out. The AI service took too long to respond. Please try again.';
  }

  if (error instanceof APIConnectionError) {
    return 'Unable to connect to AI service. Please check your internet connection and try again.';
  }

  if (error instanceof RateLimitError) {
    return 'AI service is temporarily busy (rate limit reached). Please wait a moment and try again.';
  }

  if (error instanceof AuthenticationError) {
    return 'AI service authentication failed. Please contact support.';
  }

  if (error instanceof BadRequestError) {
    const msg = error.message.toLowerCase();
    if (msg.includes('image')) {
      return 'Could not process the uploaded image. Please ensure it is a valid PNG, JPG, or WebP file under 20MB.';
    }
    return `Invalid request: ${error.message}`;
  }

  if (error instanceof InternalServerError) {
    return 'AI service is experiencing issues. Please try again in a few minutes.';
  }

  if (error instanceof APIError) {
    const msg = error.message.toLowerCase();
    if (msg.includes('overloaded')) {
      return 'AI service is currently overloaded. Please try again in a few minutes.';
    }
    if (msg.includes('content') && (msg.includes('policy') || msg.includes('safety'))) {
      return 'The content could not be processed due to content restrictions.';
    }
    return `AI service error: ${error.message}`;
  }

  if (error instanceof Error) {
    return `${context} failed: ${error.message}`;
  }

  return `${context} failed. Please try again.`;
}

/**
 * Check if an error is a retryable Anthropic error
 */
export function isRetryableAnthropicError(error: unknown): boolean {
  return (
    error instanceof APIConnectionError ||
    error instanceof APIConnectionTimeoutError ||
    error instanceof RateLimitError ||
    error instanceof InternalServerError ||
    (error instanceof APIError && error.message.toLowerCase().includes('overloaded'))
  );
}
