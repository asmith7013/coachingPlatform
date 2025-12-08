'use client';

import { useEffect, useState, useCallback } from 'react';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';
import { getDeckBySlug } from '@actions/worked-examples';

interface PresentationModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PresentationModal({ slug, isOpen, onClose }: PresentationModalProps) {
  const [deck, setDeck] = useState<WorkedExampleDeck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState<Set<string>>(new Set());

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

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (deck?.htmlSlides && currentSlide < deck.htmlSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [deck, currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

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
    <div className="fixed inset-0 z-[9999] bg-gray-900">
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white text-2xl">Loading presentation...</div>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-white text-2xl mb-4">{error}</div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            className="fixed top-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-full transition-colors z-[10000] cursor-pointer"
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

          {/* Print Button - only show on last slide */}
          {deck?.htmlSlides && currentSlide === deck.htmlSlides.length - 1 && (
            <button
              onClick={() => window.print()}
              className="fixed top-4 right-56 h-12 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full z-[10000] text-sm font-semibold transition-colors cursor-pointer"
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

          {/* Navigation Controls - Top Right, left of close button */}
          <div className="fixed top-4 right-20 h-12 flex items-center gap-2 bg-gray-800/70 px-3 rounded-full z-[10000] text-sm">
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
        </>
      )}
    </div>
  );
}
