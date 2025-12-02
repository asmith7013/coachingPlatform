import { Schema, model, models } from 'mongoose';

const PageViewSchema = new Schema(
  {
    userId: { type: String, index: true }, // Clerk user ID
    clerkId: { type: String, index: true }, // Alias
    userEmail: { type: String },
    sessionId: { type: String, required: true, index: true },
    page: { type: String, required: true, index: true },
    fullUrl: { type: String, required: true },
    referrer: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    duration: { type: Number }, // Time spent on page in seconds
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'page-views',
  }
);

// Compound indexes for common queries
PageViewSchema.index({ userId: 1, timestamp: -1 });
PageViewSchema.index({ page: 1, timestamp: -1 });
PageViewSchema.index({ sessionId: 1, timestamp: 1 });

// Auto-expire old page views after 90 days (optional - can be adjusted or removed)
PageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const PageView = models.PageView || model('PageView', PageViewSchema);

export default PageView;
