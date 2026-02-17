"use client";

import React, { useEffect, useRef, useState } from "react";

interface RenderStats {
  componentId: string;
  renderCount: number;
  renderTimes: number[];
  intervalsBetweenRenders: number[];
}

/**
 * Component to help detect and debug render loops
 * Temporarily wrap problematic components with this to diagnose issues
 *
 * Usage example:
 * <RenderLoopDetector componentId="MyProblemComponent">
 *   <MyComponent />
 * </RenderLoopDetector>
 */
export function RenderLoopDetector({
  children,
  componentId,
  renderThreshold = 5,
  timeThreshold = 100,
  showStats = true,
}: {
  children: React.ReactNode;
  componentId: string;
  renderThreshold?: number;
  timeThreshold?: number;
  showStats?: boolean;
}) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const [stats, setStats] = useState<RenderStats | null>(null);
  const lastUpdateTime = useRef(0);

  // Track current render with throttling to avoid causing loops
  useEffect(() => {
    const now = performance.now();
    renderCount.current += 1;
    renderTimes.current.push(now);

    // Calculate intervals between renders
    const intervals: number[] = [];
    for (let i = 1; i < renderTimes.current.length; i++) {
      intervals.push(renderTimes.current[i] - renderTimes.current[i - 1]);
    }

    // Detect rapid render sequences
    if (renderCount.current >= renderThreshold) {
      const recentIntervals = intervals.slice(-renderThreshold + 1);
      const hasRapidRenders = recentIntervals.some(
        (interval) => interval < timeThreshold,
      );

      if (hasRapidRenders) {
        console.warn(
          `🚨 RENDER LOOP DETECTED: ${componentId} rendered ${renderCount.current} times`,
        );
        console.table(
          intervals.map((interval, i) => ({
            renderNumber: i + 2,
            timeSincePrevRender: Math.round(interval),
          })),
        );
      }
    }

    // Only update stats periodically to avoid causing render loops
    // This is crucial - we don't want our debugging to cause the problem we're debugging
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    if (timeSinceLastUpdate > 500 || renderCount.current <= 2) {
      lastUpdateTime.current = now;

      setStats({
        componentId,
        renderCount: renderCount.current,
        renderTimes: [...renderTimes.current],
        intervalsBetweenRenders: intervals,
      });
    }

    // Clean up on unmount
    return () => {
      console.log(
        `${componentId} unmounted after ${renderCount.current} renders`,
      );
    };
  }, [componentId, renderThreshold, timeThreshold]);

  // Render children without stats display when showStats is false
  if (!showStats) {
    return <>{children}</>;
  }

  return (
    <div className="render-debug-wrapper relative">
      {children}

      {stats && (
        <div className="render-debug-overlay absolute top-0 right-0 bg-black/80 text-white p-2 text-xs rounded-bl-md z-50 pointer-events-none">
          <div className="font-bold">{componentId}</div>
          <div className={renderCount.current > 10 ? "text-red-400" : ""}>
            Renders: {renderCount.current}
          </div>
          {stats.intervalsBetweenRenders.length > 0 && (
            <div>
              Last:{" "}
              {stats.intervalsBetweenRenders[
                stats.intervalsBetweenRenders.length - 1
              ]?.toFixed(0)}
              ms
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Higher order component version of the render loop detector
 */
export function withRenderLoopDetection<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    id?: string;
    renderThreshold?: number;
    timeThreshold?: number;
    showStats?: boolean;
  } = {},
) {
  const DetectedComponent = (props: P) => {
    const componentId =
      options.id ||
      Component.displayName ||
      Component.name ||
      "UnknownComponent";

    return (
      <RenderLoopDetector
        componentId={componentId}
        renderThreshold={options.renderThreshold}
        timeThreshold={options.timeThreshold}
        showStats={options.showStats}
      >
        <Component {...props} />
      </RenderLoopDetector>
    );
  };

  DetectedComponent.displayName = `WithRenderLoopDetection(${Component.displayName || Component.name || "Component"})`;

  return DetectedComponent;
}
