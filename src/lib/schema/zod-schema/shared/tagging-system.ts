import { z } from "zod";
import { zDateField } from "./dateHelpers";

export const TagZodSchema = z.object({
  type: z.enum([
    "cycle",
    "visit",
    "period",
    "activity",
    "person",
    "subject",
    "location",
    "topic",
    "goal",
    "priority",
    "custom",
  ]),
  value: z.string(),
  confidence: z.enum(["auto", "manual"]).default("auto"),
  isEditable: z.boolean().default(true),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const ContextMetadataZodSchema = z.object({
  timestamp: zDateField,
  scheduledActivity: z.string().optional(),
  actualActivity: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).optional(),
  sourceType: z
    .enum(["manual", "scheduled", "detected", "imported"])
    .default("manual"),
  confidence: z.number().min(0).max(1).optional(),
});

export const TaggableContentZodSchema = z.object({
  tags: z.array(TagZodSchema).default([]),
  contextMetadata: ContextMetadataZodSchema.optional(),
  lastTagUpdate: zDateField.optional(),
  autoTaggingEnabled: z.boolean().default(true),
  searchableText: z.string().optional(),
  tagSummary: z.string().optional(),
});

// Utility functions
export function generateTagSuggestions(
  timestamp: Date,
  scheduleContext: ScheduleContext,
  existingTags: Tag[] = [],
): TagSuggestion[] {
  // Implementation here - basic structure provided
  const suggestions: TagSuggestion[] = [];

  // Filter out already existing tags to avoid duplicates
  const existingTagKeys = new Set(
    existingTags.map((tag) => `${tag.type}:${tag.value}`),
  );

  return suggestions.filter(
    (suggestion) =>
      !existingTagKeys.has(`${suggestion.tag.type}:${suggestion.tag.value}`),
  );
}

export function updateTagsPreservingManual(
  existingTags: Tag[],
  newSuggestions: TagSuggestion[],
): Tag[] {
  const manualTags = existingTags.filter((tag) => tag.confidence === "manual");
  const autoTags = newSuggestions.map((suggestion) => suggestion.tag);

  const tagMap = new Map<string, Tag>();
  autoTags.forEach((tag) => tagMap.set(`${tag.type}:${tag.value}`, tag));
  manualTags.forEach((tag) => tagMap.set(`${tag.type}:${tag.value}`, tag));

  return Array.from(tagMap.values());
}

// Helper interfaces
export interface ScheduleContext {
  visitId: string;
  cycleInfo: { name: string; number: number };
  plannedSchedule: Array<{
    startTime: string;
    endTime: string;
    activity: string;
    participants: string[];
    location?: string;
  }>;
}

export interface TagSuggestion {
  tag: Tag;
  reason: string;
  confidence: number;
}

export type Tag = z.infer<typeof TagZodSchema>;
export type ContextMetadata = z.infer<typeof ContextMetadataZodSchema>;
export type TaggableContent = z.infer<typeof TaggableContentZodSchema>;
