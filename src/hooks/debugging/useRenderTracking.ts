"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to track the number of renders for a component
 * @param componentName - A string identifier for the component being tracked
 * @returns The current render count
 */
export function useRenderCounter(componentName: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} rendered: ${renderCount.current} times`);
  });

  return renderCount.current;
}

export default useRenderCounter;
