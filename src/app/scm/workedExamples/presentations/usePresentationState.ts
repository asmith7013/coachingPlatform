'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { WorkedExampleDeck, HtmlSlide } from '@zod-schema/scm/worked-example';
import { getDeckBySlug } from '@actions/worked-examples';
import { downloadPptxLocally } from '@/lib/utils/download-pptx';
import type { ExportStatus } from './types';
import { getAnimatableBoxes } from './utils';

interface UsePresentationStateProps {
  slug: string;
  isOpen: boolean;
  initialSlide: number;
  onSlideChange?: (slideIndex: number) => void;
}

export function usePresentationState({
  slug,
  isOpen,
  initialSlide,
  onSlideChange,
}: UsePresentationStateProps) {
  const [deck, setDeck] = useState<WorkedExampleDeck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState<Set<string>>(new Set());
  const [showHtmlViewer, setShowHtmlViewer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportError, setExportError] = useState<string | null>(null);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'html' | 'slides'>('html');
  const [revealedBoxes, setRevealedBoxes] = useState<Map<number, Set<string>>>(new Map());

  // Load deck from database
  useEffect(() => {
    if (!isOpen) return;

    async function loadDeck() {
      try {
        const result = await getDeckBySlug(slug);
        if (result.success && result.data) {
          const deckData = result.data as WorkedExampleDeck;
          setDeck(deckData);
          if (deckData.googleSlidesUrl) {
            setGoogleSlidesUrl(deckData.googleSlidesUrl);
          }
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

  // Sync currentSlide when initialSlide changes
  useEffect(() => {
    setCurrentSlide(initialSlide);
  }, [initialSlide]);

  // Get animatable boxes for current slide
  const currentSlideHtml = deck?.htmlSlides?.[currentSlide]?.htmlContent || '';
  const animatableBoxes = useMemo(() => getAnimatableBoxes(currentSlideHtml), [currentSlideHtml]);
  const currentRevealed = useMemo(
    () => revealedBoxes.get(currentSlide) || new Set<string>(),
    [revealedBoxes, currentSlide]
  );

  // Find next unrevealed box
  const nextUnrevealedBox = useMemo(() => {
    for (const box of animatableBoxes) {
      if (!currentRevealed.has(box)) {
        return box;
      }
    }
    return null;
  }, [animatableBoxes, currentRevealed]);

  // Navigation
  const nextSlide = useCallback(() => {
    if (nextUnrevealedBox) {
      setRevealedBoxes(prev => {
        const newMap = new Map(prev);
        const slideRevealed = new Set(newMap.get(currentSlide) || []);
        slideRevealed.add(nextUnrevealedBox);
        newMap.set(currentSlide, slideRevealed);
        return newMap;
      });
      return;
    }

    if (deck?.htmlSlides && currentSlide < deck.htmlSlides.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    }
  }, [deck, currentSlide, onSlideChange, nextUnrevealedBox]);

  const prevSlide = useCallback(() => {
    if (currentRevealed.size > 0) {
      setRevealedBoxes(prev => {
        const newMap = new Map(prev);
        newMap.delete(currentSlide);
        return newMap;
      });
      return;
    }

    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    }
  }, [currentSlide, onSlideChange, currentRevealed]);

  // Load scripts for current slide
  const currentSlideData = deck?.htmlSlides?.[currentSlide];

  useEffect(() => {
    if (!currentSlideData?.scripts || !isOpen) return;

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

    const timer = setTimeout(executeInlineScripts, 100);
    return () => clearTimeout(timer);
  }, [currentSlide, currentSlideData, scriptsLoaded, isOpen]);

  // Export to Google Slides
  const handleExportToGoogleSlides = useCallback(async () => {
    if (!deck?.htmlSlides || exportStatus === 'exporting') return;

    setExportStatus('exporting');
    setExportError(null);

    const slidesPayload = deck.htmlSlides.map((slide) => ({
      slideNumber: slide.slideNumber,
      htmlContent: slide.htmlContent,
    }));

    await downloadPptxLocally(slidesPayload, deck.title, deck.mathConcept);

    try {
      const response = await fetch('/api/scm/worked-examples/export-google-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slidesPayload,
          title: deck.title,
          mathConcept: deck.mathConcept,
          slug: deck.slug,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        setExportStatus('success');
        setGoogleSlidesUrl(data.url);
        window.open(data.url, '_blank');
        setTimeout(() => setExportStatus('idle'), 3000);
      } else {
        setExportStatus('error');
        setExportError(data.error || 'Export failed');
        setTimeout(() => setExportStatus('idle'), 5000);
      }
    } catch (err) {
      setExportStatus('error');
      setExportError(err instanceof Error ? err.message : 'Export failed');
      setTimeout(() => setExportStatus('idle'), 5000);
    }
  }, [deck, exportStatus]);

  // Copy HTML to clipboard
  const handleCopyHtml = useCallback(() => {
    const slide = deck?.htmlSlides?.[currentSlide];
    if (slide?.htmlContent) {
      navigator.clipboard.writeText(slide.htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [deck, currentSlide]);

  const totalSlides = deck?.htmlSlides?.length || 0;
  const slide: HtmlSlide | undefined = deck?.htmlSlides?.[currentSlide];

  return {
    // State
    deck,
    currentSlide,
    loading,
    error,
    showHtmlViewer,
    copied,
    exportStatus,
    exportError,
    googleSlidesUrl,
    viewMode,
    currentRevealed,
    totalSlides,
    slide,
    // Actions
    setShowHtmlViewer,
    setViewMode,
    nextSlide,
    prevSlide,
    handleExportToGoogleSlides,
    handleCopyHtml,
  };
}
