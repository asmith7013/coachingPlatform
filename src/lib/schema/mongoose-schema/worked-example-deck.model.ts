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

const workedExampleDeckSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  // Educational Context
  mathConcept: { type: String, required: true, index: true },
  mathStandard: { type: String, required: true },
  gradeLevel: { type: String, required: true, enum: ['6', '7', '8', 'Algebra 1'], index: true },
  unitNumber: { type: Number }, // Unit number (matches scope-and-sequence)
  lessonNumber: { type: Number }, // Lesson number (matches scope-and-sequence)
  scopeAndSequenceId: { type: String, index: true }, // Link to scope-and-sequence collection

  // HTML Slides (required)
  htmlSlides: { type: [htmlSlideSchema], required: true },

  // Learning Goals
  learningGoals: [String],

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

// Text search index for finding decks
workedExampleDeckSchema.index({
  title: 'text',
  mathConcept: 'text',
  mathStandard: 'text',
});

export const WorkedExampleDeck = mongoose.models.WorkedExampleDeck ||
  mongoose.model('WorkedExampleDeck', workedExampleDeckSchema);
