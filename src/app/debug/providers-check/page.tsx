"use client";

import React, { useState } from "react";
import { SWRConfig } from "swr";
import { RenderLoopDetector } from "@/components/debug/RenderLoopDetector";

/**
 * Test component with minimal implementation
 */
function TestComponent() {
  return <div className="p-4 bg-white">Minimal test component</div>;
}

/**
 * Page to test if any of the providers are causing render loops
 */
export default function ProvidersCheck() {
  const [activeTest, setActiveTest] = useState<
    "no-providers" | "custom-swr" | "no-perf"
  >("no-providers");

  // Custom SWR configuration that should never cause revalidation
  const staticSWRConfig = {
    provider: () => new Map(),
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: false,
    refreshInterval: 0,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Provider Test</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTest("no-providers")}
          className={`px-3 py-1 rounded ${activeTest === "no-providers" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          No Providers
        </button>
        <button
          onClick={() => setActiveTest("custom-swr")}
          className={`px-3 py-1 rounded ${activeTest === "custom-swr" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Custom SWR
        </button>
        <button
          onClick={() => setActiveTest("no-perf")}
          className={`px-3 py-1 rounded ${activeTest === "no-perf" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          No Performance Monitor
        </button>
      </div>

      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          Testing{" "}
          {activeTest === "no-providers"
            ? "with no providers"
            : activeTest === "custom-swr"
              ? "with custom SWR config"
              : "without performance monitoring"}
        </h2>

        {activeTest === "no-providers" && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Running with no providers to establish baseline
            </p>
            <RenderLoopDetector componentId="no-providers">
              <TestComponent />
            </RenderLoopDetector>
          </div>
        )}

        {activeTest === "custom-swr" && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Using custom static SWR config that never revalidates
            </p>
            <SWRConfig value={staticSWRConfig}>
              <RenderLoopDetector componentId="custom-swr">
                <TestComponent />
              </RenderLoopDetector>
            </SWRConfig>
          </div>
        )}

        {activeTest === "no-perf" && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Running without performance monitoring hooks
            </p>
            <RenderLoopDetector componentId="no-perf">
              <TestComponent />
            </RenderLoopDetector>
          </div>
        )}

        <div className="mt-6 text-sm bg-yellow-50 p-3 rounded">
          <p className="font-semibold">Troubleshooting Tips:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              If all tests show render loops, the issue is likely in the
              RenderLoopDetector or core Next.js config
            </li>
            <li>
              If only the global app shows loops, check your app&apos;s provider
              hierarchy
            </li>
            <li>
              Specifically check for circular state updates in context providers
            </li>
            <li>Look for useEffects without proper dependency arrays</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
