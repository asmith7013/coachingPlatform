import type { AnimatableBox } from './types';

/**
 * Check if slide HTML is a printable worksheet (contains print-page class)
 * Used to show the Print button only on the actual printable slide
 */
export function isPrintableSlide(htmlContent: string): boolean {
  return /class=["'][^"']*print-page[^"']*["']/i.test(htmlContent);
}

/**
 * Build a formatted export title for Google Slides
 * Format: "SGI 6.4.2: Strategy Name" or "SGI Strategy Name" if no lesson info
 */
export function buildExportTitle(params: {
  gradeLevel?: string | null;
  unitNumber?: number | null;
  lessonNumber?: number | null;
  title?: string | null;
}): string {
  const { gradeLevel, unitNumber, lessonNumber, title } = params;

  const lessonPrefix = gradeLevel && unitNumber !== null && unitNumber !== undefined && lessonNumber !== null && lessonNumber !== undefined
    ? `SGI ${gradeLevel}.${unitNumber}.${lessonNumber}: `
    : 'SGI ';

  const strategyName = title || 'Worked Example';

  return `${lessonPrefix}${strategyName}`;
}

/**
 * Convert a Google Slides URL to an embeddable iframe URL
 */
export function getGoogleSlidesEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Extract presentation ID from various URL formats
  // Format 1: https://docs.google.com/presentation/d/PRESENTATION_ID/edit
  // Format 2: https://docs.google.com/presentation/d/PRESENTATION_ID/pub
  // Format 3: https://docs.google.com/presentation/d/e/PRESENTATION_ID/pub
  const match = url.match(/\/presentation\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
  if (!match) return null;

  const presentationId = match[1];
  return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
}

/**
 * Check if slide HTML has animatable CFU/Answer box elements
 */
export function getAnimatableBoxes(html: string): AnimatableBox[] {
  const boxes: AnimatableBox[] = [];
  if (/data-pptx-region=["']cfu-box["']/i.test(html)) {
    boxes.push('cfu-box');
  }
  if (/data-pptx-region=["']answer-box["']/i.test(html)) {
    boxes.push('answer-box');
  }
  return boxes;
}

/**
 * Generate animation CSS for revealed boxes
 * CFU and Answer boxes appear centered at bottom, side by side (when space allows)
 * Uses viewport-safe positioning to prevent overflow
 */
export function generateAnimationCSS(currentRevealed: Set<string>): string {
  return `
    /* Reposition CFU/Answer boxes as compact footer bars */
    [data-pptx-region="cfu-box"],
    [data-pptx-region="answer-box"] {
      position: fixed !important;
      bottom: 40px !important;
      top: auto !important;
      /* Wider, compact sizing */
      width: clamp(280px, 35vw, 420px) !important;
      min-height: 80px !important;
      max-height: 120px !important;
      padding: 12px 16px !important;
      font-size: 16px !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
      z-index: 10001 !important;
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      pointer-events: none;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }

    /* Force font size on all children within the boxes */
    [data-pptx-region="cfu-box"] *,
    [data-pptx-region="answer-box"] * {
      font-size: 16px !important;
    }

    /* Side-by-side centered layout (when viewport is wide enough) */
    @media (min-width: 901px) {
      /* CFU box: left of center */
      [data-pptx-region="cfu-box"] {
        right: calc(50% + 6px) !important;
        left: auto !important;
      }

      /* Answer box: right of center */
      [data-pptx-region="answer-box"] {
        left: calc(50% + 6px) !important;
        right: auto !important;
      }
    }

    /* Show revealed boxes - slide up into view */
    ${currentRevealed.has('cfu-box') ? `
      [data-pptx-region="cfu-box"] {
        transform: translateY(0) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    ` : ''}
    ${currentRevealed.has('answer-box') ? `
      [data-pptx-region="answer-box"] {
        transform: translateY(0) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    ` : ''}

    /* On smaller screens, stack vertically */
    @media (max-width: 900px) {
      [data-pptx-region="cfu-box"],
      [data-pptx-region="answer-box"] {
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) translateY(20px);
        width: min(90vw, 420px) !important;
      }

      [data-pptx-region="cfu-box"] {
        bottom: 162px !important;
      }

      [data-pptx-region="answer-box"] {
        bottom: 72px !important;
      }

      ${currentRevealed.has('cfu-box') ? `
        [data-pptx-region="cfu-box"] {
          transform: translateX(-50%) translateY(0) !important;
        }
      ` : ''}
      ${currentRevealed.has('answer-box') ? `
        [data-pptx-region="answer-box"] {
          transform: translateX(-50%) translateY(0) !important;
        }
      ` : ''}
    }
  `;
}

/**
 * Generate static CSS for CFU/Answer boxes in preview mode (always visible)
 * Used by SlidePreview component where boxes don't animate but are repositioned
 */
export function generatePreviewBoxCSS(): string {
  return `
    /* Reposition CFU/Answer boxes as compact footer bars (always visible in preview) */
    [data-pptx-region="cfu-box"],
    [data-pptx-region="answer-box"] {
      position: fixed !important;
      bottom: 20px !important;
      top: auto !important;
      width: clamp(200px, 35vw, 350px) !important;
      min-height: 60px !important;
      max-height: 100px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
      z-index: 1000 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }

    /* Force font size on all children within the boxes */
    [data-pptx-region="cfu-box"] *,
    [data-pptx-region="answer-box"] * {
      font-size: 14px !important;
    }

    /* CFU box: left of center */
    [data-pptx-region="cfu-box"] {
      right: calc(50% + 4px) !important;
      left: auto !important;
    }

    /* Answer box: right of center */
    [data-pptx-region="answer-box"] {
      left: calc(50% + 4px) !important;
      right: auto !important;
    }
  `;
}

/**
 * Print styles for the modal
 */
export const PRINT_STYLES = `
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
`;
