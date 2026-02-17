"use client";

import React, { useState } from "react";
import { StaffListBisector } from "@/components/debug/StaffListBisector";
import { StaffListDebugger } from "@/components/debug/StaffListDebugger";
import { useComponentTester } from "@/hooks/debugging/useComponentTester";

/**
 * This page provides debugging tools specifically for the StaffList component
 * It helps identify and isolate render loops by providing multiple test environments
 */
export default function StaffDebugPage() {
  const [activeTab, setActiveTab] = useState<
    "bisector" | "real-component" | "advanced"
  >("bisector");

  // Setup debug component wrapper
  const { wrappedComponent, toggleDebugMode, currentMode } = useComponentTester(
    {
      componentId: "staff-live",
      initialWrapperType: "both",
      title: "Live Staff Component",
    },
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Component Debugger</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("bisector")}
            className={`px-4 py-2 rounded ${activeTab === "bisector" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Bisector
          </button>
          <button
            onClick={() => setActiveTab("real-component")}
            className={`px-4 py-2 rounded ${activeTab === "real-component" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Live Component
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`px-4 py-2 rounded ${activeTab === "advanced" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Advanced
          </button>
        </div>
      </div>

      {activeTab === "bisector" && <StaffListBisector />}

      {activeTab === "real-component" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Real Component Test</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                Debug Mode: <strong>{currentMode}</strong>
              </span>
              <button
                onClick={toggleDebugMode}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
              >
                Toggle Debug
              </button>
            </div>
          </div>

          {/* Import and wrap the real component here */}
          {wrappedComponent(
            <div className="p-6 bg-white rounded border">
              <p className="text-center text-gray-500">
                To debug the actual component:
                <br />
                1. Import your NYCPSStaffList component here
                <br />
                2. Remove this placeholder
                <br />
                3. Replace with: {`{wrappedComponent(<NYCPSStaffList />)}`}
              </p>
            </div>,
          )}
        </div>
      )}

      {activeTab === "advanced" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded border">
            <h3 className="font-bold mb-4">Debug Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                First use the Bisector to identify which part causes the loop
              </li>
              <li>Then use the Live Component tab with debug wrappers</li>
              <li>Check the console for detailed render information</li>
              <li>
                Look for components rendering multiple times in quick succession
              </li>
              <li>Examine prop stability and state updates</li>
            </ol>

            <h3 className="font-bold mt-6 mb-2">Common Fixes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add useMemo/useCallback for objects and functions</li>
              <li>Fix missing dependencies in hook dependency arrays</li>
              <li>
                Ensure SWR configurations prevent unnecessary revalidation
              </li>
              <li>Move object/array creation out of component body</li>
              <li>Check for state updates during render</li>
            </ul>
          </div>

          <StaffListDebugger mode="minimal">
            <div className="p-4 bg-white rounded text-center">
              <h3 className="font-bold mb-2">Minimal Test Component</h3>
              <p>This is a simple static component for baseline comparison</p>
            </div>
          </StaffListDebugger>
        </div>
      )}
    </div>
  );
}
