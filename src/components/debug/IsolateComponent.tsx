"use client";

import React, { useState } from "react";
import { globalSWRConfig } from "@/providers/SWRProvider";
import { SWRConfig } from "swr";

interface IsolateComponentProps {
  children: React.ReactNode;
  title?: string;
  defaultSWRConfig?: boolean;
  customSWRConfig?: typeof globalSWRConfig;
}

/**
 * A component to isolate and test other components with controlled SWR configuration
 *
 * - Renders the component in isolation
 * - Allows toggling between different SWR configs to identify issues
 * - Shows clear visual feedback about the test environment
 */
export function IsolateComponent({
  children,
  title = "Component Test Environment",
  defaultSWRConfig = false,
  customSWRConfig,
}: IsolateComponentProps) {
  const [useCustomConfig, setUseCustomConfig] = useState(!defaultSWRConfig);
  const [showOptions, setShowOptions] = useState(false);

  // Use either the provided config, a test config, or the default global config
  const testConfig = customSWRConfig || {
    dedupingInterval: 60000, // Very long deduping interval
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
    keepPreviousData: true,
    provider: () => new Map(), // Fresh provider each time
  };

  const activeConfig = useCustomConfig ? testConfig : globalSWRConfig;

  return (
    <div className="p-4 border-4 border-dashed border-yellow-400 bg-yellow-50 rounded-lg my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setUseCustomConfig(!useCustomConfig)}
            className={`px-3 py-1 rounded text-xs font-bold ${
              useCustomConfig
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {useCustomConfig ? "Using Test Config" : "Using Global Config"}
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs"
          >
            {showOptions ? "Hide Options" : "Show Options"}
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono">
          <h3 className="font-bold mb-1">Active SWR Config:</h3>
          <pre className="overflow-x-auto">
            {JSON.stringify(activeConfig, null, 2)}
          </pre>
        </div>
      )}

      <SWRConfig value={activeConfig}>
        <div className="relative">{children}</div>
      </SWRConfig>

      <div className="mt-4 text-xs text-gray-500">
        Isolated testing environment with independent SWR configuration
      </div>
    </div>
  );
}
