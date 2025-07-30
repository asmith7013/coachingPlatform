import { useMemo } from 'react';
import { StudentData } from '@zod-schema/313/student-data';
import { StudentZearnProgress } from '@zod-schema/313/student-data';

interface DailyCompletion {
  date: string; // YYYY-MM-DD
  lessons: string[]; // Array of lesson codes like ["U2 L01", "U2 L02"]
  count: number;
}

/**
 * Transform student data for calendar display
 * Shows lesson completions by date within summer session timeframe
 */
export function useStudentCalendarData(studentData: StudentData) {
  const dailyCompletions = useMemo((): DailyCompletion[] => {
    // Group Zearn progress by completion date
    const completionsByDate = new Map<string, string[]>();
    
    studentData.zearnProgress.forEach(progress => {
      // Extract date from completedDate if available
      const completedDate = extractDateFromProgress(progress);
      if (completedDate && isInSummerSession(completedDate)) {
        const formattedLesson = formatLessonCode(progress.lesson);
        const existing = completionsByDate.get(completedDate) || [];
        existing.push(formattedLesson);
        completionsByDate.set(completedDate, existing);
      }
    });
    
    // Convert Map to array format
    return Array.from(completionsByDate.entries()).map(([date, lessons]) => ({
      date,
      lessons: Array.from(new Set(lessons)), // Remove duplicates - fix for Set spread
      count: lessons.length
    })).sort((a, b) => a.date.localeCompare(b.date));
    
  }, [studentData.zearnProgress]);
  
  return { dailyCompletions };
}

/**
 * Extract date from Zearn progress data
 * This is a placeholder - will need to match actual data structure
 */
function extractDateFromProgress(progress: StudentZearnProgress): string | null {
  // If there's a completedDate field, use it
  if (progress.completedDate) {
    return formatDateToYYYYMMDD(progress.completedDate);
  }
  
  // For now, return null - will need to match actual data structure
  return null;
}

/**
 * Check if date falls within summer session
 */
function isInSummerSession(date: string): boolean {
  return date >= "2025-06-30" && date <= "2025-08-07";
}

/**
 * Format lesson code for display
 * "G6 U2 L01" -> "U2 L01"
 */
function formatLessonCode(lesson: string): string {
  return lesson.replace(/^G\d+ /, '');
}

/**
 * Format various date formats to YYYY-MM-DD
 */
function formatDateToYYYYMMDD(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString().split('T')[0];
}

export type { DailyCompletion }; 