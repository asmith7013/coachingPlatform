import type { AnimatableBox } from './types';

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
 */
export function generateAnimationCSS(currentRevealed: Set<string>): string {
  return `
    /* Hide animatable boxes by default */
    [data-pptx-region="cfu-box"],
    [data-pptx-region="answer-box"] {
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      pointer-events: none;
    }
    /* Show revealed boxes */
    ${currentRevealed.has('cfu-box') ? `
      [data-pptx-region="cfu-box"] {
        opacity: 1 !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
      }
    ` : ''}
    ${currentRevealed.has('answer-box') ? `
      [data-pptx-region="answer-box"] {
        opacity: 1 !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
      }
    ` : ''}
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
