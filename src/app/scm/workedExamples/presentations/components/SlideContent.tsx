'use client';

import type { SlideContentProps } from '../types';
import { generateAnimationCSS } from '../utils';

export function SlideContent({ slide, currentRevealed }: SlideContentProps) {
  return (
    <>
      {/* Custom CSS for current slide */}
      {slide.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: slide.customCSS }} />
      )}

      {/* Animation CSS - hide CFU/Answer boxes until revealed */}
      <style dangerouslySetInnerHTML={{ __html: generateAnimationCSS(currentRevealed) }} />

      {/* Slide Content */}
      <div
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
      />
    </>
  );
}
