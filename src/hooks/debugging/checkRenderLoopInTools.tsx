"use client";

import React, { useEffect, useRef } from "react";

/**
 * This hook analyzes whether the debugging tools might be causing render loops
 *
 * Usage:
 * const { isLooping, renderCount } = useCheckForLoopsInDebugTools();
 */
export function useCheckForLoopsInDebugTools() {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const [isLooping, setIsLooping] = React.useState(false);
  const [stats, setStats] = React.useState({
    count: 0,
    interval: 0,
    fastRenders: 0,
  });

  // Track renders
  useEffect(() => {
    const now = performance.now();
    renderCount.current += 1;
    renderTimes.current.push(now);

    // Keep only the last 20 render times
    if (renderTimes.current.length > 20) {
      renderTimes.current.shift();
    }

    // Calculate time since last render
    let timeSinceLastRender = 0;
    if (renderTimes.current.length > 1) {
      const lastIndex = renderTimes.current.length - 1;
      timeSinceLastRender =
        renderTimes.current[lastIndex] - renderTimes.current[lastIndex - 1];
    }

    // Count fast renders (potential loop indicators)
    const fastRenders = renderTimes.current.filter((time, i) => {
      if (i === 0) return false;
      return time - renderTimes.current[i - 1] < 50;
    }).length;

    // Update stats every few renders to avoid causing a loop ourselves
    if (renderCount.current % 5 === 0 || renderCount.current <= 3) {
      setStats({
        count: renderCount.current,
        interval: Math.round(timeSinceLastRender),
        fastRenders,
      });

      // Determine if this is a render loop
      setIsLooping(fastRenders >= 3 && renderCount.current > 5);
    }

    return () => {
      console.log(
        "Render loop check unmounted after",
        renderCount.current,
        "renders",
      );
    };
  }, []);

  return {
    isLooping,
    stats,
    renderCount: renderCount.current,
  };
}

/**
 * Component to check if the debug tools might be causing render loops
 */
export function CheckDebugTools() {
  const { isLooping, stats } = useCheckForLoopsInDebugTools();

  return (
    <div className="p-4 bg-gray-100 rounded border mb-4">
      <h3 className="font-bold">Debug Tools Analysis</h3>
      <div className="mt-2 text-sm">
        <p>
          Render count: <span className="font-mono">{stats.count}</span>
        </p>
        <p>
          Last interval: <span className="font-mono">{stats.interval}ms</span>
        </p>
        <p>
          Fast renders: <span className="font-mono">{stats.fastRenders}</span>
        </p>

        <div
          className={`mt-2 p-2 rounded ${isLooping ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
        >
          {isLooping
            ? "⚠️ Potential render loop in debugging tools detected!"
            : "✅ No render loop detected in debugging tools"}
        </div>

        {isLooping && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>
              If you see this message, your debugging components might be
              causing the render loop
            </li>
            <li>
              Try the <code>/debug/no-debug-tools</code> page to confirm
            </li>
            <li>
              Check the dependencies in your debugging tools&apos; useEffect
              hooks
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
