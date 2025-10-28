import { z } from "zod";

// =====================================
// ROADMAP CONSTANTS
// =====================================

export const ROADMAP_OPTIONS = [
  "Illustrative Math New York - 6th Grade",
  "Illustrative Math New York - 7th Grade",
  "Illustrative Math New York - 8th Grade",
  "Illustrative Math New York - Algebra 1"
] as const;

export type RoadmapOption = typeof ROADMAP_OPTIONS[number];

export const RoadmapSchema = z.enum(ROADMAP_OPTIONS);

// =====================================
// SKILL REFERENCE SCHEMA
// =====================================

export const SkillReferenceSchema = z.object({
  title: z.string(),
  skillNumber: z.string(),
});

export type SkillReference = z.infer<typeof SkillReferenceSchema>;

// =====================================
// TARGET SKILL SCHEMA
// =====================================

export const TargetSkillSchema = z.object({
  title: z.string(),
  skillNumber: z.string(),
  essentialSkills: z.array(SkillReferenceSchema).default([]),
  helpfulSkills: z.array(SkillReferenceSchema).default([]),
});

export type TargetSkill = z.infer<typeof TargetSkillSchema>;

// =====================================
// UNIT DATA SCHEMA
// =====================================

export const UnitDataSchema = z.object({
  unitTitle: z.string(),
  url: z.string().url(),
  targetCount: z.number(),
  supportCount: z.number(),
  extensionCount: z.number(),
  targetSkills: z.array(TargetSkillSchema).default([]),
  additionalSupportSkills: z.array(SkillReferenceSchema).default([]),
  extensionSkills: z.array(SkillReferenceSchema).default([]),
  scrapedAt: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type UnitData = z.infer<typeof UnitDataSchema>;

// =====================================
// CREDENTIALS SCHEMA
// =====================================

export const UnitScraperCredentialsSchema = z.object({
  email: z.string().email("Please enter a valid email address").default("alex.smith@teachinglab.org"),
  password: z.string().min(1, "Password is required").default("rbx1KQD3fpv7qhd!erc")
});

export type UnitScraperCredentials = z.infer<typeof UnitScraperCredentialsSchema>;

// =====================================
// SCRAPING REQUEST SCHEMA
// =====================================

export const UnitScrapingRequestSchema = z.object({
  credentials: UnitScraperCredentialsSchema,
  roadmap: RoadmapSchema,
  delayBetweenRequests: z.number().min(500).max(10000).optional().default(1000),
  delayBetweenUnits: z.number().min(500).max(10000).optional().default(2000)
});

export type UnitScrapingRequest = z.infer<typeof UnitScrapingRequestSchema>;

// =====================================
// SCRAPING RESPONSE SCHEMA
// =====================================

export const UnitScrapingResponseSchema = z.object({
  success: z.boolean(),
  roadmap: z.string(),
  totalUnits: z.number(),
  successfulUnits: z.number(),
  failedUnits: z.number(),
  units: z.array(UnitDataSchema).default([]),
  errors: z.array(z.string()).default([]),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string()
});

export type UnitScrapingResponse = z.infer<typeof UnitScrapingResponseSchema>;
