import { 
  DailyClassEventInput,
  ZearnCompletionInput,
  AssessmentCompletionInput,
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
    firstName: data.firstName,
    lastName: data.lastName,
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
      studentName: `${data.firstName} ${data.lastName}`,
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
export function createSnorklCompletions(data: ValidatedRowData): AssessmentCompletionInput[] {
  console.log(`🎯 [DEBUG] Creating Snorkl completions for ${data.firstName} ${data.lastName}`);
  console.log(`🔍 [DEBUG] Mastery data input:`, {
    mastery1: data.mastery1,
    mastery2: data.mastery2,
    mastery3: data.mastery3
  });
  
  const completions: AssessmentCompletionInput[] = [];
  
  // Process each mastery detail
  [data.mastery1, data.mastery2, data.mastery3].forEach((mastery, index) => {
    const masteryNum = index + 1;
    console.log(`🔍 [DEBUG] Processing mastery ${masteryNum} for ${data.firstName} ${data.lastName}:`, mastery);
    
    if (!mastery) {
      console.log(`⏭️ [DEBUG] Mastery ${masteryNum} is null/undefined, skipping`);
      return;
    }
    
    try {
      // Validate lesson code
      LessonCodeZod.parse(mastery.lesson);
      console.log(`✅ [DEBUG] Lesson code '${mastery.lesson}' is valid`);
      
      const completion: AssessmentCompletionInput = {
        studentIDref: data.studentId,
        studentName: `${data.firstName} ${data.lastName}`,
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
      };
      
      console.log(`🎯 [DEBUG] Created Snorkl completion ${masteryNum}:`, {
        student: completion.studentName,
        lesson: completion.lessonCode,
        attempts: completion.numberOfAttempts,
        completed: completion.completed,
        score: completion.snorklScore
      });
      
      completions.push(completion);
      
    } catch (error) {
      console.error(`❌ [DEBUG] Failed to create Snorkl completion ${masteryNum} for ${data.firstName} ${data.lastName}:`, error);
      console.error(`❌ [DEBUG] Invalid lesson code: '${mastery.lesson}'`);
    }
  });
  
  console.log(`📊 [DEBUG] Total Snorkl completions created for ${data.firstName} ${data.lastName}: ${completions.length}`);
  return completions;
} 