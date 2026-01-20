'use client';

import { useMemo } from 'react';
import type { SlideContentProps } from '../types';
import { generateAnimationCSS } from '../utils';

/**
 * Extract only background styles from body tag in HTML content.
 * When slide HTML uses <body style="...">, we need to extract background styles
 * since <body> is ignored when injected via dangerouslySetInnerHTML.
 *
 * We ONLY extract background-related properties to preserve the viewer's
 * responsive sizing behavior.
 */
function extractBodyBackgroundStyles(html: string): React.CSSProperties | undefined {
  // Match <body ... style="..."> and extract the style value
  const bodyStyleMatch = html.match(/<body[^>]*\sstyle=["']([^"']+)["'][^>]*>/i);
  if (!bodyStyleMatch) return undefined;

  const styleString = bodyStyleMatch[1];

  // Only extract background-related properties
  const backgroundProps = ['background', 'background-color', 'background-image', 'background-gradient'];
  const styles: Record<string, string> = {};

  styleString.split(';').forEach(rule => {
    const [property, ...valueParts] = rule.split(':').map(s => s.trim());
    const value = valueParts.join(':'); // Rejoin in case value contains colons (like in gradients)
    if (property && value && backgroundProps.some(bp => property.toLowerCase().startsWith(bp))) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styles[camelProperty] = value;
    }
  });

  return Object.keys(styles).length > 0 ? styles as React.CSSProperties : undefined;
}

export function SlideContent({ slide, currentRevealed }: SlideContentProps) {
  // Extract only background styles from body tag (for slides that use <body style="...">)
  const backgroundStyles = useMemo(() => extractBodyBackgroundStyles(slide.htmlContent), [slide.htmlContent]);

  return (
    <>
      {/* Custom CSS for current slide */}
      {slide.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: slide.customCSS }} />
      )}

      {/* Animation CSS - hide CFU/Answer boxes until revealed */}
      <style dangerouslySetInnerHTML={{ __html: generateAnimationCSS(currentRevealed) }} />

      {/* Slide Content - apply background styles from body tag if present */}
      <div
        className="w-full h-full"
        style={backgroundStyles}
        dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
      />
    </>
  );
}
