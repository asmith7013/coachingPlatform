'use client';

import { useState, useMemo } from 'react';
import Script from 'next/script';
import { D3ComponentRenderer } from '../components/D3ComponentRenderer';
import type { CoordinatePlaneConfig } from '../components/DynamicGraphComponent';

export default function TestPage() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Default configuration matching production example
  const [config, setConfig] = useState<CoordinatePlaneConfig>({
    width: 600,
    height: 600,
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 100,
    gridScaleX: 1,
    gridScaleY: 10,
    xLabel: 'Time (minutes)',
    yLabel: 'Distance (meters)',
    xVariable: 't',
    yVariable: 'd',
    predrawnStartPoint: null,
    drawFullLines: true,
    showCoordinatesOnHover: true,
    initialPoints: [],
    initialEquations: [],
    initialLines: [],
    allowInput: true,
  });

  interface Line {
    start: { x: number; y: number };
    end: { x: number; y: number };
  }

  const [drawnLines, setDrawnLines] = useState<Line[]>([]);
  const [showAdvancedLabels, setShowAdvancedLabels] = useState(false);

  const handleScriptLoad = () => {
    setScriptsLoaded(true);
  };

  const updateConfig = (key: keyof CoordinatePlaneConfig, value: CoordinatePlaneConfig[typeof key]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const callbacks = useMemo(() => ({
    onLineDrawn: (line: Line) => {
      console.log('Line drawn:', line);
    },
    onLinesChanged: (lines: Line[]) => {
      console.log('Lines changed:', lines);
      setDrawnLines(lines);
    },
  }), []);

  return (
    <>
      {/* Load P5.js from CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Load coordinate plane component */}
      <Script
        src="/scripts/coordinate-plane-p5.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">D3 Component Test Page</h1>
          <p className="text-gray-600 mb-8">
            Test and configure question-types components in real-time
          </p>

          {!scriptsLoaded && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">Loading P5.js and coordinate plane script...</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Area */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>

              {scriptsLoaded ? (
                <D3ComponentRenderer
                  visual={{
                    type: 'd3-component',
                    componentName: 'DynamicGraph',
                    config: { config, callbacks },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}

              {drawnLines.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-2">Drawn Lines:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(drawnLines, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>

              <div className="space-y-6">
                {/* Canvas Size */}
                <div>
                  <h3 className="font-medium mb-3">Canvas Size</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={config.width ?? ''}
                        onChange={(e) => updateConfig('width', e.target.value === '' ? 600 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.width === undefined || config.width === null || isNaN(config.width)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={config.height ?? ''}
                        onChange={(e) => updateConfig('height', e.target.value === '' ? 600 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.height === undefined || config.height === null || isNaN(config.height)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Axis Ranges */}
                <div>
                  <h3 className="font-medium mb-3">Axis Ranges</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Min
                      </label>
                      <input
                        type="number"
                        value={config.xMin ?? ''}
                        onChange={(e) => updateConfig('xMin', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.xMin === undefined || config.xMin === null || isNaN(config.xMin)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Max
                      </label>
                      <input
                        type="number"
                        value={config.xMax ?? ''}
                        onChange={(e) => updateConfig('xMax', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.xMax === undefined || config.xMax === null || isNaN(config.xMax)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Min
                      </label>
                      <input
                        type="number"
                        value={config.yMin ?? ''}
                        onChange={(e) => updateConfig('yMin', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.yMin === undefined || config.yMin === null || isNaN(config.yMin)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Max
                      </label>
                      <input
                        type="number"
                        value={config.yMax ?? ''}
                        onChange={(e) => updateConfig('yMax', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.yMax === undefined || config.yMax === null || isNaN(config.yMax)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Grid Scale */}
                <div>
                  <h3 className="font-medium mb-3">Grid Scale</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grid Scale X
                      </label>
                      <input
                        type="number"
                        value={config.gridScaleX ?? ''}
                        onChange={(e) => updateConfig('gridScaleX', e.target.value === '' ? 1 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.gridScaleX === undefined || config.gridScaleX === null || isNaN(config.gridScaleX)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grid Scale Y
                      </label>
                      <input
                        type="number"
                        value={config.gridScaleY ?? ''}
                        onChange={(e) => updateConfig('gridScaleY', e.target.value === '' ? 1 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md ${
                          config.gridScaleY === undefined || config.gridScaleY === null || isNaN(config.gridScaleY)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <h3 className="font-medium mb-3">Labels</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X-Axis Label
                      </label>
                      <input
                        type="text"
                        value={config.xLabel}
                        onChange={(e) => updateConfig('xLabel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y-Axis Label
                      </label>
                      <input
                        type="text"
                        value={config.yLabel}
                        onChange={(e) => updateConfig('yLabel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      onClick={() => setShowAdvancedLabels(!showAdvancedLabels)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showAdvancedLabels ? '− Hide' : '+ Show'} italic variable labels (optional)
                    </button>
                    {showAdvancedLabels && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            X Variable (italic)
                          </label>
                          <input
                            type="text"
                            value={config.xVariable || ''}
                            onChange={(e) => updateConfig('xVariable', e.target.value || null)}
                            placeholder="e.g., t"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Y Variable (italic)
                          </label>
                          <input
                            type="text"
                            value={config.yVariable || ''}
                            onChange={(e) => updateConfig('yVariable', e.target.value || null)}
                            placeholder="e.g., d"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Display Options */}
                <div>
                  <h3 className="font-medium mb-3">Display Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.drawFullLines}
                        onChange={(e) => updateConfig('drawFullLines', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Draw Full Lines (extend to edges)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showCoordinatesOnHover}
                        onChange={(e) => updateConfig('showCoordinatesOnHover', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Show Coordinates on Hover</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.allowInput !== false}
                        onChange={(e) => updateConfig('allowInput', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-blue-700">Allow Input (Interactive Mode)</span>
                    </label>
                  </div>
                </div>

                {/* Preset Data - Points */}
                <div>
                  <h3 className="font-medium mb-3">Initial Points</h3>
                  <div className="space-y-2">
                    {config.initialPoints?.map((point, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={point.x ?? ''}
                          onChange={(e) => {
                            const newPoints = [...(config.initialPoints || [])];
                            newPoints[index] = { ...newPoints[index], x: e.target.value === '' ? 0 : Number(e.target.value) };
                            updateConfig('initialPoints', newPoints);
                          }}
                          className={`w-20 px-2 py-1 border rounded text-sm ${
                            point.x === undefined || point.x === null || isNaN(point.x)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="x"
                        />
                        <input
                          type="number"
                          value={point.y ?? ''}
                          onChange={(e) => {
                            const newPoints = [...(config.initialPoints || [])];
                            newPoints[index] = { ...newPoints[index], y: e.target.value === '' ? 0 : Number(e.target.value) };
                            updateConfig('initialPoints', newPoints);
                          }}
                          className={`w-20 px-2 py-1 border rounded text-sm ${
                            point.y === undefined || point.y === null || isNaN(point.y)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="y"
                        />
                        <button
                          onClick={() => {
                            const newPoints = [...(config.initialPoints || [])];
                            newPoints.splice(index, 1);
                            updateConfig('initialPoints', newPoints);
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newPoints = [...(config.initialPoints || []), { x: 0, y: 0 }];
                        updateConfig('initialPoints', newPoints);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      + Add Point
                    </button>
                  </div>
                </div>

                {/* Preset Data - Equations */}
                <div>
                  <h3 className="font-medium mb-3">Initial Equations (y = mx + b)</h3>
                  <div className="space-y-2">
                    {config.initialEquations?.map((eq, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-600 mb-0.5">m (slope)</label>
                          <input
                            type="number"
                            value={eq.slope ?? ''}
                            onChange={(e) => {
                              const newEqs = [...(config.initialEquations || [])];
                              newEqs[index] = { ...newEqs[index], slope: e.target.value === '' ? 0 : Number(e.target.value) };
                              updateConfig('initialEquations', newEqs);
                            }}
                            className={`w-20 px-2 py-1 border rounded text-sm ${
                              eq.slope === undefined || eq.slope === null || isNaN(eq.slope)
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="slope"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-600 mb-0.5">b (y-int)</label>
                          <input
                            type="number"
                            value={eq.intercept ?? ''}
                            onChange={(e) => {
                              const newEqs = [...(config.initialEquations || [])];
                              newEqs[index] = { ...newEqs[index], intercept: e.target.value === '' ? 0 : Number(e.target.value) };
                              updateConfig('initialEquations', newEqs);
                            }}
                            className={`w-20 px-2 py-1 border rounded text-sm ${
                              eq.intercept === undefined || eq.intercept === null || isNaN(eq.intercept)
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="intercept"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newEqs = [...(config.initialEquations || [])];
                            newEqs.splice(index, 1);
                            updateConfig('initialEquations', newEqs);
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 mt-5"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newEqs = [...(config.initialEquations || []), { slope: 1, intercept: 0 }];
                        updateConfig('initialEquations', newEqs);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      + Add Equation
                    </button>
                  </div>
                </div>

                {/* Preset Data - Lines */}
                <div>
                  <h3 className="font-medium mb-3">Initial Lines</h3>
                  <div className="space-y-2">
                    {config.initialLines?.map((line, index) => (
                      <div key={index} className="flex gap-2 items-center flex-wrap">
                        <input
                          type="number"
                          value={line.start.x ?? ''}
                          onChange={(e) => {
                            const newLines = [...(config.initialLines || [])];
                            newLines[index] = {
                              ...newLines[index],
                              start: { ...newLines[index].start, x: e.target.value === '' ? 0 : Number(e.target.value) }
                            };
                            updateConfig('initialLines', newLines);
                          }}
                          className={`w-16 px-2 py-1 border rounded text-sm ${
                            line.start.x === undefined || line.start.x === null || isNaN(line.start.x)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="x1"
                        />
                        <input
                          type="number"
                          value={line.start.y ?? ''}
                          onChange={(e) => {
                            const newLines = [...(config.initialLines || [])];
                            newLines[index] = {
                              ...newLines[index],
                              start: { ...newLines[index].start, y: e.target.value === '' ? 0 : Number(e.target.value) }
                            };
                            updateConfig('initialLines', newLines);
                          }}
                          className={`w-16 px-2 py-1 border rounded text-sm ${
                            line.start.y === undefined || line.start.y === null || isNaN(line.start.y)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="y1"
                        />
                        <span className="text-gray-500">→</span>
                        <input
                          type="number"
                          value={line.end.x ?? ''}
                          onChange={(e) => {
                            const newLines = [...(config.initialLines || [])];
                            newLines[index] = {
                              ...newLines[index],
                              end: { ...newLines[index].end, x: e.target.value === '' ? 0 : Number(e.target.value) }
                            };
                            updateConfig('initialLines', newLines);
                          }}
                          className={`w-16 px-2 py-1 border rounded text-sm ${
                            line.end.x === undefined || line.end.x === null || isNaN(line.end.x)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="x2"
                        />
                        <input
                          type="number"
                          value={line.end.y ?? ''}
                          onChange={(e) => {
                            const newLines = [...(config.initialLines || [])];
                            newLines[index] = {
                              ...newLines[index],
                              end: { ...newLines[index].end, y: e.target.value === '' ? 0 : Number(e.target.value) }
                            };
                            updateConfig('initialLines', newLines);
                          }}
                          className={`w-16 px-2 py-1 border rounded text-sm ${
                            line.end.y === undefined || line.end.y === null || isNaN(line.end.y)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="y2"
                        />
                        <button
                          onClick={() => {
                            const newLines = [...(config.initialLines || [])];
                            newLines.splice(index, 1);
                            updateConfig('initialLines', newLines);
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newLines = [...(config.initialLines || []), {
                          start: { x: 0, y: 0 },
                          end: { x: 1, y: 1 },
                          color: [37, 99, 235] as [number, number, number]
                        }];
                        updateConfig('initialLines', newLines);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      + Add Line
                    </button>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <h3 className="font-medium mb-3">Presets</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setConfig({
                        width: 600, height: 600,
                        xMin: 0, xMax: 10, yMin: 0, yMax: 100,
                        gridScaleX: 1, gridScaleY: 10,
                        xLabel: 'Time (minutes)', yLabel: 'Distance (meters)',
                        xVariable: 't', yVariable: 'd',
                        predrawnStartPoint: null,
                        drawFullLines: true,
                        showCoordinatesOnHover: true,
                        initialPoints: [], initialEquations: [], initialLines: [],
                        allowInput: true,
                      })}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Interactive (Time vs Distance)
                    </button>
                    <button
                      onClick={() => setConfig({
                        width: 600, height: 600,
                        xMin: 0, xMax: 9, yMin: 0, yMax: 32,
                        gridScaleX: 1, gridScaleY: 2,
                        xLabel: 'Cups of Orange Juice', yLabel: 'Cups of Pineapple Juice',
                        xVariable: null, yVariable: null,
                        predrawnStartPoint: { x: 0, y: 0 },
                        drawFullLines: true,
                        showCoordinatesOnHover: true,
                        initialPoints: [], initialEquations: [], initialLines: [],
                        allowInput: true,
                      })}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Interactive Recipe (with start point)
                    </button>
                    <button
                      onClick={() => setConfig({
                        width: 600, height: 600,
                        xMin: 0, xMax: 10, yMin: 0, yMax: 50,
                        gridScaleX: 1, gridScaleY: 5,
                        xLabel: 'Hours', yLabel: 'Miles',
                        xVariable: null, yVariable: null,
                        predrawnStartPoint: null,
                        drawFullLines: true,
                        showCoordinatesOnHover: false,
                        initialPoints: [{ x: 2, y: 10 }, { x: 5, y: 25 }, { x: 8, y: 40 }],
                        initialEquations: [],
                        initialLines: [
                          { start: { x: 0, y: 0 }, end: { x: 10, y: 50 }, color: [37, 99, 235] },
                        ],
                        allowInput: false,
                      })}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Static Graph (Display Only)
                    </button>
                    <button
                      onClick={() => setConfig({
                        width: 600, height: 600,
                        xMin: 0, xMax: 10, yMin: 0, yMax: 100,
                        gridScaleX: 1, gridScaleY: 10,
                        xLabel: 'Time (seconds)', yLabel: 'Speed (m/s)',
                        xVariable: null, yVariable: null,
                        predrawnStartPoint: null,
                        drawFullLines: true,
                        showCoordinatesOnHover: false,
                        initialPoints: [],
                        initialEquations: [
                          { slope: 5, intercept: 0, color: [34, 197, 94] },
                          { slope: 8, intercept: 10, color: [239, 68, 68] },
                        ],
                        initialLines: [],
                        allowInput: false,
                      })}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Static with Equations (Reference Lines)
                    </button>
                    <button
                      onClick={() => setConfig({
                        width: 800, height: 400,
                        xMin: 0, xMax: 12, yMin: 0, yMax: 60,
                        gridScaleX: 1, gridScaleY: 10,
                        xLabel: 'Months', yLabel: 'Temperature (°F)',
                        xVariable: null, yVariable: null,
                        predrawnStartPoint: null,
                        drawFullLines: false,
                        showCoordinatesOnHover: false,
                        initialPoints: [
                          { x: 1, y: 32 }, { x: 3, y: 45 }, { x: 6, y: 72 },
                          { x: 9, y: 58 }, { x: 12, y: 35 }
                        ],
                        initialEquations: [],
                        initialLines: [],
                        allowInput: false,
                      })}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Wide Graph (800x400) with Points
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
