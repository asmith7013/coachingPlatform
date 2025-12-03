'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';
import { getDeckBySlug } from '@actions/worked-examples';

export default function PresentationViewer() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [deck, setDeck] = useState<WorkedExampleDeck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState<Set<string>>(new Set());

  // Load deck from database
  useEffect(() => {
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
  }, [slug]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        router.push('/presentations');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, router]);

  // Load scripts for current slide
  const currentSlideData = deck?.htmlSlides?.[currentSlide];

  useEffect(() => {
    if (!currentSlideData?.scripts) return;

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
  }, [currentSlide, currentSlideData, scriptsLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-2xl">Loading presentation...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-2xl mb-4">
          {error || 'Presentation not found'}
        </div>
        <button
          onClick={() => router.push('/presentations')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Presentations
        </button>
      </div>
    );
  }

  const totalSlides = deck.htmlSlides?.length || 0;

  if (totalSlides === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-2xl mb-4">
          This presentation has no slides
        </div>
        <button
          onClick={() => router.push('/presentations')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Presentations
        </button>
      </div>
    );
  }
  const slide = deck.htmlSlides[currentSlide];

  return (
    <>
      {/* Slide Container */}
      <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
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
          onClick={() => router.push('/presentations')}
          className="fixed top-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-full transition-colors z-50"
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

        {/* Navigation Controls - Bottom Right, Compact */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-gray-800/70 px-3 py-2 rounded-full z-50 text-sm">
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
      </div>
    </>
  );
}
