"use client";

import { useEffect, useRef, useState } from "react";

interface SlidePreviewProps {
  htmlContent: string;
  className?: string;
  /** Show slide at native 960×540 or scale to fit container */
  scaleToFit?: boolean;
}

/**
 * Renders PPTX-compatible HTML slide content in a sandboxed iframe.
 *
 * PPTX slides are 960×540px (16:9 aspect ratio).
 * This component scales them to fit the container while maintaining aspect ratio.
 */
export function SlidePreview({
  htmlContent,
  className = "",
  scaleToFit = true,
}: SlidePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // PPTX slide dimensions
  const SLIDE_WIDTH = 960;
  const SLIDE_HEIGHT = 540;

  // Calculate scale to fit container
  useEffect(() => {
    if (!scaleToFit || !containerRef.current) return;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate scale to fit while maintaining aspect ratio
      const scaleX = containerWidth / SLIDE_WIDTH;
      const scaleY = containerHeight / SLIDE_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

      setScale(newScale);
    };

    updateScale();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [scaleToFit]);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    // Detect if this is a printable slide (contains print-page class)
    const isPrintable = htmlContent.includes("print-page");

    // Build complete HTML document
    // PPTX slides are 960×540px with light theme
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: ${isPrintable ? "100%" : `${SLIDE_WIDTH}px`};
              height: ${isPrintable ? "100%" : `${SLIDE_HEIGHT}px`};
              overflow: ${isPrintable ? "auto" : "hidden"};
              background: ${isPrintable ? "#f5f5f5" : "#ffffff"};
            }
            /* PPTX layout classes */
            .row { display: flex; flex-direction: row; }
            .col { display: flex; flex-direction: column; }
            .fit { flex: 0 0 auto; }
            .fill-width { flex: 1 1 auto; }
            .fill-height { flex: 1 1 auto; }
            .center { display: flex; align-items: center; justify-content: center; }
            .gap-sm { gap: 8px; }
            .gap-md { gap: 12px; }
            .gap-lg { gap: 20px; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    doc.open();
    doc.write(fullHtml);
    doc.close();
  }, [htmlContent]);

  // Detect if printable slide for different rendering
  const isPrintable = htmlContent.includes("print-page");

  if (isPrintable) {
    // Printable slides use 100% width/height and scroll
    return (
      <iframe
        ref={iframeRef}
        title="Slide Preview"
        className={`w-full h-full border-0 bg-gray-100 ${className}`}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }

  // PPTX slides are scaled to fit container
  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center bg-gray-200 overflow-hidden ${className}`}
    >
      <div
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          transform: scaleToFit ? `scale(${scale})` : undefined,
          transformOrigin: "center center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <iframe
          ref={iframeRef}
          title="Slide Preview"
          className="w-full h-full border-0"
          style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
