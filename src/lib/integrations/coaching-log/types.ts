// src/lib/integrations/coaching-log/types.ts
// Exact structure from working Playwright automation system

export interface FormFieldEntry {
  selector: string;
  label: string;
  type?: string;
  value: string | string[] | EventEntry[] | boolean | number;
  options?: string[];
  organization: {
    section: number;
    index: number;
  };
}

export interface EventEntry {
  name: string[];
  role: string;
  activity: string;
  duration: string;
}

export interface CoachingLogFormData {
  formFields: FormFieldEntry[];
  formUrl: string;
} 