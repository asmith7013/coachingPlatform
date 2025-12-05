import { RawAssessment, RawStudentResponse, AssessmentData, StudentRow, AttemptData } from '../types';
import { findBestStudentMatch } from './fuzzy-matcher';
import { Student } from '@/lib/schema/zod-schema/313/student/student';

/**
 * Parse raw JSON string into structured assessment data
 */
export function parseJsonData(jsonString: string): AssessmentData[] {
  try {
    const parsed = JSON.parse(jsonString) as RawAssessment[];
    
    if (!Array.isArray(parsed)) {
      throw new Error('JSON must be an array of assessments');
    }
    
    return parsed.map(validateAssessment);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please check your input.');
    }
    throw error;
  }
}

/**
 * Validate and transform a raw assessment object
 */
function validateAssessment(assessment: RawAssessment): AssessmentData {
  if (!assessment.id || !assessment.title || !Array.isArray(assessment.grades)) {
    throw new Error('Invalid assessment format. Each assessment must have id, title, and grades array.');
  }
  
  return {
    id: assessment.id,
    title: assessment.title,
    grades: assessment.grades
  };
}

/**
 * Combine duplicate student entries using fuzzy name matching
 */
export function combineStudentDataWithFuzzyMatch(
  students: RawStudentResponse[], 
  availableStudents: Student[]
): StudentRow[] {
  const combinedMap = new Map<string, {
    rawData: RawStudentResponse,
    matchedStudent: Student | null,
    confidence: 'high' | 'medium' | 'low' | 'none'
  }>();
  
  students.forEach(student => {
    const attemptedName = `${student["First Name"]} ${student["Last Name"]}`.replace('-', '').trim();
    
    // Try fuzzy matching
    const match = findBestStudentMatch(attemptedName, availableStudents);
    
    const key = match?.student._id || attemptedName;
    const existing = combinedMap.get(key);
    
    if (existing) {
      // Merge responses, preferring non-empty data
      combinedMap.set(key, {
        rawData: mergeStudentResponses(existing.rawData, student),
        matchedStudent: existing.matchedStudent || match?.student || null,
        confidence: existing.confidence
      });
    } else {
      combinedMap.set(key, {
        rawData: student,
        matchedStudent: match?.student || null,
        confidence: match?.confidence || 'none'
      });
    }
  });
  
  return Array.from(combinedMap.values()).map(({ rawData, matchedStudent, confidence }) => 
    transformToStudentRowWithMatch(rawData, matchedStudent, confidence)
  );
}

/**
 * Combine duplicate student entries using fuzzy name matching (original function for backward compatibility)
 */
export function combineStudentData(students: RawStudentResponse[]): StudentRow[] {
  const combinedMap = new Map<string, RawStudentResponse>();
  
  students.forEach(student => {
    const normalizedName = normalizeStudentName(student["First Name"], student["Last Name"]);
    const existing = combinedMap.get(normalizedName);
    
    if (existing) {
      // Merge responses, preferring non-empty data
      combinedMap.set(normalizedName, mergeStudentResponses(existing, student));
    } else {
      combinedMap.set(normalizedName, student);
    }
  });
  
  return Array.from(combinedMap.values()).map(student => transformToStudentRow(student));
}

/**
 * Normalize student name for fuzzy matching
 */
function normalizeStudentName(firstName: string, lastName: string): string {
  const cleanFirst = firstName.trim().toLowerCase();
  const cleanLast = lastName === '-' ? '' : lastName.trim().toLowerCase();
  return cleanLast ? `${cleanFirst} ${cleanLast}` : cleanFirst;
}

/**
 * Merge two student response objects, preferring non-empty data
 */
function mergeStudentResponses(existing: RawStudentResponse, incoming: RawStudentResponse): RawStudentResponse {
  return {
    "First Name": existing["First Name"] || incoming["First Name"],
    "Last Name": existing["Last Name"] !== '-' ? existing["Last Name"] : incoming["Last Name"],
    "Best Response Correct - Yes or No": existing["Best Response Correct - Yes or No"] !== '-' 
      ? existing["Best Response Correct - Yes or No"] 
      : incoming["Best Response Correct - Yes or No"],
    "Best Response Explanation Score (0-4)": existing["Best Response Explanation Score (0-4)"] !== '-'
      ? existing["Best Response Explanation Score (0-4)"]
      : incoming["Best Response Explanation Score (0-4)"],
    "Best Response Date": existing["Best Response Date"] !== '-'
      ? existing["Best Response Date"]
      : incoming["Best Response Date"],
    "1st Response Correct - Yes or No": existing["1st Response Correct - Yes or No"] !== '-'
      ? existing["1st Response Correct - Yes or No"]
      : incoming["1st Response Correct - Yes or No"],
    "1st Response Explanation Score (0-4)": existing["1st Response Explanation Score (0-4)"] !== '-'
      ? existing["1st Response Explanation Score (0-4)"]
      : incoming["1st Response Explanation Score (0-4)"],
    "1st Response Date": existing["1st Response Date"] !== '-'
      ? existing["1st Response Date"]
      : incoming["1st Response Date"],
    "2nd Response Correct - Yes or No": existing["2nd Response Correct - Yes or No"] !== '-'
      ? existing["2nd Response Correct - Yes or No"]
      : incoming["2nd Response Correct - Yes or No"],
    "2nd Response Explanation Score (0-4)": existing["2nd Response Explanation Score (0-4)"] !== '-'
      ? existing["2nd Response Explanation Score (0-4)"]
      : incoming["2nd Response Explanation Score (0-4)"],
    "2nd Response Date": existing["2nd Response Date"] !== '-'
      ? existing["2nd Response Date"]
      : incoming["2nd Response Date"],
  };
}

/**
 * Transform raw student response to display row format with fuzzy match information
 */
function transformToStudentRowWithMatch(
  student: RawStudentResponse, 
  matchedStudent: Student | null,
  confidence: 'high' | 'medium' | 'low' | 'none'
): StudentRow {
  const displayName = student["Last Name"] !== '-' 
    ? `${student["First Name"]} ${student["Last Name"]}`
    : student["First Name"];

  return {
    name: displayName,
    matchedStudent,
    matchConfidence: confidence,
    bestResponse: createAttemptData(
      student["Best Response Correct - Yes or No"],
      student["Best Response Explanation Score (0-4)"],
      student["Best Response Date"]
    ),
    firstAttempt: createAttemptData(
      student["1st Response Correct - Yes or No"],
      student["1st Response Explanation Score (0-4)"],
      student["1st Response Date"]
    ),
    secondAttempt: createAttemptData(
      student["2nd Response Correct - Yes or No"],
      student["2nd Response Explanation Score (0-4)"],
      student["2nd Response Date"]
    ),
  };
}

/**
 * Transform raw student response to display row format (original function for backward compatibility)
 */
function transformToStudentRow(student: RawStudentResponse): StudentRow {
  const displayName = student["Last Name"] !== '-' 
    ? `${student["First Name"]} ${student["Last Name"]}`
    : student["First Name"];

  return {
    name: displayName,
    matchedStudent: null,
    matchConfidence: 'none',
    bestResponse: createAttemptData(
      student["Best Response Correct - Yes or No"],
      student["Best Response Explanation Score (0-4)"],
      student["Best Response Date"]
    ),
    firstAttempt: createAttemptData(
      student["1st Response Correct - Yes or No"],
      student["1st Response Explanation Score (0-4)"],
      student["1st Response Date"]
    ),
    secondAttempt: createAttemptData(
      student["2nd Response Correct - Yes or No"],
      student["2nd Response Explanation Score (0-4)"],
      student["2nd Response Date"]
    ),
  };
}

/**
 * Create attempt data object with empty state detection
 */
function createAttemptData(correct?: string, score?: string | number, date?: string): AttemptData {
  const isEmpty = !correct || correct === '-' || !date || date === '-';
  
  return {
    correct: isEmpty ? '-' : correct,
    score: isEmpty ? '-' : score || '-',
    date: isEmpty ? '-' : formatDate(date),
    isEmpty
  };
}

/**
 * Format ISO date string to readable format
 */
function formatDate(dateString?: string): string {
  if (!dateString || dateString === '-') return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString; // Return original if parsing fails
  }
} 