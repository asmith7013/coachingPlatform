"use client";

import React, { useEffect, useRef } from "react";

import { globalSWRConfig } from "@/providers/SWRProvider";

interface SWRDebuggerProps {
  children: React.ReactNode;
  componentId: string;
}

/**
 * Component to identify SWR-related render issues
 * Wrap problematic components to analyze SWR caching behavior
 */
export function SWRDebugger({ children, componentId }: SWRDebuggerProps) {
  const renderCount = useRef(0);
  const prevConfigRef = useRef<string>("");

  // Track renders with performance monitor

  useEffect(() => {
    renderCount.current += 1;
    const currentConfigHash = JSON.stringify(globalSWRConfig);

    console.log(`🔍 [${componentId}] Render #${renderCount.current}`);
    console.log("Current SWR config:", globalSWRConfig);

    if (prevConfigRef.current && prevConfigRef.current !== currentConfigHash) {
      console.warn("⚠️ SWR config changed between renders!");
      console.log("Previous:", JSON.parse(prevConfigRef.current));
      console.log("Current:", globalSWRConfig);
    }

    prevConfigRef.current = currentConfigHash;

    // Log active cache entries if possible
    if (typeof window !== "undefined") {
      try {
        // @ts-expect-error - Accessing cache for debugging
        const cache = window.__SWR_CACHE__;
        if (cache) {
          console.log("Active SWR cache keys:", [...cache.keys()]);
        }
      } catch {
        console.log("Could not access SWR cache");
      }
    }

    return () => {
      console.log(
        `${componentId} unmounted after ${renderCount.current} renders`,
      );
    };
  });

  return (
    <>
      {children}
      {process.env.NODE_ENV !== "production" && (
        <div className="fixed top-4 right-4 bg-blue-900 text-white p-3 rounded-lg shadow-lg z-50 text-xs font-mono">
          <h3 className="text-sm font-bold mb-1 text-blue-300">SWR Debugger</h3>
          <div>Component: {componentId}</div>
          <div>Render count: {renderCount.current}</div>
          <div className="mt-1 text-xs">
            <div>dedupingInterval: {globalSWRConfig.dedupingInterval}ms</div>
            <div>
              revalidateIfStale: {String(globalSWRConfig.revalidateIfStale)}
            </div>
            <div>
              revalidateOnFocus: {String(globalSWRConfig.revalidateOnFocus)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
