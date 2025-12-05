import { useMemo } from 'react';
import { StudentData } from '@/lib/schema/zod-schema/313/student/student-data';
import { getLessonsForGrade } from '@/lib/schema/enum/scope-sequence';
import { hasSnorklLink } from '@/lib/schema/enum/snorkl-links';
import { getSectionType } from '@/lib/schema/zod-schema/313/student/student-data';

export interface CombinedLessonStatus {
  lesson: string; // "G6 U2 L01"
  lessonShort: string; // "U2 L01"
  hasSnorkl: boolean;
  hasZearn: boolean;
  completionState: 'none' | 'zearn-only' | 'snorkl-only' | 'both';
  isClickable: boolean; // For Snorkl links
}

export interface CombinedUnitProgress {
  unitName: string; // "Unit 2"
  lessons: CombinedLessonStatus[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

/**
 * Combine Snorkl and Zearn lesson data for unified progress tracking
 */
export function useCombinedLessonData(studentData: StudentData) {
  const combinedProgress = useMemo((): CombinedUnitProgress[] => {
    const snorklProgress = studentData.scopeSequenceProgress;
    
    if (!snorklProgress) return [];
    
    const allLessons = getLessonsForGrade(snorklProgress.grade);
    const snorklCompleted = new Set(snorklProgress.completedLessons);
    
    // Create Zearn completed set from individual progress records
    const zearnCompleted = new Set<string>();
    studentData.zearnProgress.forEach(progress => {
      if (progress.mastered) {
        zearnCompleted.add(progress.lesson);
      }
    });
    
    // Group lessons by unit
    const unitGroups = new Map<string, CombinedLessonStatus[]>();
    
    allLessons.forEach(lesson => {
      // Extract unit from lesson (e.g., "G6 U2 L01" -> "Unit 2")
      const unitMatch = lesson.match(/U(\d+)/);
      const unitKey = unitMatch ? `Unit ${unitMatch[1]}` : 'Other';
      
      if (!unitGroups.has(unitKey)) {
        unitGroups.set(unitKey, []);
      }
      
      const hasSnorkl = snorklCompleted.has(lesson as never);
      const hasZearn = zearnCompleted.has(lesson);
      
      let completionState: CombinedLessonStatus['completionState'] = 'none';
      if (hasSnorkl && hasZearn) completionState = 'both';
      else if (hasSnorkl) completionState = 'snorkl-only';  
      else if (hasZearn) completionState = 'zearn-only';
      
      const sectionType = getSectionType(studentData.section);
      const lessonStatus: CombinedLessonStatus = {
        lesson,
        lessonShort: lesson.replace(/^G\d+ /, ''),
        hasSnorkl,
        hasZearn,
        completionState,
        isClickable: hasSnorklLink(lesson, snorklProgress.grade, sectionType)
      };
      
      unitGroups.get(unitKey)!.push(lessonStatus);
    });
    
    // Convert to array format with progress stats
    return Array.from(unitGroups.entries()).map(([unitName, lessons]) => {
      // FIX: Count lessons with Snorkl completion (both "snorkl-only" and "both")
      const completedCount = lessons.filter(l => 
        l.completionState === 'snorkl-only' || l.completionState === 'both'
      ).length;
      const totalCount = lessons.length;
      const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      return {
        unitName,
        lessons,
        completedCount,
        totalCount,
        progressPercentage
      };
    });
    
  }, [studentData.scopeSequenceProgress, studentData.zearnProgress, studentData.section]);
  
  return { combinedProgress };
} 