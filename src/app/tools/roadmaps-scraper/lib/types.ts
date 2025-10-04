import { z } from "zod";
import { RoadmapsLessonFieldsSchema } from "@zod-schema/313/roadmap";

// Use the lesson fields schema as the skill data schema since they're the same structure
export const SkillDataZodSchema = RoadmapsLessonFieldsSchema;

/**
 * Schema for Roadmaps platform credentials
 */
export const RoadmapsCredentialsZodSchema = z.object({
  email: z.string().email("Please enter a valid email address").default("demoaccount+lily.carter@teachtoone.org"),
  password: z.string().min(1, "Password is required").default("Fraction@75")
});



/**
 * Schema for scraping request
 */
export const RoadmapsScrapingRequestZodSchema = z.object({
  credentials: RoadmapsCredentialsZodSchema,
  skillUrls: z.array(z.string().url()).min(1, "At least one URL is required").max(12, "Maximum 12 URLs allowed"),
  delayBetweenRequests: z.number().min(1000).max(10000).optional().default(2000)
});

/**
 * Schema for scraping response
 */
export const RoadmapsScrapingResponseZodSchema = z.object({
  success: z.boolean(),
  totalRequested: z.number(),
  totalSuccessful: z.number(),
  totalFailed: z.number(),
  skills: z.array(SkillDataZodSchema),
  errors: z.array(z.string()).optional(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string()
});

// Export inferred types
export type RoadmapsCredentials = z.infer<typeof RoadmapsCredentialsZodSchema>;
export type SkillData = z.infer<typeof SkillDataZodSchema>;
export type RoadmapsScrapingRequest = z.infer<typeof RoadmapsScrapingRequestZodSchema>;
export type RoadmapsScrapingResponse = z.infer<typeof RoadmapsScrapingResponseZodSchema>;

/**
 * Constants for Roadmaps platform
 */
export const ROADMAPS_CONSTANTS = {
  BASE_URL: "https://roadmaps.teachtoone.org",
  LOGIN_URL: "https://roadmaps-demo.teachtoone.org/",
  LOGIN_BUTTON_SELECTOR: '[data-testid="login"]',
  EMAIL_FIELD_SELECTOR: "#username",
  PASSWORD_FIELD_SELECTOR: "#password",
  SUBMIT_BUTTON_SELECTOR: 'button[type="submit"]',
  
  // Alternative selectors for fallback
  ALT_EMAIL_SELECTOR: 'input[name="username"]',
  ALT_PASSWORD_SELECTOR: 'input[name="password"]',
  ALT_SUBMIT_SELECTOR: 'button[name="action"][value="default"]',
  
  // Additional elements that might interfere
  PASSWORD_TOGGLE_SELECTOR: 'button[data-action="toggle"]',
  
  // Form container for context
  LOGIN_FORM_SELECTOR: 'form[data-form-primary="true"]',
  
  DEFAULT_DELAY: 2000,
  MAX_URLS: 12,
  SELECTORS: {
    // Page title
    PAGE_TITLE: ".nc_page-header h1",
    
    // Fieldset content extraction
    DESCRIPTION_FIELDSET: 'fieldset:has(legend:contains("Description"))',
    SKILL_CRITERIA_FIELDSET: 'fieldset:has(legend:contains("Skill Challenge Criteria"))',
    ESSENTIAL_QUESTION_FIELDSET: 'fieldset:has(legend:contains("Essential Question"))',
    STANDARDS_FIELDSET: 'fieldset:has(legend:contains("CC."))',
    
    // Section headers for strategy content
    LAUNCH_SECTION: 'h4:has-text("Launch:")',
    TEACHER_STUDENT_STRATEGIES: 'h4:has-text("Teacher/Student Strategies:")',
    MODELS_MANIPULATIVES: 'h4:has-text("Models and Manipulatives:")',
    QUESTIONS_TO_HELP: 'h4:has-text("Questions to Help Students Get Unstuck:")',
    DISCUSSION_QUESTIONS: 'h4:has-text("Discussion Questions:")',
    COMMON_MISCONCEPTIONS: 'h4:has-text("Common Misconceptions:")',
    ADDITIONAL_RESOURCES: 'h4:has-text("Additional Resources:")',
    
    // Accordion sections
    ACCORDION_HEADERS: '.p-accordion-header-link',
    VOCABULARY_ACCORDION: '[aria-controls*="content"]:has-text("Vocabulary")',
    STANDARDS_ACCORDION: '[aria-controls*="content"]:has-text("Standards")',
    COLLAPSED_ACCORDION: '[aria-expanded="false"]',
    
    // Images
    ALL_IMAGES: 'img[src]:not([src^="data:"])',
    
    // Video extraction selectors
    ADDITIONAL_RESOURCES_ACCORDION: 'text="Additional Lessons & Resources"',
    WORKED_EXAMPLE_LINK: 'span.cursor-pointer:text("Worked Example Video")',
    VIDEO_DIALOG: '.p-dialog-content',
    VIDEO_SOURCE: 'video source',
    
    // Content areas
    FIELDSET_CONTENT: '.p-fieldset-content',
    PRIMER_CONTENT: '#primer'
  }
} as const;
