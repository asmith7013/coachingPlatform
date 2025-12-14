import { validateStrict } from '@data-processing/validation/zod-validation';
import {
  TeacherZod,
  SectionZod,
  AttendanceStatusZod
} from '@zod-schema/scm/core';
import { SpreadsheetHeaders, RawSpreadsheetRow, ValidatedRowData, MasteryDetail } from '../types/spreadsheet-types';
import { Sections313Type } from '@schema/enum/313';

/**
 * Column mapping using existing normalization patterns
 */
export class SpreadsheetColumnMapper {
  private columnIndexes: Record<string, number> = {};
  
  constructor(headers: SpreadsheetHeaders) {
    this.mapColumns(headers);
  }
  
  private mapColumns(headers: SpreadsheetHeaders): void {
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    
    const columnMappings = {
      'date': ['date'],
      'studentId': ['student id', 'id', 'student number'],
    //   'studentName': ['name', 'student name', 'full name'],
      'studentFirstName': ['first name'],
      'studentLastName': ['last name'],
      'teacher': ['teacher'],
      'section': ['section'],
      'classLength': ['class length (min)', 'class length', 'duration'],
      'attendance': ['attendance'],
      'instruction': ['instruction received (min)', 'instruction received'],
      'zearnCompletions': ['lessons completed ☑️', 'lessons completed'],
      'masteryAttempts': ['mastery checks attempted ✏️', 'mastery attempted'],
      'intervention': ['teacher intervention (min)', 'intervention'],
      'interventionNotes': ['intervention notes', 'notes'],
      'behaviorNotes': ['behavior notes', 'behavior'],
      
      // Mastery check columns
      'mastery1Lesson': ['#1'],
      'mastery1Attempts': ['# of attempts'],
      'mastery1Mastered': ['mastered ✅'],
      'mastery2Lesson': ['#2'],
      'mastery2Attempts': ['# of attempts.2'],
      'mastery2Mastered': ['mastered ✅.2'],
      'mastery3Lesson': ['#3'],
      'mastery3Attempts': ['# of attempts.3'],
      'mastery3Mastered': ['mastered ✅.3']
    };
    
    for (const [key, aliases] of Object.entries(columnMappings)) {
      const index = this.findColumnIndex(normalizedHeaders, aliases);
      if (index !== -1) {
        this.columnIndexes[key] = index;
      }
    }
  }
  
  private findColumnIndex(headers: string[], aliases: string[]): number {
    for (const alias of aliases) {
      const index = headers.indexOf(alias.toLowerCase());
      if (index !== -1) return index;
    }
    return -1;
  }
  
  public getRequiredColumns(): string[] {
    // Remove 'classLength' since it's now optional in the schema
    return ['date', 'studentId', 'studentFirstName', 'studentLastName', 'teacher', 'section', 'attendance'];
  }
  
  public validateHeaders(): { success: boolean; missingColumns: string[] } {
    const required = this.getRequiredColumns();
    const missing = required.filter(col => this.columnIndexes[col] === undefined);
    return { success: missing.length === 0, missingColumns: missing };
  }
  
  public extractValue(row: RawSpreadsheetRow, headers: SpreadsheetHeaders, column: string): string {
    const index = this.columnIndexes[column];
    return index !== undefined ? row[headers[index]] || '' : '';
  }
}

/**
 * Row validator using existing validation patterns
 */
export class SpreadsheetRowValidator {
  constructor(private mapper: SpreadsheetColumnMapper) {}
  
  public validateRow(row: RawSpreadsheetRow, headers: SpreadsheetHeaders): ValidatedRowData | null {
    try {
      const getValue = (col: string) => this.mapper.extractValue(row, headers, col);
      
      // Validate required fields using existing validation
      const teacher = validateStrict(TeacherZod, getValue('teacher'));
      const section = validateStrict(SectionZod, getValue('section'));
      const attendance = validateStrict(AttendanceStatusZod, getValue('attendance'));
      
      const studentId = parseInt(getValue('studentId'));
      if (isNaN(studentId)) throw new Error(`Invalid Student ID: ${getValue('studentId')}`);
      
      // Handle optional classLengthMin - schema now allows undefined
      const classLengthStr = getValue('classLength');
      let classLengthMin: number | undefined;

      if (classLengthStr && classLengthStr.trim()) {
        classLengthMin = parseInt(classLengthStr);
        if (isNaN(classLengthMin) || classLengthMin <= 0) {
          throw new Error(`Invalid class length: ${classLengthStr}`);
        }
      } else {
        classLengthMin = undefined; // Allow empty/missing values per schema
      }
      
      // Get split name fields
      const firstName = getValue('studentFirstName');
      const lastName = getValue('studentLastName');
      
      // Validate that both name fields have values
      if (!firstName.trim()) throw new Error('First Name is required');
      if (!lastName.trim()) throw new Error('Last Name is required');
      
      return {
        date: getValue('date'),
        studentId,
        // Use split name fields to match DailyClassEvent schema
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        teacher,
        section: section as Sections313Type,
        classLengthMin: classLengthMin || 60,
        attendance,
        instructionReceivedMin: parseInt(getValue('instruction')) || undefined,
        zearnCompletions: getValue('zearnCompletions'),
        masteryAttempts: getValue('masteryAttempts'),
        mastery1: this.parseMasteryDetail(row, headers, 1),
        mastery2: this.parseMasteryDetail(row, headers, 2),
        mastery3: this.parseMasteryDetail(row, headers, 3),
        teacherInterventionMin: parseInt(getValue('intervention')) || 0,
        interventionNotes: getValue('interventionNotes') || undefined,
        behaviorNotes: getValue('behaviorNotes') || undefined,
      };
    } catch (error) {
      console.warn('Row validation failed:', error);
      return null;
    }
  }
  
  private parseMasteryDetail(row: RawSpreadsheetRow, headers: SpreadsheetHeaders, num: number): MasteryDetail | null {
    try {
      const getValue = (col: string) => this.mapper.extractValue(row, headers, col);
      
      // Get lesson code
      const lessonKey = `mastery${num}Lesson`;
      const lesson = getValue(lessonKey);
      if (!lesson?.trim()) return null;
      
      // Get attempts
      const attemptsKey = `mastery${num}Attempts`;
      const attemptsStr = getValue(attemptsKey);
      const attempts = parseInt(attemptsStr) || 1;
      
      // Get mastered status
      const masteredKey = `mastery${num}Mastered`;
      const masteredStr = getValue(masteredKey);
      const mastered = masteredStr === 'TRUE' || masteredStr === 'true' || masteredStr === '✅';
      
      return {
        lesson: lesson.trim(),
        attempts,
        mastered
      };
    } catch (error) {
      console.warn(`Failed to parse mastery detail ${num}:`, error);
      return null;
    }
  }
}




