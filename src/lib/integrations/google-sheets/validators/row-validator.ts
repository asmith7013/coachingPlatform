import { z } from 'zod';
import { 
  TeacherZod, 
  AttendanceStatusZod, 
  AttendanceStatusType 
} from '@zod-schema/313/core';
import { 
  RawSpreadsheetRow, 
  SpreadsheetHeaders, 
  ValidatedRowData, 
  MasteryDetail,
  ColumnAliases,
  ColumnMappingResult
} from '../types/spreadsheet-types';
import { SummerSectionsType } from '@/lib/schema/enum/313';

// =====================================
// COLUMN MAPPING UTILITIES
// =====================================

/**
 * Simple column name normalization
 */
function normalizeColumnName(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Known aliases for columns that vary in practice
 */
const COLUMN_ALIASES: ColumnAliases = {
  'lessons completed ☑️': ['lessons completed', 'completed lessons', 'zearn completed'],
  'mastery checks attempted ✏️': ['mastery attempted', 'checks attempted', 'mastery checks'],
  'student id': ['id', 'student number', 'studentid'],
  'student name': ['name', 'full name', 'student'],
  '# of attempts': ['attempts', 'number of attempts', 'tries'],
  'class length (min)': ['class length', 'class duration', 'duration'],
  'instruction received (min)': ['instruction received', 'instruction time', 'instruction'],
  'teacher intervention (min)': ['teacher intervention', 'intervention time', 'intervention'],
  'intervention notes': ['intervention note', 'notes', 'teacher notes'],
  'behavior notes': ['behavior note', 'behavior', 'student behavior']
};

/**
 * Find column index with fallback to aliases
 */
function findColumnIndex(headers: string[], targetColumn: string): number {
  const normalizedHeaders = headers.map(normalizeColumnName);
  const normalizedTarget = normalizeColumnName(targetColumn);
  
  // Try exact match first
  let index = normalizedHeaders.indexOf(normalizedTarget);
  if (index !== -1) return index;
  
  // Try known aliases
  const aliases = COLUMN_ALIASES[normalizedTarget] || [];
  for (const alias of aliases) {
    index = normalizedHeaders.indexOf(alias);
    if (index !== -1) return index;
  }
  
  throw new Error(`Required column '${targetColumn}' not found. Available: ${headers.join(', ')}`);
}

/**
 * Find optional column (returns -1 if not found)
 */
function findOptionalColumn(headers: string[], targetColumn: string): number {
  try {
    return findColumnIndex(headers, targetColumn);
  } catch {
    return -1; // Column not found, but that's OK for optional columns
  }
}

/**
 * Map all required and optional columns
 */
export function mapColumns(headers: SpreadsheetHeaders): ColumnMappingResult {
  const columnIndexes: Record<string, number> = {};
  const missingColumns: string[] = [];

  // Required columns
  const requiredColumns = [
    'Date',
    'Student ID', 
    'Name',
    'Teacher',
    'Section',
    'Class length (min)',
    'Attendance'
  ];

  // Optional columns
  const optionalColumns = [
    'Instruction Received (Min)',
    'Lessons Completed ☑️',
    'Mastery Checks Attempted ✏️',
    '#1',
    '# of Attempts',
    'Mastered ✅',
    '#2',
    '# of Attempts.2',
    'Mastered ✅.2',
    '#3',
    '# of Attempts.3',
    'Mastered ✅.3',
    'Teacher Intervention (min)',
    'Intervention Notes',
    'Behavior Notes'
  ];

  // Map required columns
  for (const column of requiredColumns) {
    try {
      columnIndexes[column] = findColumnIndex(headers, column);
    } catch {
      missingColumns.push(column);
    }
  }

  // Map optional columns
  for (const column of optionalColumns) {
    const index = findOptionalColumn(headers, column);
    if (index !== -1) {
      columnIndexes[column] = index;
    }
  }

  return {
    success: missingColumns.length === 0,
    columnIndexes,
    missingColumns
  };
}

// =====================================
// ROW VALIDATION
// =====================================

/**
 * Parse mastery detail from row values
 */
export function parseMasteryDetail(
  rowValues: RawSpreadsheetRow,
  columnIndexes: Record<string, number>,
  number: number
): MasteryDetail | null {
  try {
    const lessonKey = number === 1 ? '#1' : `#${number}`;
    const attemptsKey = number === 1 ? '# of Attempts' : `# of Attempts.${number}`;
    const masteredKey = number === 1 ? 'Mastered ✅' : `Mastered ✅.${number}`;
    
    const lessonCol = columnIndexes[lessonKey];
    if (lessonCol === undefined) return null;
    
    const lesson = rowValues[lessonCol];
    if (!lesson?.trim()) return null;
    
    const attemptsCol = columnIndexes[attemptsKey];
    const masteredCol = columnIndexes[masteredKey];
    
    return {
      lesson: lesson.trim(),
      attempts: attemptsCol !== undefined ? parseInt(rowValues[attemptsCol]) || 1 : 1,
      mastered: masteredCol !== undefined ? rowValues[masteredCol] === 'TRUE' : false
    };
  } catch {
    return null;
  }
}

/**
 * Validate and parse a single row
 */
export function validateAndParseRow(
  rawRow: RawSpreadsheetRow,
  headers: SpreadsheetHeaders
): ValidatedRowData {
  // First map columns
  const columnMapping = mapColumns(headers);
  if (!columnMapping.success) {
    throw new Error(`Missing required columns: ${columnMapping.missingColumns.join(', ')}`);
  }

  const { columnIndexes } = columnMapping;
  
  // Convert headers array to row values array for indexed access
  const rowValues = headers.map(header => rawRow[header] || '');
  
  // Parse and validate required fields
  const studentIdStr = rowValues[columnIndexes['Student ID']];
  const studentId = parseInt(studentIdStr);
  if (isNaN(studentId)) {
    throw new Error(`Invalid Student ID: ${studentIdStr}`);
  }

  const teacherStr = rowValues[columnIndexes['Teacher']];
  const sectionStr = rowValues[columnIndexes['Section']];
  const attendanceStr = rowValues[columnIndexes['Attendance']];
  const classLengthStr = rowValues[columnIndexes['Class length (min)']];

  // Validate enums using existing Zod schemas
  let teacher: string;
  let section: string;
  let attendance: AttendanceStatusType;
  
  try {
    teacher = TeacherZod.parse(teacherStr);
    section = sectionStr as SummerSectionsType;
    attendance = AttendanceStatusZod.parse(attendanceStr);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }

  const classLengthMin = parseInt(classLengthStr) || 0;
  if (classLengthMin <= 0) {
    throw new Error(`Invalid class length: ${classLengthStr}`);
  }

  // Parse optional fields
  const instructionCol = columnIndexes['Instruction Received (Min)'];
  const instructionReceivedMin = instructionCol !== undefined ? 
    parseInt(rowValues[instructionCol]) || undefined : undefined;

  const interventionCol = columnIndexes['Teacher Intervention (min)'];
  const teacherInterventionMin = interventionCol !== undefined ? 
    parseInt(rowValues[interventionCol]) || 0 : 0;

  const zearnCol = columnIndexes['Lessons Completed ☑️'];
  const zearnCompletions = zearnCol !== undefined ? rowValues[zearnCol] : '';

  const masteryCol = columnIndexes['Mastery Checks Attempted ✏️'];
  const masteryAttempts = masteryCol !== undefined ? rowValues[masteryCol] : '';

  const interventionNotesCol = columnIndexes['Intervention Notes'];
  const interventionNotes = interventionNotesCol !== undefined ? 
    rowValues[interventionNotesCol] || undefined : undefined;

  const behaviorNotesCol = columnIndexes['Behavior Notes'];
  const behaviorNotes = behaviorNotesCol !== undefined ? 
    rowValues[behaviorNotesCol] || undefined : undefined;

  // Parse mastery details
  const mastery1 = parseMasteryDetail(rawRow, columnIndexes, 1);
  const mastery2 = parseMasteryDetail(rawRow, columnIndexes, 2);
  const mastery3 = parseMasteryDetail(rawRow, columnIndexes, 3);

  return {
    date: rowValues[columnIndexes['Date']],
    studentId,
    firstName: rowValues[columnIndexes['First Name']],
    lastName: rowValues[columnIndexes['Last Name']],
    teacher,
    section,
    classLengthMin,
    attendance,
    instructionReceivedMin,
    zearnCompletions,
    masteryAttempts,
    mastery1,
    mastery2,
    mastery3,
    teacherInterventionMin,
    interventionNotes,
    behaviorNotes,
  };
} 