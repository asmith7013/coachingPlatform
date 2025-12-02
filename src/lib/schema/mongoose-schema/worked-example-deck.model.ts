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
  slug: { type: String, required: true, unique: true, index: true },

  // Educational Context
  mathConcept: { type: String, required: true, index: true },
  mathStandard: { type: String, required: true },
  gradeLevel: { type: Number, required: true, min: 3, max: 12, index: true },

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
workedExampleDeckSchema.index({ slug: 1 }, { unique: true });

// Text search index for finding decks
workedExampleDeckSchema.index({
  title: 'text',
  mathConcept: 'text',
  mathStandard: 'text',
});

export const WorkedExampleDeck = mongoose.models.WorkedExampleDeck ||
  mongoose.model('WorkedExampleDeck', workedExampleDeckSchema);
