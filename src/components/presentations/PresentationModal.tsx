'use client';

import { useEffect, useState, useCallback } from 'react';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';
import { getDeckBySlug } from '@actions/worked-examples';

interface PresentationModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
}

export function PresentationModal({ slug, isOpen, onClose, initialSlide = 0, onSlideChange }: PresentationModalProps) {
  const [deck, setDeck] = useState<WorkedExampleDeck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState<Set<string>>(new Set());
  const [showHtmlViewer, setShowHtmlViewer] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load deck from database
  useEffect(() => {
    if (!isOpen) return;

    async function loadDeck() {
      try {
        const result = await getDeckBySlug(slug);
        if (result.success && result.data) {
          setDeck(result.data as WorkedExampleDeck);
        } else {
          setError(result.error || 'Failed to load deck');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deck');
      } finally {
        setLoading(false);
      }
    }

    loadDeck();
  }, [slug, isOpen]);

  // Sync currentSlide when initialSlide changes (e.g., from URL navigation)
  useEffect(() => {
    setCurrentSlide(initialSlide);
  }, [initialSlide]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (deck?.htmlSlides && currentSlide < deck.htmlSlides.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    }
  }, [deck, currentSlide, onSlideChange]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    }
  }, [currentSlide, onSlideChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  // Load scripts for current slide
  const currentSlideData = deck?.htmlSlides?.[currentSlide];

  useEffect(() => {
    if (!currentSlideData?.scripts || !isOpen) return;

    // Load CDN scripts
    const cdnScripts = currentSlideData.scripts.filter(s => s.type === 'cdn');
    cdnScripts.forEach(script => {
      if (!scriptsLoaded.has(script.content)) {
        const scriptEl = document.createElement('script');
        scriptEl.src = script.content;
        scriptEl.async = true;
        scriptEl.onload = () => {
          setScriptsLoaded(prev => new Set([...prev, script.content]));
        };
        document.body.appendChild(scriptEl);
      }
    });

    // Execute inline scripts (after CDN scripts are loaded)
    const inlineScripts = currentSlideData.scripts.filter(s => s.type === 'inline');
    const executeInlineScripts = () => {
      inlineScripts.forEach(script => {
        try {
          const scriptFunc = new Function(script.content);
          scriptFunc();
        } catch (err) {
          console.error('Error executing inline script:', err);
        }
      });
    };

    // Wait a bit for CDN scripts to load before executing inline scripts
    const timer = setTimeout(executeInlineScripts, 100);
    return () => clearTimeout(timer);
  }, [currentSlide, currentSlideData, scriptsLoaded, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSlides = deck?.htmlSlides?.length || 0;
  const slide = deck?.htmlSlides?.[currentSlide];

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-200">
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-gray-700 text-2xl">Loading presentation...</div>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-gray-700 text-2xl mb-4">{error}</div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {!loading && !error && deck && slide && (
        <>
          {/* Custom CSS for current slide */}
          {slide.customCSS && (
            <style dangerouslySetInnerHTML={{ __html: slide.customCSS }} />
          )}

          {/* Slide Content */}
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="print-hide fixed top-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600/90 text-white rounded-full transition-colors z-[10000] cursor-pointer"
            aria-label="Close presentation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Controls - Top Right, left of close button */}
          <div className="print-hide fixed top-4 right-20 h-12 flex items-center gap-2 bg-gray-700/80 px-3 rounded-full z-[10000] text-sm">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="w-7 h-7 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Slide Counter */}
            <div className="text-white text-xs font-medium px-2">
              {currentSlide + 1}/{totalSlides}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="w-7 h-7 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* Print Button - only show on last slide, row below nav controls */}
          {deck?.htmlSlides && currentSlide === deck.htmlSlides.length - 1 && (
            <button
              onClick={() => {
                // Open a new window with just the printable content
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;

                // Build a clean HTML document for printing
                printWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>Print Worksheet</title>
                    <style>
                      @page {
                        size: letter portrait;
                        margin: 0.5in;
                      }
                      * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      html, body {
                        margin: 0;
                        padding: 0;
                        background: white;
                      }
                      .slide-container {
                        display: block;
                        position: static;
                        width: 100%;
                        height: auto;
                        overflow: visible;
                        background: white;
                      }
                      .print-page {
                        display: block;
                        width: 100%;
                        height: auto;
                        min-height: 0;
                        max-height: none;
                        margin: 0;
                        padding: 0.3in;
                        border: none;
                        box-sizing: border-box;
                        background: white;
                        page-break-after: always;
                        page-break-inside: avoid;
                      }
                      .print-page:last-child {
                        page-break-after: auto;
                      }
                    </style>
                    ${slide.customCSS ? `<style>${slide.customCSS}</style>` : ''}
                  </head>
                  <body>
                    ${slide.htmlContent}
                  </body>
                  </html>
                `);
                printWindow.document.close();

                // Give the browser time to render, then trigger print
                setTimeout(() => {
                  printWindow.focus();
                  printWindow.print();
                }, 250);
              }}
              className="print-hide fixed top-20 right-4 h-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-full z-[10000] text-sm font-semibold transition-colors cursor-pointer"
              aria-label="Print worksheet"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                />
              </svg>
              Print
            </button>
          )}

          {/* View HTML Button - Bottom Right */}
          <button
            onClick={() => setShowHtmlViewer(true)}
            className="print-hide fixed bottom-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600/90 text-white rounded-full transition-colors z-[10000] cursor-pointer"
            aria-label="View HTML"
            title="View HTML"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
          </button>

          {/* HTML Viewer Modal */}
          {showHtmlViewer && (
            <div className="print-hide fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Slide {currentSlide + 1} HTML
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (slide?.htmlContent) {
                          navigator.clipboard.writeText(slide.htmlContent);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                        copied
                          ? 'bg-green-500 text-white scale-110'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                      }`}
                      aria-label="Copy HTML"
                      title={copied ? 'Copied!' : 'Copy HTML'}
                    >
                      {copied ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setShowHtmlViewer(false)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors cursor-pointer"
                      aria-label="Close HTML viewer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* HTML Content */}
                <div className="flex-1 overflow-auto p-4 bg-gray-900">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                    {slide?.htmlContent || 'No HTML content'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Print styles - hide modal UI, show only slide content */}
      <style>{`
        @media print {
          /* Hide UI controls */
          .print-hide {
            display: none !important;
          }

          /* Color accuracy */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Reset document */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Container resets */
          .slide-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          /* Print pages - simple approach */
          .print-page {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0.3in !important;
            border: none !important;
            box-sizing: border-box !important;
            background: white !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }

          .print-page:last-child {
            page-break-after: auto !important;
          }
        }

        @page {
          size: letter portrait;
          margin: 0.5in;
        }
      `}</style>
    </div>
  );
}
