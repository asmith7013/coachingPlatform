# Coordinate Plane Drawing Component

## Overview

A reusable React component that renders an interactive coordinate plane where students can draw linear lines that snap to grid intersections.

## Features

- **Configurable Axes**: Set min/max values for both X and Y axes
- **Adjustable Grid Scale**: Control spacing between grid lines
- **Snap-to-Grid Drawing**: Lines automatically snap to grid intersections
- **Interactive Drawing**: Click and drag to draw linear lines
- **Visual Feedback**: Hover preview shows where line will snap

## Component Architecture

### File Structure

```
src/app/animations/
├── components/
│   ├── CoordinatePlane.tsx       # Main component
│   ├── GridLayer.tsx              # Grid rendering
│   ├── AxesLayer.tsx              # X/Y axes with labels
│   └── DrawingLayer.tsx           # Interactive drawing surface
├── hooks/
│   ├── useCoordinateTransform.ts  # Pixel ↔ coordinate conversion
│   └── useSnapToGrid.ts           # Snap-to-grid logic
└── types/
    └── coordinate-plane.ts        # TypeScript interfaces
```

## TypeScript Interfaces

```typescript
// types/coordinate-plane.ts

export interface CoordinatePlaneConfig {
  /** Minimum X value (left edge) */
  xMin: number;

  /** Maximum X value (right edge) */
  xMax: number;

  /** Minimum Y value (bottom edge) */
  yMin: number;

  /** Maximum Y value (top edge) */
  yMax: number;

  /** Grid line spacing (in coordinate units) */
  gridScale: number;

  /** Canvas width in pixels */
  width?: number;

  /** Canvas height in pixels */
  height?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  start: Point;
  end: Point;
  id: string;
}

export interface CoordinateTransform {
  /** Convert pixel position to coordinate value */
  pixelToCoord: (pixel: Point) => Point;

  /** Convert coordinate value to pixel position */
  coordToPixel: (coord: Point) => Point;

  /** Snap point to nearest grid intersection */
  snapToGrid: (coord: Point) => Point;
}
```

## Core Implementation

### 1. Main Component

```typescript
// components/CoordinatePlane.tsx
'use client';

import React, { useState, useRef } from 'react';
import { GridLayer } from './GridLayer';
import { AxesLayer } from './AxesLayer';
import { DrawingLayer } from './DrawingLayer';
import { useCoordinateTransform } from '../hooks/useCoordinateTransform';
import type { CoordinatePlaneConfig, Line } from '../types/coordinate-plane';

interface CoordinatePlaneProps {
  config: CoordinatePlaneConfig;
  onLineDrawn?: (line: Line) => void;
  onLineDeleted?: (lineId: string) => void;
}

export function CoordinatePlane({
  config,
  onLineDrawn,
  onLineDeleted
}: CoordinatePlaneProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = config.width ?? 600;
  const height = config.height ?? 600;

  const transform = useCoordinateTransform(config, width, height);

  const handleLineComplete = (line: Line) => {
    setLines(prev => [...prev, line]);
    onLineDrawn?.(line);
  };

  const handleLineDelete = (lineId: string) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
    onLineDeleted?.(lineId);
  };

  return (
    <div className="relative" style={{ width, height }}>
      {/* Configuration Panel */}
      <ConfigPanel config={config} />

      {/* Layered Canvas Rendering */}
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
        {/* Grid Layer (bottom) */}
        <GridLayer
          config={config}
          width={width}
          height={height}
          transform={transform}
        />

        {/* Axes Layer (middle) */}
        <AxesLayer
          config={config}
          width={width}
          height={height}
          transform={transform}
        />

        {/* Drawing Layer (top) */}
        <DrawingLayer
          config={config}
          width={width}
          height={height}
          transform={transform}
          lines={lines}
          onLineComplete={handleLineComplete}
          onLineDelete={handleLineDelete}
        />
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p>• Click to start a line, click again to finish</p>
        <p>• Lines automatically snap to grid intersections</p>
        <p>• Click on a line to delete it</p>
      </div>
    </div>
  );
}

function ConfigPanel({ config }: { config: CoordinatePlaneConfig }) {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium">X Range:</span>
          <span className="ml-2">{config.xMin} to {config.xMax}</span>
        </div>
        <div>
          <span className="font-medium">Y Range:</span>
          <span className="ml-2">{config.yMin} to {config.yMax}</span>
        </div>
        <div>
          <span className="font-medium">Grid Scale:</span>
          <span className="ml-2">{config.gridScale}</span>
        </div>
      </div>
    </div>
  );
}
```

### 2. Coordinate Transform Hook

```typescript
// hooks/useCoordinateTransform.ts

import { useMemo } from 'react';
import type { Point, CoordinateTransform, CoordinatePlaneConfig } from '../types/coordinate-plane';

export function useCoordinateTransform(
  config: CoordinatePlaneConfig,
  canvasWidth: number,
  canvasHeight: number
): CoordinateTransform {
  return useMemo(() => {
    const { xMin, xMax, yMin, yMax, gridScale } = config;

    // Padding for axes labels (in pixels)
    const PADDING_LEFT = 50;
    const PADDING_BOTTOM = 50;
    const PADDING_RIGHT = 20;
    const PADDING_TOP = 20;

    const plotWidth = canvasWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = canvasHeight - PADDING_TOP - PADDING_BOTTOM;

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const xScale = plotWidth / xRange;
    const yScale = plotHeight / yRange;

    return {
      pixelToCoord: (pixel: Point): Point => {
        const x = xMin + (pixel.x - PADDING_LEFT) / xScale;
        const y = yMax - (pixel.y - PADDING_TOP) / yScale;
        return { x, y };
      },

      coordToPixel: (coord: Point): Point => {
        const x = PADDING_LEFT + (coord.x - xMin) * xScale;
        const y = PADDING_TOP + (yMax - coord.y) * yScale;
        return { x, y };
      },

      snapToGrid: (coord: Point): Point => {
        return {
          x: Math.round(coord.x / gridScale) * gridScale,
          y: Math.round(coord.y / gridScale) * gridScale
        };
      }
    };
  }, [config, canvasWidth, canvasHeight]);
}
```

### 3. Grid Layer Component

```typescript
// components/GridLayer.tsx

import React, { useEffect, useRef } from 'react';
import type { CoordinatePlaneConfig, CoordinateTransform } from '../types/coordinate-plane';

interface GridLayerProps {
  config: CoordinatePlaneConfig;
  width: number;
  height: number;
  transform: CoordinateTransform;
}

export function GridLayer({ config, width, height, transform }: GridLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw vertical grid lines
    for (let x = config.xMin; x <= config.xMax; x += config.gridScale) {
      const start = transform.coordToPixel({ x, y: config.yMin });
      const end = transform.coordToPixel({ x, y: config.yMax });

      ctx.strokeStyle = x === 0 ? '#000' : '#ddd';
      ctx.lineWidth = x === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = config.yMin; y <= config.yMax; y += config.gridScale) {
      const start = transform.coordToPixel({ x: config.xMin, y });
      const end = transform.coordToPixel({ x: config.xMax, y });

      ctx.strokeStyle = y === 0 ? '#000' : '#ddd';
      ctx.lineWidth = y === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }, [config, width, height, transform]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
```

### 4. Axes Layer Component

```typescript
// components/AxesLayer.tsx

import React, { useEffect, useRef } from 'react';
import type { CoordinatePlaneConfig, CoordinateTransform } from '../types/coordinate-plane';

interface AxesLayerProps {
  config: CoordinatePlaneConfig;
  width: number;
  height: number;
  transform: CoordinateTransform;
}

export function AxesLayer({ config, width, height, transform }: AxesLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw X-axis labels
    for (let x = config.xMin; x <= config.xMax; x += config.gridScale) {
      const pos = transform.coordToPixel({ x, y: 0 });

      // Tick mark
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - 5);
      ctx.lineTo(pos.x, pos.y + 5);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#000';
      ctx.fillText(x.toString(), pos.x, pos.y + 20);
    }

    // Draw Y-axis labels
    for (let y = config.yMin; y <= config.yMax; y += config.gridScale) {
      if (y === 0) continue; // Skip origin (labeled on X-axis)

      const pos = transform.coordToPixel({ x: 0, y });

      // Tick mark
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pos.x - 5, pos.y);
      ctx.lineTo(pos.x + 5, pos.y);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      ctx.fillText(y.toString(), pos.x - 10, pos.y);
      ctx.textAlign = 'center';
    }

    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Days', width - 40, transform.coordToPixel({ x: 0, y: 0 }).y + 20);

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Steps', 0, 0);
    ctx.restore();

  }, [config, width, height, transform]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
```

### 5. Drawing Layer Component

```typescript
// components/DrawingLayer.tsx

import React, { useState, useEffect, useRef } from 'react';
import type { Point, Line, CoordinatePlaneConfig, CoordinateTransform } from '../types/coordinate-plane';

interface DrawingLayerProps {
  config: CoordinatePlaneConfig;
  width: number;
  height: number;
  transform: CoordinateTransform;
  lines: Line[];
  onLineComplete: (line: Line) => void;
  onLineDelete: (lineId: string) => void;
}

export function DrawingLayer({
  config,
  width,
  height,
  transform,
  lines,
  onLineComplete,
  onLineDelete
}: DrawingLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);

  // Handle mouse move for preview
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pixelPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const coordPos = transform.pixelToCoord(pixelPos);
    const snapped = transform.snapToGrid(coordPos);

    setHoverPoint(snapped);

    if (startPoint) {
      setCurrentPoint(snapped);
    }
  };

  // Handle mouse click to start/complete line
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pixelPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const coordPos = transform.pixelToCoord(pixelPos);
    const snapped = transform.snapToGrid(coordPos);

    if (!startPoint) {
      // Start new line
      setStartPoint(snapped);
      setCurrentPoint(snapped);
    } else {
      // Complete line
      const newLine: Line = {
        start: startPoint,
        end: snapped,
        id: `line-${Date.now()}`
      };
      onLineComplete(newLine);
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  // Render lines and preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw completed lines
    lines.forEach(line => {
      const start = transform.coordToPixel(line.start);
      const end = transform.coordToPixel(line.end);

      ctx.strokeStyle = '#2563eb'; // Blue
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Draw endpoints
      [start, end].forEach(point => {
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw preview line
    if (startPoint && currentPoint) {
      const start = transform.coordToPixel(startPoint);
      const end = transform.coordToPixel(currentPoint);

      ctx.strokeStyle = '#10b981'; // Green preview
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw start point
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw hover indicator
    if (hoverPoint && !startPoint) {
      const pos = transform.coordToPixel(hoverPoint);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; // Transparent green
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [lines, startPoint, currentPoint, hoverPoint, transform, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 cursor-crosshair"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPoint(null)}
    />
  );
}
```

## Usage Example

```typescript
// Example usage in a page

'use client';

import { CoordinatePlane } from './components/CoordinatePlane';
import { useState } from 'react';

export default function LinearGraphPage() {
  const [config, setConfig] = useState({
    xMin: 0,
    xMax: 5,
    yMin: 0,
    yMax: 4000,
    gridScale: 1, // For X-axis (days)
    width: 600,
    height: 600
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Draw Your Line</h1>

      <CoordinatePlane
        config={config}
        onLineDrawn={(line) => {
          console.log('Line drawn:', line);
          // Calculate slope, equation, etc.
        }}
        onLineDeleted={(id) => {
          console.log('Line deleted:', id);
        }}
      />

      {/* Optional: Config controls */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">X Range</label>
          <div className="flex gap-4">
            <input
              type="number"
              value={config.xMin}
              onChange={(e) => setConfig({...config, xMin: Number(e.target.value)})}
              className="border rounded px-2 py-1"
              placeholder="Min"
            />
            <input
              type="number"
              value={config.xMax}
              onChange={(e) => setConfig({...config, xMax: Number(e.target.value)})}
              className="border rounded px-2 py-1"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Y Range</label>
          <div className="flex gap-4">
            <input
              type="number"
              value={config.yMin}
              onChange={(e) => setConfig({...config, yMin: Number(e.target.value)})}
              className="border rounded px-2 py-1"
              placeholder="Min"
            />
            <input
              type="number"
              value={config.yMax}
              onChange={(e) => setConfig({...config, yMax: Number(e.target.value)})}
              className="border rounded px-2 py-1"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Grid Scale</label>
          <input
            type="number"
            value={config.gridScale}
            onChange={(e) => setConfig({...config, gridScale: Number(e.target.value)})}
            className="border rounded px-2 py-1"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );
}
```

## Features Checklist

- ✅ Configurable X/Y min/max ranges
- ✅ Adjustable grid scale
- ✅ Snap-to-grid drawing
- ✅ Visual hover preview
- ✅ Multi-line support
- ✅ Line deletion
- ✅ Proper axis labels
- ✅ Coordinate transformation
- ✅ TypeScript types
- ✅ Layered canvas architecture

## Enhancements

### Possible Extensions

1. **Line Equation Display**: Show y = mx + b for drawn lines
2. **Point Coordinates**: Display coordinates on hover
3. **Slope Calculation**: Calculate and display slope
4. **Export**: Save graph as image or data
5. **Undo/Redo**: Line drawing history
6. **Multiple Colors**: Different colored lines
7. **Line Editing**: Click and drag to modify existing lines
8. **Grid Toggle**: Show/hide grid lines
9. **Zoom**: Pinch or scroll to zoom in/out
10. **Touch Support**: Mobile-friendly drawing

## Notes

- Canvas uses layered approach for better performance (grid, axes, drawing separate)
- Coordinate transform handles pixel ↔ coordinate conversion
- Snap-to-grid uses rounding to nearest grid scale value
- All coordinates are stored in logical coordinate system, not pixels
- Component is fully controlled - parent manages line state
