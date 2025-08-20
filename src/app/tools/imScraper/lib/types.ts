import { z } from "zod";

/**
 * Schema for IM platform credentials
 */
export const IMCredentialsZodSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

/**
 * Enhanced schema for summer project requirements
 * Transforms cooldown content into three core outputs
 */
export const CooldownParserZodSchema = z.object({
  // Three core outputs for summer project
  canvas: z.object({
    images: z.array(z.object({
      url: z.string(),
      alt: z.string()
    }))
  }),
  
  questionText: z.string(),
  acceptanceCriteria: z.string(),
  
  // Raw math for manual Claude processing
  detectedMath: z.array(z.object({
    section: z.enum(['questionText', 'acceptanceCriteria']),
    rawHtml: z.string(),
    screenreaderText: z.string().optional(),
    placeholder: z.string(), // what was inserted in the clean text
    mathIndex: z.number()
  })),
  
  // Metadata
  title: z.string().default('Cool-down'),
  duration: z.string().optional(),
  hasMathContent: z.boolean(),
  requiresManualReview: z.boolean(),
  
  // Screenshots for visual review
  screenshots: z.array(z.string()).optional(), // Array of screenshot file paths

  // NEW FIELDS FOR CLAUDE EXPORT
  claudeExport: z.object({
    studentTaskStatement_rawHtml: z.string(),
    studentResponse_rawHtml: z.string(),
    screenshotReferences: z.array(z.object({
      filename: z.string(),
      type: z.enum(['task', 'response', 'image', 'full']),
      markdownReference: z.string()
    })),
    formattedForClaude: z.string() // Complete formatted output ready for copy-paste
  }).optional()
});

/**
 * Schema for scraped IM lesson data
 */
export const IMLessonZodSchema = z.object({
  url: z.string().url(),
  grade: z.string(),
  unit: z.string(),
  section: z.string(),
  lesson: z.string(),
  cooldown: CooldownParserZodSchema.optional(), // Updated reference
  scrapedAt: z.string(),
  success: z.boolean(),
  error: z.string().optional()
});

/**
 * Schema for URL generation parameters
 */
export const IMUrlGenerationZodSchema = z.object({
  grade: z.number().min(6).max(8),
  startUnit: z.number().min(1).max(9),
  endUnit: z.number().min(1).max(9),
  sectionLessons: z.record(
    z.string(), // section key like "a", "b", "c"
    z.array(z.number().min(1).max(20)) // lesson numbers for that section
  ).optional().default({}),
  delayBetweenRequests: z.number().min(1000).max(10000).optional().default(2000)
}).refine(data => data.endUnit >= data.startUnit, {
  message: "End unit must be greater than or equal to start unit",
  path: ["endUnit"]
});

/**
 * Schema for scraping request
 */
export const IMScrapingRequestZodSchema = z.object({
  credentials: IMCredentialsZodSchema,
  lessonUrls: z.array(z.string().url()).min(1, "At least one URL is required"),
  delayBetweenRequests: z.number().min(1000).max(10000).optional().default(2000),
  enableClaudeExport: z.boolean().optional().default(false) // NEW FIELD
});

/**
 * Schema for scraping response
 */
export const IMScrapingResponseZodSchema = z.object({
  success: z.boolean(),
  totalRequested: z.number(),
  totalSuccessful: z.number(),
  totalFailed: z.number(),
  lessons: z.array(IMLessonZodSchema),
  errors: z.array(z.string()).optional(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string()
});

// Export inferred types
export type IMCredentials = z.infer<typeof IMCredentialsZodSchema>;
export type CooldownParser = z.infer<typeof CooldownParserZodSchema>; // New type
export type IMLesson = z.infer<typeof IMLessonZodSchema>; // Updated to use new cooldown schema
export type IMUrlGeneration = z.infer<typeof IMUrlGenerationZodSchema>;

// Type for lesson selection state in UI
export interface SectionLessonSelection {
  [section: string]: number[]; // e.g., { "a": [1, 3, 5], "b": [2, 4] }
}
export type IMScrapingRequest = z.infer<typeof IMScrapingRequestZodSchema>;
export type IMScrapingResponse = z.infer<typeof IMScrapingResponseZodSchema>;

/**
 * Constants for IM platform
 */
export const IM_CONSTANTS = {
  BASE_URL: "https://accessim.org",
  LOGIN_URL: "https://login.illustrativemathematics.org/oauth2/authorize?client_id=26bc1a3c-177c-4161-84cf-762412a09e36&scope=openid%20offline_access&response_type=code&redirect_uri=https%3A%2F%2Faccessim.org%2Fapi%2Fauth%2Fcallback%2Ffusionauth&tenantId=edf4b84b-691e-4196-9cc3-b788e48dad9a&state=23aKwKVq_-mSthOW6dGPRkR7rrwgBps4CaUYgrLHEaw&code_challenge=iobl7ah6i6ibNFH2Imump4HwUEdDMy95GgCJSRxx4dY&code_challenge_method=S256",
  GRADES: [6, 7, 8] as const,
  SECTIONS: ["a", "b", "c", "d", "e", "f"] as const,
  MAX_UNITS: 9,
  MAX_LESSONS_PER_SECTION: 15,
  DEFAULT_DELAY: 2000,
  SELECTORS: {
    // In-page authentication (primary)
    COOLDOWN_SIGNIN_BUTTON: '#cooldown button:has-text("Sign in")',
    
    // Login form fields (for modal/popup)
    EMAIL_FIELD: "#loginId",
    PASSWORD_FIELD: "#password", 
    SUBMIT_BUTTON: "button.blue.button",
    
    // Content extraction
    COOLDOWN_CONTAINER: "#cooldown",
    TITLE: ".im-c-card-heading__title",
    DURATION: ".im-c-icon-heading__title .inline-math",
    STANDARDS: ".im-c-standards",
    STUDENT_TASK: "h3:contains('Student Task Statement')",
    STUDENT_RESPONSE: "h3:contains('Student Response')",
    MATERIALS: "h3:contains('Materials')",
    LAUNCH: "h3:contains('Launch')",
    ACTIVITY: "h3:contains('Activity')",
    BUILDING_ON: "h3:contains('Building On Student Thinking')",
    READY_FOR_MORE: "h3:contains('Are You Ready for More?')",
    RESPONDING: "h3:contains('Responding to Student Thinking')"
  }
} as const;