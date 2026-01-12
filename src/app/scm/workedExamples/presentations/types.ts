import type { WorkedExampleDeck, HtmlSlide } from '@zod-schema/scm/worked-example';

export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export type AnimatableBox = 'cfu-box' | 'answer-box';

export interface PresentationModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
}

export interface PresentationState {
  deck: WorkedExampleDeck | null;
  currentSlide: number;
  loading: boolean;
  error: string | null;
  showHtmlViewer: boolean;
  copied: boolean;
  exportStatus: ExportStatus;
  exportError: string | null;
  googleSlidesUrl: string | null;
  revealedBoxes: Map<number, Set<string>>;
  scriptsLoaded: Set<string>;
}

export interface SlideContentProps {
  slide: HtmlSlide;
  currentRevealed: Set<string>;
}

export interface NavigationControlsProps {
  currentSlide: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

export interface CloseButtonProps {
  onClose: () => void;
}

export interface PrintButtonProps {
  slide: HtmlSlide;
}

export interface HtmlViewerProps {
  slideNumber: number;
  htmlContent: string;
  googleSlidesUrl: string | null;
  onClose: () => void;
}
