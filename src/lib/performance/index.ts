'use client';

import React from 'react';
import type { ReactNode } from 'react';

interface PerformanceMetrics {
  renderCount: Record<string, number>;
  renderTime: Record<string, number>;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  trackRender: (component: string, time: number) => void;
  resetMetrics: () => void;
}

const _dummyContext: PerformanceContextType = {
  metrics: { renderCount: {}, renderTime: {} },
  trackRender: () => {},
  resetMetrics: () => {},
};

export function PerformanceMonitorProvider({ children }: { children: ReactNode }): React.ReactNode {
  return children;
}

export function usePerformanceMonitoring(_componentName: string): void {
  // No-op implementation
}

export function useRenderTracking(_componentName: string): number {
  return 0; // Always return 0 renders
}

export function RenderLoopDetector({ children }: { threshold?: number; children: ReactNode }): React.ReactNode {
  return children;
}

export function withRenderLoopDetection<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return Component as React.FC<P>;
} 