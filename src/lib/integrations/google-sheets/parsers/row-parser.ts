import { 
  DailyClassEventInput,
  ZearnCompletionInput,
  SnorklCompletionInput,
  LessonCodeZod,
  LessonCode
} from '@zod-schema/313/core';
import { ValidatedRowData } from '../types/spreadsheet-types';

// =====================================
// EVENT CREATION FUNCTIONS
// =====================================

/**
 * Create daily class event from validated row data
 */
export function createDailyClassEvent(data: ValidatedRowData): DailyClassEventInput {
  return {
    date: data.date,
    studentIDref: data.studentId,
    studentName: data.studentName,
    teacher: data.teacher,
    section: data.section,
    classLengthMin: data.classLengthMin,
    attendance: data.attendance,
    instructionReceivedMin: data.instructionReceivedMin,
    teacherInterventionMin: data.teacherInterventionMin,
    interventionNotes: data.interventionNotes,
    behaviorNotes: data.behaviorNotes,
    ownerIds: [], // Default empty array as per schema
  };
}

/**
 * Create Zearn completion records from validated row data
 */
export function createZearnCompletions(data: ValidatedRowData): ZearnCompletionInput[] {
  if (!data.zearnCompletions?.trim()) return [];
  
  const lessons = data.zearnCompletions
    .split(',')
    .map(lesson => lesson.trim())
    .filter(lesson => lesson);
  
  if (lessons.length === 0) return [];
  
  // Calculate time per lesson as specified
  const timePerLesson = data.instructionReceivedMin && lessons.length > 0
    ? Math.floor(data.instructionReceivedMin / lessons.length)
    : undefined;
  
  return lessons.map(lessonCode => {
    // Validate lesson code using existing schema
    LessonCodeZod.parse(lessonCode);
    
    return {
      studentIDref: data.studentId,
      studentName: data.studentName,
             lessonCode: lessonCode as LessonCode, // Type assertion after validation
      dateOfCompletion: data.date,
      teacher: data.teacher,
      section: data.section,
      attempted: true,
      completed: true, // Listed in completed column
      completionType: "zearn" as const,
      timeForCompletion: timePerLesson,
      ownerIds: [],
    };
  });
}

/**
 * Create Snorkl/Mastery completion records from validated row data
 */
export function createSnorklCompletions(data: ValidatedRowData): SnorklCompletionInput[] {
  const completions: SnorklCompletionInput[] = [];
  
  // Process each mastery detail
  [data.mastery1, data.mastery2, data.mastery3].forEach(mastery => {
    if (!mastery) return;
    
    // Validate lesson code
    LessonCodeZod.parse(mastery.lesson);
    
    completions.push({
      studentIDref: data.studentId,
      studentName: data.studentName,
             lessonCode: mastery.lesson as LessonCode, // Type assertion after validation
      dateOfCompletion: data.date,
      teacher: data.teacher,
      section: data.section,
      attempted: true,
      completed: mastery.mastered,
      completionType: "snorkl" as const,
      numberOfAttempts: mastery.attempts,
      snorklScore: mastery.mastered ? 4 : undefined, // Max score if mastered
      ownerIds: [],
    });
  });
  
  return completions;
} 