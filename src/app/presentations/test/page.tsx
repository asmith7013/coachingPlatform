'use client';

import { useState } from 'react';
import Script from 'next/script';
import { D3ComponentRenderer } from '../components/D3ComponentRenderer';
import type { CoordinatePlaneConfig } from '../components/DynamicGraphComponent';

export default function TestPage() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Default configuration matching production example
  const [config, setConfig] = useState<CoordinatePlaneConfig>({
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
  });

  interface Line {
    start: { x: number; y: number };
    end: { x: number; y: number };
  }

  const [drawnLines, setDrawnLines] = useState<Line[]>([]);

  const handleScriptLoad = () => {
    setScriptsLoaded(true);
  };

  const updateConfig = (key: keyof CoordinatePlaneConfig, value: CoordinatePlaneConfig[typeof key]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const callbacks = {
    onLineDrawn: (line: Line) => {
      console.log('Line drawn:', line);
    },
    onLinesChanged: (lines: Line[]) => {
      console.log('Lines changed:', lines);
      setDrawnLines(lines);
    },
  };

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
                        value={config.xMin}
                        onChange={(e) => updateConfig('xMin', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Max
                      </label>
                      <input
                        type="number"
                        value={config.xMax}
                        onChange={(e) => updateConfig('xMax', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Min
                      </label>
                      <input
                        type="number"
                        value={config.yMin}
                        onChange={(e) => updateConfig('yMin', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Max
                      </label>
                      <input
                        type="number"
                        value={config.yMax}
                        onChange={(e) => updateConfig('yMax', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        value={config.gridScaleX}
                        onChange={(e) => updateConfig('gridScaleX', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grid Scale Y
                      </label>
                      <input
                        type="number"
                        value={config.gridScaleY}
                        onChange={(e) => updateConfig('gridScaleY', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Variable (italic, optional)
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
                        Y Variable (italic, optional)
                      </label>
                      <input
                        type="text"
                        value={config.yVariable || ''}
                        onChange={(e) => updateConfig('yVariable', e.target.value || null)}
                        placeholder="e.g., d"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
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
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <h3 className="font-medium mb-3">Presets</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setConfig({
                        xMin: 0, xMax: 10, yMin: 0, yMax: 100,
                        gridScaleX: 1, gridScaleY: 10,
                        xLabel: 'Time (minutes)', yLabel: 'Distance (meters)',
                        xVariable: 't', yVariable: 'd',
                        predrawnStartPoint: null,
                        drawFullLines: true,
                        showCoordinatesOnHover: true,
                        initialPoints: [], initialEquations: [],
                      })}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Default (Time vs Distance)
                    </button>
                    <button
                      onClick={() => setConfig({
                        xMin: 0, xMax: 9, yMin: 0, yMax: 32,
                        gridScaleX: 1, gridScaleY: 2,
                        xLabel: 'Cups of Orange Juice', yLabel: 'Cups of Pineapple Juice',
                        xVariable: null, yVariable: null,
                        predrawnStartPoint: { x: 0, y: 0 },
                        drawFullLines: true,
                        showCoordinatesOnHover: true,
                        initialPoints: [], initialEquations: [],
                      })}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Recipe Example (with start point)
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
