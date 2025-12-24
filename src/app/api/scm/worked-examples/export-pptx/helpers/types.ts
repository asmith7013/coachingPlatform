import pptxgen from '@bapunhansdah/pptxgenjs';

export interface SvgLayer {
  name: string;
  buffer: Buffer;
  /** Bounding box of the cropped content, relative to the full SVG region */
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PptxRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PptxElement {
  regionType: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  bgColor?: string;
  borderColor?: string;
}

export interface ParsedSlide {
  title?: string;
  subtitle?: string;
  stepBadge?: string;
  svgRegion?: {
    html: string;
    x: number;
    y: number;
    width: number;
    height: number;
    layers?: string[];
  };
  leftColumn?: {
    html: string;
    region: PptxRegion;
  };
  rightColumn?: {
    region: PptxRegion;
  };
  cfuBox?: { text: string };
  answerBox?: { text: string };
  bodyContent: string[];
  footnote?: string;
}

export type PptxSlide = pptxgen.Slide;
