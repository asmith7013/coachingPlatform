"use client";

import React, { useCallback, useState } from "react";
import { IsolateComponent } from "@/components/debug/IsolateComponent";
import { RenderLoopDetector } from "@/components/debug/RenderLoopDetector";
import { SWRDebugger } from "@/components/debug/SWRDebugger";

type DebugWrapperType = "render-loop" | "swr" | "both" | "none";

interface UseComponentTesterOptions {
  componentId: string;
  initialWrapperType?: DebugWrapperType;
  title?: string;
}

/**
 * Hook for wrapping components in debug utilities to identify render issues
 *
 * @example
 * function MyPage() {
 *   const { wrappedComponent, toggleDebugMode } = useComponentTester({
 *     componentId: 'staff-list',
 *     initialWrapperType: 'both'
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={toggleDebugMode}>Toggle Debug Mode</button>
 *       {wrappedComponent(<StaffList />)}
 *     </div>
 *   );
 * }
 */
export function useComponentTester({
  componentId,
  initialWrapperType = "none",
  title = "Component Test",
}: UseComponentTesterOptions) {
  const [wrapperType, setWrapperType] =
    useState<DebugWrapperType>(initialWrapperType);

  // Function to wrap the component based on selected debug mode
  const wrappedComponent = useCallback(
    (component: React.ReactNode) => {
      // Base case - no debug wrapper
      if (wrapperType === "none") {
        return component;
      }

      // Wrap with debug components based on mode
      const wrappedWithDebugger = (() => {
        switch (wrapperType) {
          case "render-loop":
            return (
              <RenderLoopDetector componentId={componentId}>
                {component}
              </RenderLoopDetector>
            );
          case "swr":
            return (
              <SWRDebugger componentId={componentId}>{component}</SWRDebugger>
            );
          case "both":
            return (
              <RenderLoopDetector componentId={componentId}>
                <SWRDebugger componentId={componentId}>{component}</SWRDebugger>
              </RenderLoopDetector>
            );
          default:
            return component;
        }
      })();

      // Always use IsolateComponent in debug mode
      return (
        <IsolateComponent title={title}>{wrappedWithDebugger}</IsolateComponent>
      );
    },
    [wrapperType, componentId, title],
  );

  // Function to cycle through debug modes
  const toggleDebugMode = useCallback(() => {
    setWrapperType((current) => {
      switch (current) {
        case "none":
          return "render-loop";
        case "render-loop":
          return "swr";
        case "swr":
          return "both";
        case "both":
          return "none";
        default:
          return "none";
      }
    });
  }, []);

  // Return utilities
  return {
    wrappedComponent,
    toggleDebugMode,
    currentMode: wrapperType,
    setDebugMode: setWrapperType,
  };
}
