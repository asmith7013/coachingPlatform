// Re-export the StateTestQuestion type from the Zod schema
export type { StateTestQuestion } from '@/lib/schema/zod-schema/scm/state-test-question';

export interface ScraperConfig {
  email: string;
  password: string;
  headless: boolean;
}

/**
 * DOM Selectors for Problem-Attic pages
 * Verified against page.html - all selectors consistent across 31+ questions
 */
export const SELECTORS = {
  // Login page selectors
  EMAIL_INPUT: '#login_form_login',
  NEXT_BUTTON: 'input[type="submit"][value="Next"]',
  PASSWORD_INPUT: '#login_form_password',

  // Page metadata selectors
  EXAM_TITLE: '#subject-description span',

  // Question container and element selectors
  QUESTION_CONTAINER: 'div[id^="problem-link-"]',
  STANDARD_LABEL: 'span.label.label-default.objective',
  QUESTION_IMAGE: '.document-image img',
  QUESTION_TYPE: '.type-icon img',
} as const;
