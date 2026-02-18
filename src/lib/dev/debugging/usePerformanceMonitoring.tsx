"use client";

import React from "react";

export function usePerformanceMonitoring() {
  return {
    getStats: () => ({ avg: 0, min: 0, max: 0 }),
    getRenderCount: () => 0,
  };
}

export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return Component;
}

export function createMemoizedMonitoredComponent<P extends object>(
  Component: React.ComponentType<P>,
): React.NamedExoticComponent<P> {
  return React.memo(Component);
}

export const PerformanceContext = React.createContext({
  isMonitoringEnabled: false,
  toggleMonitoring: () => {},
  getReport: () => ({}),
  reset: () => {},
});

export const PerformanceMonitorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export const PerformanceDebugger = () => null;
