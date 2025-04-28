import * as Sentry from "@sentry/nextjs";

/**
 * Centralized error handler for Server Actions.
 * - Logs the error to Sentry.
 * - Returns a safe error message.
 * - Incorporates status codes for debugging.
 */
export function handleServerError(error: unknown): string {
    Sentry.captureException(error); // ✅ Send error to Sentry

    let message = "An unexpected error occurred";
    
    if (error instanceof Error) {
        console.error("❌ Server Error:", error.message);
        message = error.message;

        // 🔹 Attach error codes (useful for debugging, but UI only sees message)
        if (message.includes("not found")) return "[404] " + message;
        if (message.includes("invalid")) return "[400] " + message;
        if (message.includes("unauthorized")) return "[401] " + message;
        if (message.includes("forbidden")) return "[403] " + message;
        if (message.includes("conflict")) return "[409] " + message;
        if (message.includes("unprocessable")) return "[422] " + message;
        if (message.includes("too many requests")) return "[429] " + message;
    } else {
        console.error("❌ Unknown Server Error:", error);
    }

    return message; // ✅ Return safe error message
}