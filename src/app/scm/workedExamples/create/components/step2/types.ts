import type { HtmlSlide } from '@zod-schema/scm/worked-example';

// SSE event types from the generate-slides API
export interface SSEStartEvent {
  estimatedSlideCount: number;
  message: string;
}

export interface SSESlideEvent {
  slideNumber: number;
  estimatedTotal: number;
  message: string;
  slide: HtmlSlide;
}

export interface SSECompleteEvent {
  success: boolean;
  slideCount: number;
  slides: HtmlSlide[];
}

export interface SSEErrorEvent {
  message: string;
}
