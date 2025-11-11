"use client";

import React, { useState, useEffect, useRef } from "react";
import { EXAMPLE_SKETCHES } from "./examples";

export default function AnimationsPlayground() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState("");
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const currentSketchRef = useRef<any>(null);

  // Default starter code
  const DEFAULT_CODE = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 153, 51);
  rect(150, 150, 100, 100);
}`;

  // Load code from localStorage or use default
  useEffect(() => {
    const savedCode = localStorage.getItem("p5-playground-code");
    setCode(savedCode || DEFAULT_CODE);
  }, []);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (code) {
      localStorage.setItem("p5-playground-code", code);
    }
  }, [code]);

  // Run the p5.js code using iframe sandbox (most reliable approach)
  const runCode = () => {
    setError(null);

    // Clear the container
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = "";
    }

    try {
      // Create an iframe for complete isolation
      const iframe = document.createElement("iframe");
      iframe.style.border = "none";
      iframe.style.width = "400px";
      iframe.style.height = "400px";
      iframe.style.margin = "auto";
      iframe.style.display = "block";

      // Create the iframe content with p5.js and user code
      const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              background: white;
              touch-action: manipulation;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            canvas {
              display: block;
              touch-action: none;
            }
            #canvas-container {
              transform-origin: center center;
              transition: transform 0.1s ease-out;
            }
          </style>
        </head>
        <body>
          <div id="canvas-container"></div>
          <script>
            // Pinch to zoom support
            let scale = 1;
            let lastDistance = 0;

            document.addEventListener('touchstart', function(e) {
              if (e.touches.length === 2) {
                lastDistance = Math.hypot(
                  e.touches[0].pageX - e.touches[1].pageX,
                  e.touches[0].pageY - e.touches[1].pageY
                );
              }
            });

            document.addEventListener('touchmove', function(e) {
              if (e.touches.length === 2) {
                e.preventDefault();
                const distance = Math.hypot(
                  e.touches[0].pageX - e.touches[1].pageX,
                  e.touches[0].pageY - e.touches[1].pageY
                );

                if (lastDistance > 0) {
                  const delta = distance - lastDistance;
                  scale += delta * 0.01;
                  scale = Math.max(0.5, Math.min(5, scale));

                  const container = document.getElementById('canvas-container');
                  if (container) {
                    container.style.transform = 'scale(' + scale + ')';
                  }
                }
                lastDistance = distance;
              }
            }, { passive: false });

            document.addEventListener('touchend', function(e) {
              if (e.touches.length < 2) {
                lastDistance = 0;
              }
            });

            // Mouse wheel zoom for desktop
            document.addEventListener('wheel', function(e) {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY * -0.01;
                scale += delta;
                scale = Math.max(0.5, Math.min(5, scale));

                const container = document.getElementById('canvas-container');
                if (container) {
                  container.style.transform = 'scale(' + scale + ')';
                }
              }
            }, { passive: false });

            // Capture errors and send to parent
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              window.parent.postMessage({
                type: 'error',
                message: msg,
                line: lineNo,
                column: columnNo
              }, '*');
              return false;
            };

            // Override createCanvas to append to container
            const originalCreateCanvas = window.createCanvas;
            window.createCanvas = function() {
              const canvas = originalCreateCanvas.apply(this, arguments);
              const container = document.getElementById('canvas-container');
              if (container && canvas && canvas.elt) {
                container.appendChild(canvas.elt);
              }
              return canvas;
            };

            // User code
            try {
              ${code}
            } catch (err) {
              window.parent.postMessage({
                type: 'error',
                message: err.message
              }, '*');
            }
          </script>
        </body>
        </html>
      `;

      iframe.srcdoc = iframeContent;

      // Listen for error messages from iframe
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "error") {
          setError(event.data.message);
        }
      };

      window.addEventListener("message", messageHandler);

      // Store reference for cleanup
      currentSketchRef.current = {
        iframe,
        messageHandler,
      };

      // Append iframe to container
      canvasContainerRef.current?.appendChild(iframe);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Error creating iframe:", err);
    }
  };

  // Load an example
  const loadExample = (exampleId: string) => {
    const example = EXAMPLE_SKETCHES.find((ex) => ex.id === exampleId);
    if (example) {
      setCode(example.code);
      setSelectedExample(exampleId);
    }
  };

  // Clear and reset
  const clearCode = () => {
    setCode(DEFAULT_CODE);
    setError(null);
    setSelectedExample("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                p5.js Animation Playground
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create math manipulatives and animations
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedExample}
                onChange={(e) => loadExample(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Load Example...</option>
                {EXAMPLE_SKETCHES.map((example) => (
                  <option key={example.id} value={example.id}>
                    {example.name}
                  </option>
                ))}
              </select>
              <button
                onClick={runCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                ▶ Run
              </button>
              <button
                onClick={clearCode}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-700">Code Editor</h2>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Write your p5.js code here..."
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
            </div>
            <div className="flex-1 bg-gray-100 p-0 overflow-auto relative flex items-center justify-center">
              <div ref={canvasContainerRef} className="bg-white"></div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="border-t border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-semibold text-sm">Error:</span>
                  <pre className="text-red-800 text-sm font-mono whitespace-pre-wrap flex-1">
                    {error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Write your p5.js code in the editor (setup and draw functions)</li>
            <li>Click "Run" to see your animation</li>
            <li>Your code is automatically saved in your browser</li>
            <li>Use the dropdown to load example sketches</li>
            <li>Press Cmd/Ctrl + Enter to run (coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
