import mongoose from 'mongoose';

const diagramSchema = {
  type: { type: String, enum: ['image', 'p5js'] },
  content: String, // URL for images, code string for p5.js
};

const tableRowSchema = {
  input: { type: Number, required: true },
  output: { type: Number, default: null },
};

const workedExampleDeckSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },

  // Educational Context
  mathConcept: { type: String, required: true, index: true },
  mathStandard: { type: String, required: true },
  gradeLevel: { type: Number, required: true, min: 3, max: 12, index: true },

  // The 9 Slides
  slides: {
    slide1: {
      unit: String,
      title: String,
      bigIdea: String,
      example: String,
      icon: String,
    },
    slide2: {
      scenario: String,
      context: String,
      icon: String,
      tableData: [tableRowSchema],
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide3: {
      question: String,
      tableData: [tableRowSchema],
      highlightRow: Number,
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide4: {
      calculation: String,
      explanation: String,
      answer: String,
      isConstant: Boolean,
      diagram: diagramSchema,
    },
    slide5: {
      question: String,
      tableData: [tableRowSchema],
      highlightRow: Number,
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide6: {
      calculation: String,
      explanation: String,
      answer: String,
      diagram: diagramSchema,
    },
    slide7: {
      title: String,
      steps: [String],
      mathRule: String,
      keyInsight: String,
      diagram: diagramSchema,
    },
    slide8: {
      scenario: String,
      context: String,
      icon: String,
      tableData: [tableRowSchema],
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide9: {
      scenario: String,
      context: String,
      icon: String,
      tableData: [tableRowSchema],
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
  },

  // Generation Info
  generatedBy: { type: String, enum: ['ai', 'manual'], required: true },
  sourceImage: String,

  // Ownership
  createdBy: { type: String, required: true, index: true },
  isPublic: { type: Boolean, default: false },

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
workedExampleDeckSchema.index({ slug: 1 }, { unique: true });

// Text search index for finding decks
workedExampleDeckSchema.index({
  title: 'text',
  mathConcept: 'text',
  mathStandard: 'text',
});

export const WorkedExampleDeck = mongoose.models.WorkedExampleDeck ||
  mongoose.model('WorkedExampleDeck', workedExampleDeckSchema);
