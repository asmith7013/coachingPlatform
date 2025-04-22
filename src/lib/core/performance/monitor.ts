/**
 * Performance monitoring utility for tracking component renders and detecting render loops
 */
export const PerformanceMonitor = {
  renders: new Map<string, number>(),
  timings: new Map<string, number[]>(),
  warnings: new Map<string, number>(),
  
  /**
   * Track a component render
   * @param componentId - Unique identifier for the component
   * @returns The current render count
   */
  trackRender(componentId: string): number {
    const count = (this.renders.get(componentId) || 0) + 1;
    this.renders.set(componentId, count);
    
    const now = performance.now();
    const timings = this.timings.get(componentId) || [];
    
    // Check for potential render loops
    if (timings.length > 0) {
      const timeSinceLastRender = now - timings[timings.length - 1];
      
      // If we have multiple renders in quick succession
      if (timeSinceLastRender < 100 && count > 3) {
        const warningCount = (this.warnings.get(componentId) || 0) + 1;
        this.warnings.set(componentId, warningCount);
        
        // Only log every few warnings to avoid console spam
        if (warningCount % 5 === 1) {
          console.warn(
            `⚠️ Potential render loop in ${componentId}: ${count} renders, ` +
            `last render ${timeSinceLastRender.toFixed(2)}ms ago`
          );
        }
      }
    }
    
    // Keep last 10 render times for analysis
    timings.push(now);
    this.timings.set(componentId, timings.slice(-10));
    
    return count;
  },
  
  /**
   * Get performance stats for a component
   * @param componentId - Component identifier
   */
  getStats(componentId: string) {
    const timings = this.timings.get(componentId) || [];
    const intervals: number[] = [];
    
    // Calculate time between renders
    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i - 1]);
    }
    
    if (intervals.length === 0) {
      return { 
        avg: 0, 
        min: 0, 
        max: 0, 
        renderCount: this.renders.get(componentId) || 0,
        intervalCount: 0,
        potentialRenderLoop: false
      };
    }
    
    const sum = intervals.reduce((acc, val) => acc + val, 0);
    const avg = sum / intervals.length;
    const min = Math.min(...intervals);
    const max = Math.max(...intervals);
    
    return {
      avg,
      min,
      max,
      renderCount: this.renders.get(componentId) || 0,
      intervalCount: intervals.length,
      potentialRenderLoop: min < 50 && intervals.length > 2
    };
  },
  
  /**
   * Clear monitoring data
   */
  reset() {
    this.renders.clear();
    this.timings.clear();
    this.warnings.clear();
  },
  
  /**
   * Generate a performance report for all components
   */
  generateReport() {
    interface ComponentStats {
      avg: number;
      min: number;
      max: number;
      renderCount: number;
      intervalCount: number;
      potentialRenderLoop: boolean;
    }
    
    const report: Record<string, ComponentStats> = {};
    
    for (const [componentId, _] of this.renders.entries()) {
      report[componentId] = this.getStats(componentId);
    }
    
    return report;
  }
};

/**
 * Create a custom hook for component render tracking
 * @param componentId - Component identifier
 */
export function useRenderTracking(componentId: string) {
  const count = PerformanceMonitor.trackRender(componentId);
  return count;
} 