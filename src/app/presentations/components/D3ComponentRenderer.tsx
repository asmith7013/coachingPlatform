/**
 * D3ComponentRenderer
 *
 * Dynamically renders D3 components from the question-types library
 * for use in worked example presentation slides.
 *
 * This component maps visual type configurations from the database
 * to actual D3 component implementations.
 */

import React from 'react';
import { DynamicGraphComponent } from './DynamicGraphComponent';

// Type definitions for visual content
export type VisualContent =
  | TableVisual
  | GraphVisual
  | DoubleNumberLineVisual
  | EquationVisual
  | D3ComponentVisual;

interface TableVisual {
  type: 'table';
  tableData: Array<{ input: number; output: number | null }>;
  inputLabel: string;
  outputLabel: string;
}

interface GraphVisual {
  type: 'graph';
  graphType: 'static' | 'dynamic';
  points: Array<[number, number | null]>;
  xLabel: string;
  yLabel: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  showOrigin?: boolean;
}

interface DoubleNumberLineVisual {
  type: 'double-number-line';
  topLabel: string;
  bottomLabel: string;
  segments: Array<{ top: number | null; bottom: number | null }>;
}

interface EquationVisual {
  type: 'equation';
  equation: string;
  variables: Record<string, number | null>;
}

interface D3ComponentVisual {
  type: 'd3-component';
  componentName: string;
  config: Record<string, unknown>;
}

interface D3ComponentRendererProps {
  visual: VisualContent;
  highlightTarget?: string;
  className?: string;
}

/**
 * Maps D3 component names to their implementations.
 *
 * TODO: Import actual D3 components from question-types library
 * once they're adapted for Spectacle/React rendering.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, React.ComponentType<any>> = {
  // Table components
  'Table': () => <div>Table Component (to be implemented)</div>,

  // Graph components
  'StaticGraph': () => <div>Static Graph Component (to be implemented)</div>,
  'DynamicGraph': DynamicGraphComponent,

  // Number line components
  'DoubleNumberLine': () => <div>Double Number Line Component (to be implemented)</div>,

  // Other components
  'IncrementControls': () => <div>Increment Controls Component (to be implemented)</div>,
  'Slider': () => <div>Slider Component (to be implemented)</div>,
};

/**
 * Renders a table visual
 */
function TableRenderer({ visual, highlightTarget, className }: {
  visual: TableVisual;
  highlightTarget?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">{visual.inputLabel}</th>
            <th className="border border-gray-400 px-4 py-2">{visual.outputLabel}</th>
          </tr>
        </thead>
        <tbody>
          {visual.tableData.map((row, index) => (
            <tr
              key={index}
              className={highlightTarget === String(index) ? 'bg-yellow-100 border-2 border-yellow-500' : ''}
            >
              <td className="border border-gray-400 px-4 py-2 text-center">{row.input}</td>
              <td className="border border-gray-400 px-4 py-2 text-center">
                {row.output === null ? '?' : row.output}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders a graph visual (placeholder - needs actual implementation)
 */
function GraphRenderer({ visual, className }: {
  visual: GraphVisual;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="border border-gray-300 p-4 bg-white">
        <p className="text-sm text-gray-600 mb-2">
          {visual.graphType === 'static' ? 'Static' : 'Dynamic'} Graph
        </p>
        <p className="text-xs text-gray-500">
          {visual.xLabel} vs {visual.yLabel}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Points: {JSON.stringify(visual.points)}
        </p>
        {/* TODO: Implement actual graph rendering using D3 or similar */}
      </div>
    </div>
  );
}

/**
 * Renders a double number line visual (placeholder)
 */
function DoubleNumberLineRenderer({ visual, className }: {
  visual: DoubleNumberLineVisual;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="border border-gray-300 p-4 bg-white">
        <p className="text-sm font-medium">{visual.topLabel}</p>
        <div className="h-8 border-t-2 border-b-2 border-gray-400 my-2"></div>
        <p className="text-sm font-medium">{visual.bottomLabel}</p>
        <p className="text-xs text-gray-400 mt-2">
          Segments: {JSON.stringify(visual.segments)}
        </p>
        {/* TODO: Implement actual double number line rendering */}
      </div>
    </div>
  );
}

/**
 * Renders an equation visual (placeholder)
 */
function EquationRenderer({ visual, className }: {
  visual: EquationVisual;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="border border-gray-300 p-4 bg-white text-center">
        <p className="text-2xl font-mono">{visual.equation}</p>
        {Object.keys(visual.variables).length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {Object.entries(visual.variables).map(([key, value]) => (
              <span key={key} className="mr-4">
                {key} = {value === null ? '?' : value}
              </span>
            ))}
          </div>
        )}
        {/* TODO: Implement LaTeX rendering if equation uses LaTeX */}
      </div>
    </div>
  );
}

/**
 * Main D3ComponentRenderer component
 *
 * Routes to appropriate renderer based on visual type
 */
export function D3ComponentRenderer({
  visual,
  highlightTarget,
  className = ''
}: D3ComponentRendererProps) {
  switch (visual.type) {
    case 'table':
      return <TableRenderer visual={visual} highlightTarget={highlightTarget} className={className} />;

    case 'graph':
      return <GraphRenderer visual={visual} className={className} />;

    case 'double-number-line':
      return <DoubleNumberLineRenderer visual={visual} className={className} />;

    case 'equation':
      return <EquationRenderer visual={visual} className={className} />;

    case 'd3-component': {
      const Component = componentMap[visual.componentName];
      if (!Component) {
        console.warn(`D3 component "${visual.componentName}" not found in componentMap`);
        return (
          <div className={className}>
            <div className="border border-red-300 p-4 bg-red-50">
              <p className="text-red-600">
                Component not found: {visual.componentName}
              </p>
            </div>
          </div>
        );
      }
      return (
        <div className={className}>
          <Component {...visual.config} />
        </div>
      );
    }

    default:
      return (
        <div className={className}>
          <div className="border border-gray-300 p-4 bg-gray-50">
            <p className="text-gray-600">Unknown visual type</p>
          </div>
        </div>
      );
  }
}

export default D3ComponentRenderer;
