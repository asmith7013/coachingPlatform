/**
 * DynamicGraphComponent
 *
 * React wrapper for P5.js coordinate plane (from question-types library)
 * Directly uses the createCoordinatePlane function with config object
 */

'use client';

import { useEffect, useRef } from 'react';

// This matches the config structure from coordinate-plane-p5.js
export interface CoordinatePlaneConfig {
  // Canvas size
  width?: number; // Canvas width in pixels (default: 600)
  height?: number; // Canvas height in pixels (default: 600)

  // Axis Configuration
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  gridScaleX?: number;
  gridScaleY?: number;

  // Labels
  xLabel?: string;
  yLabel?: string;
  xVariable?: string | null;
  yVariable?: string | null;

  // Initial data
  initialPoints?: Array<{ x: number; y: number }>;
  initialEquations?: Array<{ slope: number; intercept: number; color?: [number, number, number] }>;
  initialLines?: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; color?: [number, number, number] }>;
  predrawnStartPoint?: { x: number; y: number } | null;

  // Display options
  showCoordinatesOnHover?: boolean;
  drawFullLines?: boolean;

  // Interaction mode
  allowInput?: boolean; // If false, displays as static graph (no drawing/editing)
}

export interface CoordinatePlaneCallbacks {
  onLineDrawn?: (line: { start: { x: number; y: number }; end: { x: number; y: number } }) => void;
  onLinesChanged?: (lines: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>) => void;
}

interface DynamicGraphComponentProps {
  config: CoordinatePlaneConfig;
  callbacks?: CoordinatePlaneCallbacks;
  className?: string;
}

interface P5Instance {
  remove: () => void;
}

export function DynamicGraphComponent({ config, callbacks, className = '' }: DynamicGraphComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<P5Instance | null>(null);
  const containerIdRef = useRef<string>(`coordinate-plane-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;

    // Check if createCoordinatePlane is available
    const globalWindow = window as typeof window & { createCoordinatePlane?: (id: string, config: CoordinatePlaneConfig, callbacks: CoordinatePlaneCallbacks) => P5Instance };
    const createCoordinatePlane = globalWindow.createCoordinatePlane;

    if (!createCoordinatePlane) {
      console.warn('createCoordinatePlane not loaded. Make sure coordinate-plane-p5.js is loaded.');
      return;
    }

    // Clear previous instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }

    // Set container ID
    containerRef.current.id = containerIdRef.current;

    // Create P5 instance with configuration - exactly like production
    try {
      p5InstanceRef.current = createCoordinatePlane(
        containerIdRef.current,
        config,
        callbacks || {}
      );
    } catch (error) {
      console.error('Error creating coordinate plane:', error);
    }

    // Cleanup
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [config, callbacks]);

  return <div ref={containerRef} className={className} />;
}
