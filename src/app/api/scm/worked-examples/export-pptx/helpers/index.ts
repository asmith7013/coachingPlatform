// Types
export * from "./types";

// Constants
export * from "./constants";

// Parsers
export {
  extractPptxElements,
  extractAllPptxElements,
  extractElementsFromStructure,
  parseSlideHtml,
} from "./parsers";

// Element handlers
export {
  addPptxElement,
  addStyledBox,
  addColumnContent,
} from "./element-handlers";

// Renderers
export {
  createRenderSession,
  renderSvgToImage,
  renderSvgLayers,
  renderFullSlideToImage,
  RenderError,
} from "./renderers";
export type { RenderSession } from "./renderers";

// PPTX Generator (shared logic)
export { generatePptxFromSlides } from "./generate-pptx";
export type {
  SlideData,
  GeneratePptxOptions,
  GeneratePptxResult,
} from "./generate-pptx";

// Validators
export {
  validateSlideBounds,
  validateStackedElements,
  validateDeckBounds,
} from "./validators";
export type { ElementBounds, BoundsIssue, SlideValidation } from "./validators";
