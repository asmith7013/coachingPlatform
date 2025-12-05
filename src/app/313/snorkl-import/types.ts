// Raw JSON structure types
export interface RawStudentResponse {
  "First Name": string;
  "Last Name": string;
  "Best Response Correct - Yes or No": string;
  "Best Response Explanation Score (0-4)": string | number;
  "Best Response Date": string;
  "1st Response Correct - Yes or No"?: string;
  "1st Response Explanation Score (0-4)"?: string | number;
  "1st Response Date"?: string;
  "2nd Response Correct - Yes or No"?: string;
  "2nd Response Explanation Score (0-4)"?: string | number;
  "2nd Response Date"?: string;
}

export interface RawAssessment {
  id: string;
  title: string;
  grades: RawStudentResponse[];
}

// Import Student type for fuzzy matching
import { Student } from '@/lib/schema/zod-schema/313/student/student';

// Fuzzy matching types
export interface StudentMatch {
  student: Student;
  confidence: 'high' | 'medium' | 'low' | 'none';
  score: number;
}

// Processed data types
export interface AttemptData {
  correct: string;
  score: string | number;
  date: string;
  isEmpty: boolean;
}

export interface StudentRow {
  name: string;
  matchedStudent: Student | null;  // NEW: Add matched student
  matchConfidence: 'high' | 'medium' | 'low' | 'none';  // NEW: Add confidence
  bestResponse: AttemptData;
  firstAttempt: AttemptData;
  secondAttempt: AttemptData;
}

export interface AssessmentData {
  id: string;
  title: string;
  grades: RawStudentResponse[];
} 