"use client";

import React, { useEffect, useRef } from 'react';
import { RenderLoopDetector } from './RenderLoopDetector';
import { SWRDebugger } from './SWRDebugger';
import { IsolateComponent } from './IsolateComponent';

// Bisection mode type
type BisectionMode = 'full' | 'no-search' | 'no-list' | 'no-form' | 'minimal';

// Props for the StaffList debugger
interface StaffListDebuggerProps {
  children: React.ReactNode;
  mode?: BisectionMode;
}

/**
 * Specialized debugger for StaffList component that supports bisection debugging
 */
export function StaffListDebugger({ children, mode = 'full' }: StaffListDebuggerProps) {
  const renderCount = useRef(0);
  const modeRef = useRef(mode);
  
  // Track reference stability of children prop
  const childrenRef = useRef(children);
  const isChildrenSame = childrenRef.current === children;
  childrenRef.current = children;
  
  useEffect(() => {
    renderCount.current++;
    console.log(`StaffListDebugger rendered (${renderCount.current}), mode: ${mode}`);
    
    // Log if children reference changed
    if (!isChildrenSame) {
      console.warn('⚠️ Children reference changed between renders');
    }
    
    // Log if mode changed
    if (modeRef.current !== mode) {
      console.log(`Mode changed from ${modeRef.current} to ${mode}`);
      modeRef.current = mode;
    }
    
    return () => {
      console.log('StaffListDebugger unmounted');
    };
  });
  
  return (
    <IsolateComponent title={`StaffList Debug (${mode} mode)`}>
      <RenderLoopDetector componentId={`staff-list-${mode}`}>
        <SWRDebugger componentId={`staff-swr-${mode}`}>
          {children}
        </SWRDebugger>
      </RenderLoopDetector>
      
      {/* Debug control panel */}
      <div className="mt-4 p-3 bg-gray-800 text-white rounded text-xs">
        <h3 className="font-bold">Debugging Notes:</h3>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li>Current bisection mode: <strong>{mode}</strong></li>
          <li>Check component props stability in console</li>
          <li>Look for missing useMemo/useCallback dependencies</li>
          <li>{'Watch for objects created in component body {}'}</li>
          <li>Check for circular state updates in effects</li>
        </ul>
      </div>
    </IsolateComponent>
  );
}

/**
 * Higher-order component to run memoization checks on the StaffList
 * This helps identify component parts that need memoization
 */
export function withMemoizationChecks<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = 'Component'
): React.FC<P> {
  return function MemoCheckedComponent(props: P) {
    const propsRef = useRef<P | null>(null);
    const renderCountRef = useRef(0);
    
    useEffect(() => {
      renderCountRef.current++;
      console.log(`🔍 ${componentName} render #${renderCountRef.current}`);
      
      if (propsRef.current) {
        // Compare current props with previous props
        const changedProps: string[] = [];
        const newProps: string[] = [];
        const unstableObjects: string[] = [];
        
        Object.keys(props).forEach(key => {
          const k = key as keyof P;
          
          // Check if prop is new
          if (!(k in (propsRef.current as P))) {
            newProps.push(key);
            return;
          }
          
          // Check if prop changed
          if (props[k] !== (propsRef.current as P)[k]) {
            changedProps.push(key);
            
            // Check for objects and functions which should be memoized
            if (
              typeof props[k] === 'object' || 
              typeof props[k] === 'function'
            ) {
              unstableObjects.push(key);
            }
          }
        });
        
        if (changedProps.length > 0) {
          console.log('Changed props:', changedProps);
        }
        
        if (unstableObjects.length > 0) {
          console.warn('⚠️ Unstable objects/functions detected:', unstableObjects);
          console.log('These should be memoized with useMemo/useCallback');
        }
      }
      
      // Update props reference
      propsRef.current = { ...props };
    });
    
    return <Component {...props} />;
  };
} 