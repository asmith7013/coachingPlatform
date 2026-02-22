"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PresentationModalProps } from "./types";
import { usePresentationState } from "./usePresentationState";
import {
  SlideContent,
  NavigationControls,
  CloseButton,
  PrintButton,
  HtmlViewer,
  SettingsButton,
  PreparationPanel,
  PlanningGuideButton,
} from "./components";
import { Stopwatch } from "./Stopwatch";
import { PRINT_STYLES, isPrintableSlide } from "./utils";

export function PresentationModal({
  slug,
  isOpen,
  onClose,
  initialSlide = 0,
  onSlideChange,
}: PresentationModalProps) {
  const router = useRouter();
  const [showPlanningGuide, setShowPlanningGuide] = useState(false);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const {
    deck,
    currentSlide,
    loading,
    error,
    showHtmlViewer,
    googleSlidesUrl,
    currentRevealed,
    totalSlides,
    slide,
    hasAnalysisData,
    setShowHtmlViewer,
    nextSlide,
    prevSlide,
  } = usePresentationState({
    slug,
    isOpen,
    initialSlide,
    onSlideChange,
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white">
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
          {/* Main Content Area - fills viewport minus footer */}
          <div className="flex h-[calc(100vh-56px)] items-center justify-center overflow-hidden">
            {/* Planning Guide Side Panel */}
            {showPlanningGuide && (
              <div className="w-72 flex-shrink-0 h-full z-[10000]">
                <PreparationPanel onClose={() => setShowPlanningGuide(false)} />
              </div>
            )}

            {/* Slide Content - scales to fill available space while maintaining aspect ratio */}
            <div className="flex-1 h-full flex items-center justify-center overflow-hidden py-2 px-4">
              <div
                className="w-full h-full"
                style={{
                  maxWidth: "calc((100vh - 56px - 16px) * 960 / 540)",
                  aspectRatio: "960 / 540",
                }}
              >
                <SlideContent slide={slide} currentRevealed={currentRevealed} />
              </div>
            </div>
          </div>

          {/* Top Right Controls - Close */}
          <div className="print-hide fixed top-4 right-4 flex items-center gap-2 z-[10000]">
            <CloseButton onClose={onClose} />
          </div>

          {/* Print Button - below close button, only show on printable slide */}
          {slide && isPrintableSlide(slide.htmlContent) && (
            <PrintButton slide={slide} />
          )}

          {/* Footer */}
          <div className="print-hide fixed bottom-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-t border-gray-200 bg-white z-[10000]">
            {/* Left: Navigation */}
            <NavigationControls
              currentSlide={currentSlide}
              totalSlides={totalSlides}
              onPrevSlide={prevSlide}
              onNextSlide={nextSlide}
            />

            {/* Right: Stopwatch toggle, Planning Guide & Settings */}
            <div className="flex items-center gap-2">
              {showStopwatch && (
                <Stopwatch currentSlide={currentSlide} isActive={isOpen} />
              )}
              <button
                onClick={() => setShowStopwatch(!showStopwatch)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${showStopwatch ? "bg-gray-200 text-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
                title={showStopwatch ? "Hide stopwatch" : "Show stopwatch"}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                </svg>
              </button>

              <PlanningGuideButton
                isActive={showPlanningGuide}
                onToggle={() => setShowPlanningGuide(!showPlanningGuide)}
              />

              <SettingsButton
                onOpenHtmlViewer={() => setShowHtmlViewer(true)}
                onEditSlides={() => {
                  onClose();
                  router.push(`/scm/workedExamples/create?editSlug=${slug}`);
                }}
                hasAnalysisData={hasAnalysisData}
                googleSlidesUrl={googleSlidesUrl}
              />
            </div>
          </div>

          {/* HTML Viewer Modal */}
          {showHtmlViewer && (
            <HtmlViewer
              slideNumber={currentSlide + 1}
              htmlContent={slide.htmlContent}
              googleSlidesUrl={googleSlidesUrl}
              onClose={() => setShowHtmlViewer(false)}
            />
          )}
        </>
      )}

      {/* Print styles */}
      <style>{PRINT_STYLES}</style>
    </div>
  );
}
