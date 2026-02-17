import { Schema, model, models } from "mongoose";

const SessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    pageViews: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // Total session time in seconds
    userAgent: { type: String },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
    collection: "sessions",
  },
);

// Auto-expire old sessions after 90 days
SessionSchema.index(
  { startTime: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
);

const Session = models.Session || model("Session", SessionSchema);

export default Session;
