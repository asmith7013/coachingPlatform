import mongoose from "mongoose";

const StateTestQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    standard: { type: String, required: true, index: true },
    secondaryStandard: { type: String, required: false, index: true }, // Optional secondary standard
    examYear: { type: String, required: true, index: true },
    examTitle: { type: String, required: true },
    grade: { type: String, required: true, index: true },
    screenshotUrl: { type: String, required: true },
    questionType: { type: String, required: true }, // From scraper
    responseType: {
      type: String,
      enum: ["multipleChoice", "constructedResponse"],
      required: false,
    },
    points: { type: Number, required: false }, // Point value
    answer: { type: String, required: false }, // Correct answer
    questionNumber: { type: Number, required: false }, // Actual question number from the exam (e.g., Q#1, Q#2)
    sourceUrl: { type: String, required: true },
    scrapedAt: { type: Date, required: true },
    pageIndex: { type: Number, required: true }, // 1-based position on source page
  },
  {
    collection: "state-test-questions",
    timestamps: true,
  },
);

// Compound index for common queries
StateTestQuestionSchema.index({ grade: 1, examYear: 1 });

export const StateTestQuestionModel =
  mongoose.models.StateTestQuestion ||
  mongoose.model("StateTestQuestion", StateTestQuestionSchema);
