import { useMemo } from 'react';
import { StudentData, StudentZearnProgress } from '@/lib/schema/zod-schema/scm/student/student-data';

interface DailyCompletion {
  date: string; // YYYY-MM-DD
  lessons: string[]; // Array of lesson codes like ["U2 L01", "U2 L02"]
  count: number;
  isAbsent?: boolean; // Add attendance status
}

/**
 * Transform student data for calendar display
 * Shows lesson completions by date within summer session timeframe
 * Includes attendance status for visual indicators
 */
export function useStudentCalendarData(studentData: StudentData) {
  const dailyCompletions = useMemo((): DailyCompletion[] => {
    // Create attendance lookup map
    const attendanceMap = new Map<string, boolean>();
    studentData.attendance.forEach(attendance => {
      const formattedDate = formatDateToYYYYMMDD(attendance.date);
      if (isInSummerSession(formattedDate)) {
        attendanceMap.set(formattedDate, attendance.status === '❌');
      }
    });
    
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
    
    // Get all summer session dates that have attendance or completion data
    const allRelevantDates = new Set([
      ...Array.from(attendanceMap.keys()),
      ...Array.from(completionsByDate.keys())
    ]);
    
    // Convert to array format with attendance info
    return Array.from(allRelevantDates).map(date => ({
      date,
      lessons: Array.from(new Set(completionsByDate.get(date) || [])), // Remove duplicates
      count: (completionsByDate.get(date) || []).length,
      isAbsent: attendanceMap.get(date) || false
    })).sort((a, b) => a.date.localeCompare(b.date));
    
  }, [studentData.zearnProgress, studentData.attendance]); // Add attendance dependency
  
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