import type { HtmlSlide, DeckVisualType, SvgSubtype } from '@zod-schema/scm/worked-example';

// Grade levels matching the schema
export type GradeLevel = '6' | '7' | '8' | 'Algebra 1';

// Visual types for worked examples (from schema)
// - 'text-only': No graphics needed (rare - pure text/equation problems)
// - 'html-table': Simple data tables with highlighting
// - 'svg-visual': ALL other graphics (graphs, diagrams, shapes, etc.)
export type VisualType = DeckVisualType;

// SVG subtypes (only when VisualType is 'svg-visual')
export type { SvgSubtype };

// ============================================================
// Visual Plan Types - One for each visual type from Phase 2
// ============================================================

// Tape Diagram (division, multiplication, part-whole)
export interface TapeDiagramPlan {
  type: 'tape-diagram';
  boxes: number;
  valuePerBox: number | string;
  total: number | string;
  unknownPosition: 'start' | 'box' | 'total';
}

// Double Number Line (ratios, unit rates, percentages)
export interface DoubleNumberLinePlan {
  type: 'double-number-line';
  quantityA: { label: string; values: (number | string)[] };
  quantityB: { label: string; values: (number | string)[] };
  highlightPair?: [number | string, number | string];
}

// Area Model (multiplication, distributive property)
export interface AreaModelPlan {
  type: 'area-model';
  dimensions: [number | string, number | string];
  partialProducts: (number | string)[][];
}

// Number Line (integers, inequalities, operations)
export interface NumberLinePlan {
  type: 'number-line';
  range: [number, number];
  markedPoints: { value: number; label?: string; style: 'closed' | 'open' }[];
  arrows?: { from: number; to: number; label?: string }[];
}

// Ratio Table (equivalent ratios, scaling)
export interface RatioTablePlan {
  type: 'ratio-table';
  rows: { label: string; values: (number | string)[] }[];
  scaleFactors?: string[];
}

// Hanger Diagram (equation solving, balance)
export interface HangerDiagramPlan {
  type: 'hanger-diagram';
  leftSide: string;
  rightSide: string;
  shapes?: { triangle?: string; square?: string };
}

// Input-Output Table (functions, patterns, rules)
export interface InputOutputTablePlan {
  type: 'input-output-table';
  rule: string;
  inputs: (number | string)[];
  outputs: (number | string)[];
  unknownPosition: 'input' | 'output' | 'both';
}

// Grid Diagram (area by counting, decomposing shapes)
export interface GridDiagramPlan {
  type: 'grid-diagram';
  rows: number;
  cols: number;
  shadedRegions?: { startRow: number; startCol: number; endRow: number; endCol: number; color?: string }[];
  unitLabel: string;
  showGrid: boolean;
}

// Net Diagram (surface area, 3D→2D unfolding)
export interface NetDiagramPlan {
  type: 'net-diagram';
  shapeType: 'rectangular-prism' | 'triangular-prism' | 'pyramid' | 'cube';
  faces: { shape: 'rectangle' | 'triangle'; width: number; height: number; label?: string }[];
  foldLines: boolean;
  dimensions: { length: number; width: number; height: number };
}

// Measurement Diagram (base & height, labeled dimensions)
export interface MeasurementDiagramPlan {
  type: 'measurement-diagram';
  shapeType: 'triangle' | 'parallelogram' | 'trapezoid' | 'rectangle';
  measurements: { label: string; value: number | string; position?: string }[];
  showRightAngle?: boolean;
  showDashedHeight?: boolean;
}

// Discrete Diagram (objects in groups, discrete ratios)
export interface DiscreteDiagramPlan {
  type: 'discrete-diagram';
  groups: number;
  itemsPerGroup: number;
  totalItems: number;
  visualType: 'circles' | 'squares' | 'icons';
  arrangement: 'rows' | 'clusters';
}

// Base-Ten Diagram (place value, decimal operations)
export interface BaseTenDiagramPlan {
  type: 'base-ten-diagram';
  hundreds: number;
  tens: number;
  ones: number;
  operation: 'none' | 'addition' | 'subtraction' | 'regrouping';
  showValues?: boolean;
}

// Dot Plot (data distributions, frequencies)
export interface DotPlotPlan {
  type: 'dot-plot';
  dataPoints: number[];
  axisLabel: string;
  axisRange: [number, number];
  title?: string;
}

// Box Plot (quartiles, variability)
export interface BoxPlotPlan {
  type: 'box-plot';
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  axisLabel: string;
  axisRange: [number, number];
}

// Bar Graph (comparing frequencies)
export interface BarGraphPlan {
  type: 'bar-graph';
  categories: string[];
  values: number[];
  orientation: 'vertical' | 'horizontal';
  axisLabel: string;
  title?: string;
}

// Tree Diagram (probability, sample spaces)
export interface TreeDiagramPlan {
  type: 'tree-diagram';
  levels: { outcomes: string[]; probabilities: number[] }[];
  finalOutcomes: string[];
  highlightPath?: string[];
}

// Circle Diagram (circles with labeled parts)
export interface CircleDiagramPlan {
  type: 'circle-diagram';
  radius: number;
  diameter: number;
  circumference: string | number;
  showCenter?: boolean;
  labeledParts: ('radius' | 'diameter' | 'circumference' | 'center' | 'area')[];
  unit?: string;
}

// Scale Drawing (maps, floor plans, blueprints)
export interface ScaleDrawingPlan {
  type: 'scale-drawing';
  scaleFactor: string;
  drawingMeasurements: { label: string; value: number; unit: string }[];
  actualMeasurements: { label: string; value: number; unit: string }[];
  drawingType: 'map' | 'floor-plan' | 'blueprint' | 'other';
}

// Scaled Figures (original vs copy comparison)
export interface ScaledFiguresPlan {
  type: 'scaled-figures';
  originalDimensions: { label: string; value: number }[];
  scaleFactor: number;
  copyDimensions: { label: string; value: number }[];
  shapeType?: 'rectangle' | 'triangle' | 'polygon';
  showLabels?: boolean;
}

// Other/Custom diagrams
export interface OtherVisualPlan {
  type: 'other';
  description: string;
  elements?: string[];
  labels?: string[];
  annotations?: string[];
}

// Union of all visual plan types (except coordinate-graph which uses GraphPlan)
export type VisualPlan =
  | TapeDiagramPlan
  | DoubleNumberLinePlan
  | AreaModelPlan
  | NumberLinePlan
  | RatioTablePlan
  | HangerDiagramPlan
  | InputOutputTablePlan
  | GridDiagramPlan
  | NetDiagramPlan
  | MeasurementDiagramPlan
  | DiscreteDiagramPlan
  | BaseTenDiagramPlan
  | DotPlotPlan
  | BoxPlotPlan
  | BarGraphPlan
  | TreeDiagramPlan
  | CircleDiagramPlan
  | ScaleDrawingPlan
  | ScaledFiguresPlan
  | OtherVisualPlan;

// ============================================================
// Graph Plan - Coordinate plane visualizations
// ============================================================

// Graph plan for coordinate plane visualizations (required when svgSubtype is 'coordinate-graph')
// This captures pre-calculated mathematical data to ensure accurate graph generation
export interface GraphPlan {
  equations: {
    label: string;      // e.g., "Line 1", "Standard Mode"
    equation: string;   // e.g., "y = 5x + 20"
    slope: number;      // e.g., 5 (the 'm' in y = mx + b)
    yIntercept: number; // e.g., 20 (the 'b' in y = mx + b)
    color: string;      // e.g., "#60a5fa" (blue) or "#22c55e" (green)
    // CRITICAL: Explicit line endpoints for mathematically accurate drawing
    // These define where the SVG line element starts and ends
    startPoint: { x: number; y: number };  // Data coordinates where line enters plot (usually y-intercept)
    endPoint: { x: number; y: number };    // Data coordinates where line exits plot (at xMax or edge)
  }[];
  scale: {
    xMax: number;        // Rightmost x-value (e.g., 8)
    yMax: number;        // Top y-value (e.g., 50)
    xAxisLabels: number[]; // e.g., [0, 2, 4, 6, 8]
    yAxisLabels: number[]; // e.g., [0, 10, 20, 30, 40, 50]
  };
  // Pre-calculated key points to ensure math accuracy
  keyPoints: {
    label: string;  // e.g., "y-intercept Line 1", "Line 1 at x=4"
    x: number;      // data x-value
    y: number;      // data y-value (calculated from equation)
    dataX: number;  // same as x (for clarity in pixel calculation)
    dataY: number;  // same as y (for clarity in pixel calculation)
  }[];
  annotations: {
    type: 'y-intercept-shift' | 'parallel-label' | 'slope-comparison' | 'intersection-point' | 'slope-triangle' | 'point-label';
    from?: number;   // Starting y-value for shift arrows
    to?: number;     // Ending y-value for shift arrows
    label: string;   // Text to display (e.g., "+20")
    position?: string; // Optional position hint
  }[];
}

// Problem analysis from Claude
export interface ProblemAnalysis {
  // Verbatim transcription of the problem from the image
  problemTranscription: string;
  problemType: string;
  mathematicalStructure: string;
  solution: {
    step: number;
    description: string;
    reasoning: string;
  }[];
  answer: string;
  keyChallenge: string;
  commonMistakes: string[];
  requiredPriorKnowledge: string[];
  answerFormat: string;
  visualType: VisualType;
  // SVG subtype - only when visualType is 'svg-visual'
  svgSubtype?: SvgSubtype;
  // Graph plan - required when svgSubtype is 'coordinate-graph'
  graphPlan?: GraphPlan;
}

// Strategy definition from Claude
export interface StrategyDefinition {
  name: string;
  oneSentenceSummary: string;
  moves: {
    verb: string;
    description: string;
    result: string;
  }[];
  slideHeaders: string[];
  cfuQuestionTemplates: string[];
}

// Scenario for worked example / practice problems
export interface Scenario {
  name: string;
  context: string;
  themeIcon: string;
  numbers: string;
  description: string;
  // Problem reminder (≤15 words) - condensed summary for slides 2-8
  problemReminder?: string;
  // Visual plan for non-coordinate-graph visuals (tape-diagram, double-number-line, etc.)
  visualPlan?: VisualPlan;
  // Graph plan for coordinate graphs (kept for backward compatibility)
  // Only when visualType is 'svg-visual' and svgSubtype is 'coordinate-graph'
  graphPlan?: GraphPlan;
}

// Response from analyze-problem action
export interface AnalyzeResponse {
  success: boolean;
  data?: {
    problemAnalysis: ProblemAnalysis;
    strategyDefinition: StrategyDefinition;
    scenarios: Scenario[];
  };
  error?: string;
}

// Response from generate-slides action
export interface GenerateSlidesResponse {
  success: boolean;
  data?: {
    slides: HtmlSlide[];
  };
  error?: string;
}

// Wizard step enum
export type WizardStep = 1 | 2 | 3;

// Loading phase for detailed progress tracking
export type LoadingPhase =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'generating'
  | 'saving';

// Slide generation progress for SSE streaming
export interface SlideProgress {
  currentSlide: number;
  estimatedTotal: number;
}

// Loading progress info
export interface LoadingProgress {
  phase: LoadingPhase;
  message: string;
  detail?: string;
  startTime?: number;
  slideProgress?: SlideProgress;
}

// Wizard state
export interface WizardState {
  // Current step
  currentStep: WizardStep;

  // Step 1: Inputs
  gradeLevel: GradeLevel | null;
  unitNumber: number | null;
  lessonNumber: number | null;
  lessonName: string;
  section: string | null;
  scopeAndSequenceId: string | null;
  learningGoals: string[];
  masteryCheckImage: {
    file: File | null;
    preview: string | null;
    uploadedUrl: string | null;
  };

  // Additional context (optional)
  additionalImages: {
    file: File | null;
    preview: string | null;
    uploadedUrl: string | null;
  }[];
  additionalContext: string;

  // Step 2: Analysis (from Claude)
  problemAnalysis: ProblemAnalysis | null;
  strategyDefinition: StrategyDefinition | null;
  scenarios: Scenario[] | null;

  // Step 3: Generated slides
  slides: HtmlSlide[];
  selectedSlideIndex: number;
  // Multi-slide selection for batch editing
  slidesToEdit: number[];    // Slide indices selected for editing
  contextSlides: number[];   // Slide indices selected as context only (read-only)

  // Step 4: Metadata for saving
  title: string;
  slug: string;
  mathConcept: string;
  mathStandard: string;
  isPublic: boolean;

  // Status
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: LoadingProgress;
  error: string | null;
}

// Wizard actions
export type WizardAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_GRADE_LEVEL'; payload: GradeLevel | null }
  | { type: 'SET_UNIT_NUMBER'; payload: number | null }
  | { type: 'SET_LESSON_NUMBER'; payload: number | null }
  | { type: 'SET_LESSON_NAME'; payload: string }
  | { type: 'SET_SECTION'; payload: string | null }
  | { type: 'SET_SCOPE_AND_SEQUENCE_ID'; payload: string | null }
  | { type: 'SET_LEARNING_GOALS'; payload: string[] }
  | { type: 'SET_MASTERY_IMAGE'; payload: { file: File | null; preview: string | null } }
  | { type: 'SET_UPLOADED_IMAGE_URL'; payload: string }
  | { type: 'ADD_ADDITIONAL_IMAGE'; payload: { file: File; preview: string } }
  | { type: 'REMOVE_ADDITIONAL_IMAGE'; payload: number }
  | { type: 'SET_ADDITIONAL_IMAGE_URL'; payload: { index: number; url: string } }
  | { type: 'SET_ADDITIONAL_CONTEXT'; payload: string }
  | { type: 'SET_ANALYSIS'; payload: { problemAnalysis: ProblemAnalysis; strategyDefinition: StrategyDefinition; scenarios: Scenario[] } }
  | { type: 'CLEAR_ANALYSIS' }
  | { type: 'UPDATE_STRATEGY_NAME'; payload: string }
  | { type: 'UPDATE_SCENARIO'; payload: { index: number; scenario: Scenario } }
  | { type: 'SET_SLIDES'; payload: HtmlSlide[] }
  | { type: 'UPDATE_SLIDE'; payload: { index: number; htmlContent: string } }
  | { type: 'UPDATE_SLIDES_BATCH'; payload: { index: number; htmlContent: string }[] }
  | { type: 'SET_SELECTED_SLIDE'; payload: number }
  | { type: 'TOGGLE_SLIDE_TO_EDIT'; payload: number }
  | { type: 'TOGGLE_CONTEXT_SLIDE'; payload: number }
  | { type: 'SET_SLIDE_SELECTION_MODE'; payload: { index: number; mode: 'edit' | 'context' } }
  | { type: 'DESELECT_SLIDE'; payload: number }
  | { type: 'CLEAR_SLIDE_SELECTIONS' }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_SLUG'; payload: string }
  | { type: 'SET_MATH_CONCEPT'; payload: string }
  | { type: 'SET_MATH_STANDARD'; payload: string }
  | { type: 'SET_IS_PUBLIC'; payload: boolean }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_LOADING_PROGRESS'; payload: LoadingProgress }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Initial state
export const initialWizardState: WizardState = {
  currentStep: 1,
  gradeLevel: null,
  unitNumber: null,
  lessonNumber: null,
  lessonName: '',
  section: null,
  scopeAndSequenceId: null,
  learningGoals: [],
  masteryCheckImage: {
    file: null,
    preview: null,
    uploadedUrl: null,
  },
  additionalImages: [],
  additionalContext: '',
  problemAnalysis: null,
  strategyDefinition: null,
  scenarios: null,
  slides: [],
  selectedSlideIndex: 0,
  slidesToEdit: [],
  contextSlides: [],
  title: '',
  slug: '',
  mathConcept: '',
  mathStandard: '',
  isPublic: true,
  isLoading: false,
  loadingMessage: '',
  loadingProgress: {
    phase: 'idle',
    message: '',
  },
  error: null,
};
