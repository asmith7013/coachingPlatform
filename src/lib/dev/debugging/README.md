# Performance Monitoring System

This package provides tools for tracking component performance, detecting render loops, and diagnosing performance issues in React applications.

## Key Features

- **Render counting**: Track how many times components render
- **Render loop detection**: Automatically identify potential render loops
- **Performance statistics**: Gather metrics on render frequency and timing
- **Debugging UI**: Visual overlay for performance monitoring
- **Zero overhead in production**: Tools automatically disabled in production builds

## Quick Start

```tsx
import {
  useRenderCounter,
  RenderLoopDetector,
  withPerformanceMonitoring,
} from "@/lib/performance";

// 1. Basic render counting in a component
function MyComponent() {
  const renderCount = useRenderCounter("MyComponent");
  // ... component code ...
}

// 2. Wrap a problematic component with monitoring
<RenderLoopDetector componentId="MyComponent">
  <MyComponent />
</RenderLoopDetector>;

// 3. Use a higher-order component for monitoring
const MonitoredComponent = withPerformanceMonitoring(MyComponent);
```

## Main Exports

### Hooks

- `useRenderCounter(componentName)`: Simple hook that counts renders and logs to console
- `useRenderTracking(componentId)`: Lower-level hook for render tracking
- `usePerformanceMonitoring(componentId, deps)`: Advanced hook with dependency tracking and stats

### Components

- `RenderLoopDetector`: Component that wraps children to detect render loops
- `PerformanceDebugger`: UI component that shows performance statistics
- `PerformanceMonitorProvider`: Context provider for app-wide monitoring

### Higher-Order Components (HOCs)

- `withPerformanceMonitoring`: Adds monitoring to any component
- `withRenderLoopDetection`: Wraps a component with render loop detection
- `createMemoizedMonitoredComponent`: Creates a memoized component with monitoring

## Common Use Cases

### Identifying Render Loops

```tsx
// 1. Quick temporary check
<RenderLoopDetector componentId="SuspiciousComponent">
  <SuspiciousComponent />
</RenderLoopDetector>;

// 2. Permanent monitoring
const EnhancedComponent = withRenderLoopDetection(MyComponent);
```

### Performance Optimization

```tsx
function OptimizationCandidate() {
  // Add this to components you want to optimize
  const { getStats, getRenderCount } = usePerformanceMonitoring(
    "OptimizationCandidate",
  );

  // Check render count in effect
  useEffect(() => {
    if (getRenderCount() > 5) {
      console.log("Performance stats:", getStats());
    }
  }, [getStats, getRenderCount]);

  // ... component code ...
}
```

### App-Wide Monitoring

```tsx
// In your app root
<PerformanceMonitorProvider>
  <App />
  <PerformanceDebugger /> {/* Shows stats UI when monitoring is enabled */}
</PerformanceMonitorProvider>;

// Later, to enable monitoring:
const { toggleMonitoring } = useContext(PerformanceContext);
// Call toggleMonitoring() to turn on/off
```

## Tips for Optimizing Component Performance

1. **Memoize expensive calculations**: Use `useMemo` for calculations and `useCallback` for functions
2. **Avoid unnecessary renders**: Use `React.memo` for components that render often but with the same props
3. **Use stable references**: Keep references stable using `useRef` for values that shouldn't trigger re-renders
4. **Optimize context**: Split contexts to avoid unnecessary renders when only part of the context changes
5. **Check dependency arrays**: Ensure useEffect, useMemo, and useCallback dependency arrays are properly specified

## Common Performance Issues

- **Render loops**: Component repeatedly re-renders due to state updates in effects or renders
- **Prop drilling**: Passing props deeply through component tree causing cascading renders
- **Unstable references**: Creating new object/function references on each render
- **Heavy computation**: Performing expensive calculations on each render
- **Global state updates**: Frequent global state updates causing many components to re-render

## Debugging Workflow

1. Use `useRenderCounter` to identify components that render too frequently
2. Wrap suspicious components with `RenderLoopDetector` to get detailed metrics
3. Check for state updates in effects without proper dependencies
4. Look for new object/function references created during render
5. Consider using the performance monitoring HOCs for complex components
