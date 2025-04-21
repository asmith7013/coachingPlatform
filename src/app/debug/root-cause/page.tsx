"use client";

import React, { useState } from 'react';
import { CheckDebugTools } from '@/hooks/debugging/checkRenderLoopInTools';
import Link from 'next/link';

/**
 * This page provides a comprehensive analysis of potential render loop causes
 */
export default function RootCausePage() {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Render Loop Root Cause Analysis</h1>
      <p className="mb-6 text-gray-600">
        This page helps identify the fundamental cause of render loops in your application
      </p>
      
      <CheckDebugTools />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Potential Causes */}
        <div className="p-5 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Common Causes</h2>
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="mb-4 text-blue-600 underline text-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <ul className="space-y-2">
            <li className="p-3 bg-blue-50 rounded">
              <h3 className="font-bold">1. Debug Tools Themselves</h3>
              {showDetails && (
                <p className="mt-1 text-sm">
                  The RenderLoopDetector or other debugging components might have missing dependencies
                  in their useEffect hooks, causing infinite updates.
                </p>
              )}
            </li>
            
            <li className="p-3 bg-blue-50 rounded">
              <h3 className="font-bold">2. Performance Monitoring</h3>
              {showDetails && (
                <p className="mt-1 text-sm">
                  Performance tracking code might update state based on render counts,
                  creating a circular dependency.
                </p>
              )}
            </li>
            
            <li className="p-3 bg-blue-50 rounded">
              <h3 className="font-bold">3. SWR Configuration</h3>
              {showDetails && (
                <p className="mt-1 text-sm">
                  Global SWR settings might be causing constant revalidation.
                  Check dedupingInterval, revalidateIfStale, etc.
                </p>
              )}
            </li>
            
            <li className="p-3 bg-blue-50 rounded">
              <h3 className="font-bold">4. Global State / Context</h3>
              {showDetails && (
                <p className="mt-1 text-sm">
                  A context provider might be updating its value on each render,
                  causing all consuming components to re-render.
                </p>
              )}
            </li>
            
            <li className="p-3 bg-blue-50 rounded">
              <h3 className="font-bold">5. Strict Mode</h3>
              {showDetails && (
                <p className="mt-1 text-sm">
                  React&apos;s Strict Mode intentionally double-renders components in development.
                  This is normal and helps find bugs, but can look like a render loop.
                </p>
              )}
            </li>
          </ul>
        </div>
        
        {/* Diagnostic Tests */}
        <div className="p-5 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Diagnostic Tests</h2>
          <p className="mb-4 text-sm text-gray-600">
            Use these specialized test pages to isolate the issue:
          </p>
          
          <div className="space-y-3">
            <Link href="/debug/no-debug-tools" className="block p-3 bg-green-50 rounded hover:bg-green-100">
              <h3 className="font-bold">No Debug Tools Test</h3>
              <p className="text-sm mt-1">
                Renders minimal components with no debugging utilities
              </p>
            </Link>
            
            <Link href="/debug/ultra-minimal" className="block p-3 bg-green-50 rounded hover:bg-green-100">
              <h3 className="font-bold">Ultra Minimal Component</h3>
              <p className="text-sm mt-1">
                The simplest possible component with the RenderLoopDetector
              </p>
            </Link>
            
            <Link href="/debug/isolated" className="block p-3 bg-green-50 rounded hover:bg-green-100">
              <h3 className="font-bold">Isolated Component</h3>
              <p className="text-sm mt-1">
                No providers, no context, minimal manual tracking
              </p>
            </Link>
            
            <Link href="/debug/providers-check" className="block p-3 bg-green-50 rounded hover:bg-green-100">
              <h3 className="font-bold">Provider Check</h3>
              <p className="text-sm mt-1">
                Test different provider configurations in isolation
              </p>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-5 bg-yellow-50 rounded">
        <h2 className="text-lg font-bold mb-3">Systematic Investigation Process</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>First check if the issue is in the debugging tools themselves using <code>/debug/no-debug-tools</code></li>
          <li>If that page works normally, examine the debug tool implementations for useEffect dependencies</li>
          <li>Test with different SWR configurations to see if data fetching is involved</li>
          <li>Look at your app&apos;s provider structure - try temporarily removing providers one at a time</li>
          <li>Check for misuse of useState inside render or state updates in non-memoized callbacks</li>
          <li>Review your component tree for circular dependencies between parent and child state</li>
        </ol>
        
        <div className="mt-4 p-3 bg-white rounded">
          <p className="text-sm font-bold">Common Fix Pattern:</p>
          <pre className="mt-2 p-3 bg-gray-100 text-xs overflow-x-auto rounded">
{`// Problem: Missing dependency array
useEffect(() => {
  // This runs on EVERY render with no dependency array
  setSomeState(newValue);
});

// Solution: Add proper dependency array
useEffect(() => {
  setSomeState(newValue);
}, [newValue]); // Only run when newValue changes`}
          </pre>
        </div>
      </div>
    </div>
  );
} 