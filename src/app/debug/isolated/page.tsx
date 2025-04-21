"use client";

import React from 'react';

/**
 * IMPORTANT: This component intentionally avoids using ANY debugging tools
 * to ensure they're not causing the render loop themselves
 */
export default function IsolatedTest() {
  const renderCountRef = React.useRef(0);
  const renderTimesRef = React.useRef<number[]>([]);
  const [renderStats, setRenderStats] = React.useState<string>('');
  
  // Track renders in the most minimal way possible
  React.useEffect(() => {
    const now = performance.now();
    renderCountRef.current += 1;
    renderTimesRef.current.push(now);
    
    // Calculate time since last render
    let timeSinceLastRender = 0;
    if (renderTimesRef.current.length > 1) {
      const lastIndex = renderTimesRef.current.length - 1;
      timeSinceLastRender = renderTimesRef.current[lastIndex] - renderTimesRef.current[lastIndex - 1];
    }
    
    // Only update the stats every 10 renders to avoid causing renders ourselves
    if (renderCountRef.current % 10 === 0 || renderCountRef.current <= 3) {
      setRenderStats(`Render count: ${renderCountRef.current}, last interval: ${Math.round(timeSinceLastRender)}ms`);
    }
    
    console.log(`IsolatedTest render #${renderCountRef.current}, +${Math.round(timeSinceLastRender)}ms`);
    
    if (renderCountRef.current > 1 && timeSinceLastRender < 50) {
      console.warn('⚠️ Potential render loop detected');
    }
  }, []);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Completely Isolated Component</h1>
      <div className="p-4 bg-white border rounded">
        <p>This component has:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>No RenderLoopDetector</li>
          <li>No SWRDebugger</li>
          <li>No PerformanceMonitor</li>
          <li>No external providers</li>
          <li>No hooks except for basic tracking</li>
        </ul>
        
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-mono text-sm">{renderStats}</p>
        </div>
      </div>
    </div>
  );
} 