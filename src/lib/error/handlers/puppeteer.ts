import { TimeoutError, ProtocolError } from "puppeteer-core";
import { handleServerError } from "@error/handlers/server";

/**
 * Error codes for puppeteer/rendering failures
 */
export type PuppeteerErrorCode =
  | "CHROME_NOT_FOUND"
  | "CHROMIUM_DOWNLOAD_FAILED"
  | "RENDER_TIMEOUT"
  | "BROWSER_CRASHED"
  | "SCREENSHOT_FAILED"
  | "UNKNOWN";

/**
 * Custom error class for puppeteer rendering issues
 * Provides user-friendly messages for common failures
 */
export class RenderError extends Error {
  constructor(
    message: string,
    public readonly code: PuppeteerErrorCode,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "RenderError";
  }
}

/**
 * Convert puppeteer errors to user-friendly messages
 *
 * @param error - The error caught from puppeteer operations
 * @param context - Context string for logging (e.g., "PPTX export", "screenshot")
 * @returns User-friendly error message
 */
export function handlePuppeteerError(error: unknown, context: string): string {
  // Log through error system for monitoring
  handleServerError(error, context);

  // If already a RenderError, use its message
  if (error instanceof RenderError) {
    return error.message;
  }

  const message = error instanceof Error ? error.message : String(error);

  // Chrome/Chromium not found
  if (
    message.includes("Could not find Chrome") ||
    message.includes("executablePath")
  ) {
    return "Chrome browser not available on server. This is a configuration issue - please contact support.";
  }

  // Chromium download failed (serverless)
  if (
    message.includes("Failed to download") ||
    message.includes("ENOENT") ||
    message.includes("tar")
  ) {
    return "Failed to initialize rendering engine. The server may have network restrictions. Please try again later.";
  }

  // Timeout errors (check instanceof first, then message fallback)
  if (
    error instanceof TimeoutError ||
    message.includes("timeout") ||
    message.includes("Timeout")
  ) {
    return "Rendering timed out. The slides may be too complex. Try simplifying the content and export again.";
  }

  // Browser crashed or disconnected (check instanceof first)
  if (
    error instanceof ProtocolError ||
    message.includes("Target closed") ||
    message.includes("Session closed") ||
    message.includes("disconnected")
  ) {
    return "Browser crashed during rendering. Please try exporting again. If the issue persists, try simplifying the slides.";
  }

  // Screenshot failed
  if (message.includes("screenshot") || message.includes("clip")) {
    return "Failed to capture slide images. Some slides may have invalid content or dimensions.";
  }

  // Memory issues
  if (
    message.includes("memory") ||
    message.includes("heap") ||
    message.includes("OOM")
  ) {
    return "Rendering ran out of memory. Try exporting fewer slides at a time.";
  }

  // Generic error with context
  if (error instanceof Error) {
    return `${context} failed: ${error.message}`;
  }

  return `${context} failed. Please try again.`;
}

/**
 * Check if an error is retryable
 */
export function isRetryablePuppeteerError(error: unknown): boolean {
  if (error instanceof RenderError) {
    return error.code === "RENDER_TIMEOUT" || error.code === "BROWSER_CRASHED";
  }

  // Puppeteer-specific error types
  if (error instanceof TimeoutError || error instanceof ProtocolError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("timeout") ||
    message.includes("Target closed") ||
    message.includes("Session closed") ||
    message.includes("disconnected")
  );
}
