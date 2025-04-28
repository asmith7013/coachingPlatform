"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { captureError } from "@/lib/error";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        // Send to Sentry (existing functionality)
        Sentry.captureException(error);
        
        // Use your enhanced error monitoring system
        captureError(error, {
            component: "GlobalError",
            operation: "render",
            severity: "fatal",
            category: "system",
            metadata: {
                isGlobalError: true
            }
        });
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-gray-600">{error.message || "Unexpected error occurred."}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => reset()}>
                Try Again
            </button>
        </div>
    );
}