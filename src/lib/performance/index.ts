/**
 * Performance monitoring library
 * 
 * This library provides tools for monitoring component performance,
 * detecting render loops, and diagnosing performance bottlenecks.
 */

// Import core monitoring utilities
import { PerformanceMonitor, useRenderTracking } from './monitor';

// Import performance monitoring hooks and components
import {
  usePerformanceMonitoring,
  withPerformanceMonitoring,
  createMemoizedMonitoredComponent,
  PerformanceContext,
  PerformanceMonitorProvider,
  PerformanceDebugger,
} from './usePerformanceMonitoring';

// Define PerformanceStats type interface
export interface PerformanceStats {
  avg: number;
  min: number;
  max: number;
  total?: number;
  count?: number;
  renderTimes?: number[];
}

// Import debug components
import { RenderLoopDetector, withRenderLoopDetection } from '../../components/debug/RenderLoopDetector';

// Import render counter
import useRenderCounter from '../../hooks/debugging/useRenderTracking';

// Export everything
export {
  // Core monitoring
  PerformanceMonitor,
  useRenderTracking,
  
  // Performance monitoring hooks and components
  usePerformanceMonitoring,
  withPerformanceMonitoring,
  createMemoizedMonitoredComponent,
  PerformanceContext,
  PerformanceMonitorProvider,
  PerformanceDebugger,
  
  // Debug components
  RenderLoopDetector,
  withRenderLoopDetection,
  
  // Render counter
  useRenderCounter
};

/**
 * Set of hooks and utilities for performance debugging
 */
export const PerformanceTools = {
  // Low-level monitoring
  useRenderTracking,
  useRenderCounter,
  
  // Component monitoring
  usePerformanceMonitoring,
  withPerformanceMonitoring,
  createMemoizedMonitoredComponent,
  
  // UI components
  RenderLoopDetector,
  withRenderLoopDetection,
  PerformanceDebugger,
  
  // Global state
  PerformanceMonitorProvider,
  PerformanceContext,
  
  // Direct access to monitor
  Monitor: PerformanceMonitor
}; 