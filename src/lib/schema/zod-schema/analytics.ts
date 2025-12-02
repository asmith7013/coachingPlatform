import { z } from 'zod';

export const PageViewSchema = z.object({
  userId: z.string().optional(), // Clerk user ID (optional for anonymous tracking)
  clerkId: z.string().optional(), // Alias for consistency
  userEmail: z.string().email({ message: "Invalid email format" }).optional().or(z.literal('')),
  sessionId: z.string(), // Browser session identifier
  page: z.string(), // Page path (e.g., "/roadmaps/123")
  fullUrl: z.string().url(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date(),
  duration: z.number().optional(), // Time spent on page (in seconds)
  metadata: z.record(z.string(), z.unknown()).optional(), // Additional custom data
});

export const SessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  pageViews: z.number().default(0),
  totalDuration: z.number().default(0), // Total session time in seconds
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type PageView = z.infer<typeof PageViewSchema>;
export type Session = z.infer<typeof SessionSchema>;

// Query schemas
export const AnalyticsQuerySchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  userId: z.string().optional(),
  page: z.string().optional(),
  limit: z.number().default(100),
  offset: z.number().default(0),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
