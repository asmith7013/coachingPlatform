import pptxgen from 'pptxgenjs';
import { PptxElement } from '../types';
import { pxToInches } from '../constants';

// Import individual handlers
import {
  addBadge,
  addTitle,
  addSubtitle,
  addFootnote,
  addStrategyBadge,
  addStrategyName,
  addStrategySummary,
  addVisualArea,
  addDefaultText,
} from './simple-elements';

import {
  addContentBox,
  addLearningGoalBox,
  addStyledBox,
} from './boxes';

import { addColumnContent } from './column-content';

/**
 * Render a single pptx element as native pptxgenjs shapes/text
 * Data-driven approach - uses exact coordinates from data-pptx-* attributes
 */
export function addPptxElement(slide: pptxgen.Slide, el: PptxElement): void {
  const x = pxToInches(el.x, 'w');
  const y = pxToInches(el.y, 'h');
  const w = pxToInches(el.w, 'w');
  const h = pxToInches(el.h, 'h');

  switch (el.regionType) {
    case 'badge':
      addBadge(slide, el, x, y, w, h);
      break;

    case 'title':
      addTitle(slide, el, x, y, w, h);
      break;

    case 'subtitle':
      addSubtitle(slide, el, x, y, w, h);
      break;

    case 'footnote':
      addFootnote(slide, el, x, y, w, h);
      break;

    case 'cfu-box':
      addStyledBox(slide, el, 'FEF3C7', 'F59E0B', '92400E', 'CHECK FOR UNDERSTANDING');
      break;

    case 'answer-box':
      addStyledBox(slide, el, 'DCFCE7', '22C55E', '166534', 'ANSWER');
      break;

    case 'left-column':
    case 'content':
      addColumnContent(slide, el);
      break;

    case 'content-box':
    case 'problem-statement':
    case 'task-instruction':
      addContentBox(slide, el, x, y, w, h);
      break;

    case 'learning-goal-box':
      addLearningGoalBox(slide, el, x, y, w, h);
      break;

    case 'strategy-badge':
      addStrategyBadge(slide, el, x, y, w, h);
      break;

    case 'strategy-name':
      addStrategyName(slide, el, x, y, w, h);
      break;

    case 'strategy-summary':
      addStrategySummary(slide, el, x, y, w, h);
      break;

    case 'right-column':
    case 'problem-visual':
      addVisualArea(slide, el, x, y, w, h);
      break;

    case 'svg-container':
      // Skip - handled separately via image rendering
      break;

    default:
      addDefaultText(slide, el, x, y, w, h);
  }
}

// Re-export for convenience
export { addStyledBox, addColumnContent };
