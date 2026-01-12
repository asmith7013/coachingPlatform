import mongoose from 'mongoose';

const htmlSlideSchema = {
  slideNumber: { type: Number, required: true },
  htmlContent: { type: String, required: true }, // Full HTML for the slide
  visualType: { type: String, enum: ['html', 'p5', 'd3'], default: 'html' },
  scripts: [{
    type: { type: String, enum: ['cdn', 'inline'] },
    content: String,
  }],
  customCSS: String,
};

// Analysis data schemas - stored for deck editing
const solutionStepSchema = {
  step: { type: Number, required: true },
  description: { type: String, required: true },
  reasoning: { type: String, required: true },
};

const diagramPreviewSchema = {
  ascii: { type: String, required: true },
  keyElements: [{
    element: { type: String, required: true },
    represents: { type: String, required: true },
  }],
};

const graphPlanSchema = {
  equations: [{
    label: String,
    equation: String,
    slope: Number,
    yIntercept: Number,
    color: String,
    startPoint: { x: Number, y: Number },
    endPoint: { x: Number, y: Number },
  }],
  scale: {
    xMax: Number,
    yMax: Number,
    xAxisLabels: [Number],
    yAxisLabels: [Number],
  },
  keyPoints: [{
    label: String,
    x: Number,
    y: Number,
    dataX: Number,
    dataY: Number,
  }],
  annotations: [{
    type: { type: String, enum: ['y-intercept-shift', 'parallel-label', 'slope-comparison', 'intersection-point', 'slope-triangle', 'point-label'] },
    from: Number,
    to: Number,
    label: String,
    position: String,
  }],
};

const problemAnalysisSchema = {
  problemTranscription: { type: String, required: true },
  problemType: { type: String, required: true },
  mathematicalStructure: { type: String, required: true },
  solution: [solutionStepSchema],
  answer: { type: String, required: true },
  keyChallenge: { type: String, required: true },
  commonMistakes: [String],
  requiredPriorKnowledge: [String],
  answerFormat: { type: String, required: true },
  visualType: { type: String, enum: ['text-only', 'html-table', 'svg-visual'], required: true },
  svgSubtype: { type: String, enum: ['coordinate-graph', 'diagram', 'shape', 'number-line', 'other'] },
  graphPlan: graphPlanSchema,
  diagramPreview: diagramPreviewSchema,
};

const strategyMoveSchema = {
  verb: { type: String, required: true },
  description: { type: String, required: true },
  result: { type: String, required: true },
};

const strategyDefinitionSchema = {
  name: { type: String, required: true },
  oneSentenceSummary: { type: String, required: true },
  moves: [strategyMoveSchema],
  slideHeaders: [String],
  cfuQuestionTemplates: [String],
};

const scenarioSchema = {
  name: { type: String, required: true },
  context: { type: String, required: true },
  themeIcon: { type: String, required: true },
  numbers: { type: String, required: true },
  description: { type: String, required: true },
  problemReminder: String,
  visualPlan: { type: mongoose.Schema.Types.Mixed }, // Flexible JSON for various plan types
  graphPlan: graphPlanSchema,
};

const workedExampleDeckSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  // Educational Context
  mathConcept: { type: String, required: true, index: true },
  mathStandard: { type: String, default: '' },
  gradeLevel: { type: String, required: true, enum: ['6', '7', '8', 'Algebra 1'], index: true },
  unitNumber: { type: Number }, // Unit number (matches scope-and-sequence)
  lessonNumber: { type: Number }, // Lesson number (matches scope-and-sequence)
  scopeAndSequenceId: { type: String, index: true }, // Link to scope-and-sequence collection

  // HTML Slides (required)
  htmlSlides: { type: [htmlSlideSchema], required: true },

  // Learning Goals
  learningGoals: [String],

  // Analysis Data (optional - stored for deck editing)
  // These fields preserve the wizard state so decks can be loaded back into the wizard
  problemAnalysis: problemAnalysisSchema,
  strategyDefinition: strategyDefinitionSchema,
  scenarios: [scenarioSchema],

  // Generation Info
  generatedBy: { type: String, enum: ['ai', 'manual'], required: true },
  sourceImage: String,

  // Ownership
  createdBy: { type: String, required: true, index: true },
  isPublic: { type: Boolean, default: false },

  // Soft delete
  deactivated: { type: Boolean, default: false, index: true },

  // Google Slides URL (set after export)
  googleSlidesUrl: { type: String },

  // Files
  files: {
    pageComponent: { type: String, required: true },
    dataFile: { type: String, required: true },
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for efficient queries
workedExampleDeckSchema.index({ gradeLevel: 1, mathConcept: 1 });
workedExampleDeckSchema.index({ createdBy: 1, isPublic: 1 });

// Text search index for finding decks
workedExampleDeckSchema.index({
  title: 'text',
  mathConcept: 'text',
  mathStandard: 'text',
});

export const WorkedExampleDeck = mongoose.models.WorkedExampleDeck ||
  mongoose.model('WorkedExampleDeck', workedExampleDeckSchema);
