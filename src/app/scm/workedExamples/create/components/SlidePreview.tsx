'use client';

import { useEffect, useRef } from 'react';

interface SlidePreviewProps {
  htmlContent: string;
  className?: string;
}

/**
 * Renders HTML slide content in a sandboxed iframe
 */
export function SlidePreview({ htmlContent, className = '' }: SlidePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    // Build complete HTML document with CSS to fill container
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
              width: 100%;
              height: 100%;
              overflow: auto;
            }
            /* Make slide container fill the viewport */
            body > div:first-child,
            body > section:first-child,
            .slide-container,
            [class*="slide"] {
              min-width: 100% !important;
              min-height: 100% !important;
              width: 100% !important;
              max-width: none !important;
            }
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

  return (
    <iframe
      ref={iframeRef}
      title="Slide Preview"
      className={`w-full h-full border-0 ${className}`}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
