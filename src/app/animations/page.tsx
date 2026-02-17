"use client";

import React, { useState, useEffect, useRef } from "react";
import { EXAMPLE_SKETCHES, EXAMPLE_CATEGORIES } from "./examples";

export default function AnimationsPlayground() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [_recordingStatus, setRecordingStatus] = useState<"idle" | "capturing">(
    "idle",
  );
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const currentSketchRef = useRef<{
    iframe: HTMLIFrameElement;
    messageHandler: (event: MessageEvent) => void;
  } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

  // Default starter code
  const DEFAULT_CODE = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 153, 51);
  rect(150, 150, 100, 100);
}`;

  // Extract canvas size from code
  const extractCanvasSize = (codeToCheck: string) => {
    const match = codeToCheck.match(
      /createCanvas\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/,
    );
    if (match) {
      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10),
      };
    }
    return { width: 600, height: 600 }; // Default
  };

  // Load code from localStorage or use default
  useEffect(() => {
    const savedCode = localStorage.getItem("p5-playground-code");
    setCode(savedCode || DEFAULT_CODE);
  }, [DEFAULT_CODE]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (code) {
      localStorage.setItem("p5-playground-code", code);
    }
  }, [code]);

  // Run the p5.js code using iframe sandbox (most reliable approach)
  const runCodeWithCode = (codeToRun: string) => {
    setError(null);

    // Extract and set canvas size
    const size = extractCanvasSize(codeToRun);
    setCanvasSize(size);

    // Clear the container
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = "";
    }

    try {
      // Create an iframe for complete isolation
      const iframe = document.createElement("iframe");
      iframe.style.border = "none";
      // Add padding for the toggle button and some margin
      iframe.style.width = `${size.width + 40}px`;
      iframe.style.height = `${size.height + 60}px`;
      iframe.style.maxWidth = "100%";
      iframe.style.margin = "auto";
      iframe.style.display = "block";

      // Create the iframe content with p5.js and user code
      const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
          <script src="https://unpkg.com/p5.gif@0.2.1/dist/p5.gif.min.js"></script>
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
              position: relative;
            }
            canvas {
              display: block;
              touch-action: none;
            }
            #canvas-container {
              transform-origin: center center;
              transition: transform 0.1s ease-out;
            }
            #toggle-mode-btn {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: rgba(6, 167, 125, 0.9);
              color: white;
              border: none;
              border-radius: 6px;
              padding: 8px 14px;
              font-size: 12px;
              font-family: Arial, sans-serif;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              transition: background 0.2s;
              z-index: 1000;
            }
            #toggle-mode-btn:hover {
              background: rgba(6, 167, 125, 1);
            }
          </style>
        </head>
        <body>
          <div id="canvas-container"></div>
          <button id="toggle-mode-btn">🔄 Auto</button>
          <script>
            // Animation Mode Control System
            window.animationMode = 'auto';  // 'auto' or 'manual'
            window.animationTimer = 0;
            window.animationPhaseDelay = 120;  // 2 seconds per phase

            // Toggle button
            const toggleBtn = document.getElementById('toggle-mode-btn');
            toggleBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              if (window.animationMode === 'auto') {
                window.animationMode = 'manual';
                toggleBtn.textContent = '👆 Manual';
              } else {
                window.animationMode = 'auto';
                toggleBtn.textContent = '🔄 Auto';
                window.animationTimer = 0;  // Reset timer when switching to auto
              }
            });
          </script>
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

            // GIF Recording Setup
            let isRecordingGif = false;

            window.addEventListener('message', function(event) {
              if (event.data.type === 'startGifRecording') {
                startGifRecording(event.data.duration, event.data.filename);
              }
            });

            function startGifRecording(duration, filename) {
              if (isRecordingGif) return;
              isRecordingGif = true;

              window.parent.postMessage({
                type: 'gifStarted'
              }, '*');

              // Use p5.gif to capture animation from the start
              // Scale 2x for higher resolution export
              if (typeof saveGif === 'function') {
                saveGif(filename || 'animation', duration, {
                  units: 'seconds',
                  delay: 0,
                  fps: 30,
                  scale: 2.0,  // 2x resolution (500x500 becomes 1000x1000)
                  endDelay: 3  // 3 second pause at the end before looping
                }).then(function() {
                  isRecordingGif = false;
                  window.parent.postMessage({
                    type: 'gifComplete'
                  }, '*');
                }).catch(function(err) {
                  isRecordingGif = false;
                  window.parent.postMessage({
                    type: 'error',
                    message: 'GIF export failed: ' + err.message
                  }, '*');
                });
              } else {
                isRecordingGif = false;
                window.parent.postMessage({
                  type: 'error',
                  message: 'p5.gif library not loaded'
                }, '*');
              }
            }

            // User code
            try {
              ${codeToRun}
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

      // Listen for messages from iframe
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "error") {
          setError(event.data.message);
        } else if (event.data.type === "gifStarted") {
          setRecordingStatus("capturing");
        } else if (event.data.type === "gifComplete") {
          setIsRecording(false);
          setRecordingStatus("idle");
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

  // Load an example and run it automatically
  const loadExample = (exampleId: string) => {
    // Force fresh import by re-reading from EXAMPLE_SKETCHES each time
    const example = EXAMPLE_SKETCHES.find((ex) => ex.id === exampleId);
    if (example) {
      setCode(example.code);
      setSelectedExample(exampleId);
      // Auto-run the example immediately with the new code
      runCodeWithCode(example.code);
    }
  };

  // Clear and reset
  const clearCode = () => {
    setCode(DEFAULT_CODE);
    setError(null);
    setSelectedExample("");
  };

  // Export GIF
  const exportGif = () => {
    if (!currentSketchRef.current?.iframe || isRecording) return;

    setIsRecording(true);
    setRecordingStatus("capturing");

    // Get the filename from the selected example name
    const example = EXAMPLE_SKETCHES.find((ex) => ex.id === selectedExample);
    const filename = example
      ? example.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()
      : "animation";

    // Send message to iframe to start recording
    currentSketchRef.current.iframe.contentWindow?.postMessage(
      {
        type: "startGifRecording",
        duration: 5, // 5 seconds
        filename: filename,
      },
      "*",
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                p5.js Animation Playground
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Create math manipulatives and animations
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedExample}
                onChange={(e) => loadExample(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              >
                <option value="">Load Example...</option>
                {EXAMPLE_CATEGORIES.map((category) => (
                  <optgroup key={category.name} label={category.name}>
                    {category.examples.map((example) => (
                      <option key={example.id} value={example.id}>
                        {example.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                onClick={clearCode}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Clear
              </button>
              <button
                onClick={exportGif}
                disabled={isRecording || !code}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                {isRecording ? (
                  <>
                    <span className="inline-block animate-pulse mr-1">🔴</span>
                    <span className="hidden sm:inline">Recording...</span>
                    <span className="sm:hidden">Rec</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">📹 Export GIF</span>
                    <span className="sm:hidden">📹 GIF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:min-h-[750px]">
          {/* Code Editor */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col order-2 lg:order-1 h-[300px] lg:h-auto">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <h2 className="text-sm font-semibold text-gray-700">
                Code Editor
              </h2>
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
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col order-1 lg:order-2">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
              <span className="text-xs text-gray-500">
                {canvasSize.width} × {canvasSize.height}
              </span>
            </div>
            <div
              className="flex-1 bg-gray-100 p-2 md:p-4 overflow-auto relative flex items-center justify-center"
              style={{ minHeight: canvasSize.height + 100 }}
            >
              <div ref={canvasContainerRef} className="bg-white"></div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="border-t border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-semibold text-sm">
                    Error:
                  </span>
                  <pre className="text-red-800 text-sm font-mono whitespace-pre-wrap flex-1">
                    {error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 md:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <h3 className="text-xs md:text-sm font-semibold text-blue-900 mb-2">
            Quick Tips:
          </h3>
          <ul className="text-xs md:text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Select an example from the dropdown to see it instantly</li>
            <li>Edit the code in the editor to customize your animation</li>
            <li>Your code is automatically saved in your browser</li>
            <li className="hidden sm:list-item">
              Use the Clear button to reset to the default template
            </li>
            <li>Click Export GIF to save your animation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
