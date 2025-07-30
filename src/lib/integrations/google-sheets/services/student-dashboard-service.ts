import { ScopeSequenceProgress, StudentData, StudentDataZodSchema, StudentZearnProgress } from '@zod-schema/313/student-data';
import { fetchSheetData } from '../client';
import { handleServerError } from '@/lib/error/handlers/server';
import { StudentModel } from '@mongoose-schema/313/student.model';
import { 
  calculateProgress, 
  getGradeFromLesson, 
  AllLessonsZod,
  type GradeLevel,
  type AllLessons
} from '@/lib/schema/enum/scope-sequence';

/**
 * Google Sheets service for student dashboard data
 * Follows established patterns from existing services
 */
export class StudentDashboardService {
  
  // These should match your actual Google Sheets configuration
  private static readonly STUDENT_DATA_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_STUDENT_DATA_ID || '';
  private static readonly STUDENT_DATA_RANGE = "'Combined Data'!A:O";

  // Column mapping based on your table structure
  private static readonly COLUMN_MAPPING = {
    DATE: 0,           // Col A
    SECTION: 1,        // Col B  
    TEACHER: 2,        // Col C
    STUDENT_ID: 3,     // Col D
    FIRST_NAME: 4,     // Col E
    LAST_NAME: 5,      // Col F
    CLASS_LENGTH: 6,   // Col G
    ATTENDANCE: 7,     // Col H
    CLASS_MISSED: 8,   // Col I
    LESSONS_MASTERED: 9, // Col J
    INTERVENTION_NOTES: 10, // Col K
    // Skip L (11)
    LESSON_COUNT: 12,  // Col M (# ✅)
    ACTIVE: 13,        // Col N
    ZEARN_LESSONS: 14  // Col O
  };

  /**
   * Fetch student dashboard data from Google Sheets
   */
  static async fetchStudentDataFromSheets(studentId: string): Promise<{ success: boolean; data?: StudentData; error?: string }> {
    try {
      console.log(`🔍 Fetching student data for ID: ${studentId}`);
      
    // First, verify student exists in database
    const student = await StudentModel.findOne({ 
        studentID: parseInt(studentId),
        active: true 
    });
      
      if (!student) {
        return { 
          success: false, 
          error: "Student not found" 
        };
      }

      // Fetch data from Google Sheets
      const sheetResult = await fetchSheetData(
        this.STUDENT_DATA_SPREADSHEET_ID, 
        this.STUDENT_DATA_RANGE
      );
      
      if (!sheetResult.success) {
        return {
          success: false,
          error: `Failed to fetch sheet data: ${sheetResult.error}`
        };
      }

      // Parse sheet data to find student record
      const studentData = this.parseStudentDataFromSheet(
        sheetResult.data, 
        student.studentID.toString(),
        student.firstName,
        student.lastName,
        student.section
      );

      if (!studentData) {
        return {
          success: false,
          error: "Student data not found in sheets"
        };
      }

      // Validate with Zod schema
      const validated = StudentDataZodSchema.parse(studentData);
      
      return {
        success: true,
        data: validated
      };

    } catch (error) {
      console.error('Error fetching student data:', error);
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  }

  /**
   * Validate student email against database with fuzzy matching
   */
  static async validateStudentEmail(email: string, studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find student by ID
      const student = await StudentModel.findOne({ 
        $or: [
          { _id: studentId },
          { studentID: parseInt(studentId) }
        ],
        active: true 
      });
      
      if (!student || !student.email) {
        return { 
          success: false, 
          error: "Student record not found or no email on file" 
        };
      }

      // Fuzzy email matching (similar to name matching patterns)
      const normalizedInputEmail = email.toLowerCase().trim();
      const normalizedStudentEmail = student.email.toLowerCase().trim();
      
      // Exact match
      if (normalizedInputEmail === normalizedStudentEmail) {
        return { success: true };
      }
      
      // Fuzzy match - allow minor typos
      const similarity = this.calculateEmailSimilarity(normalizedInputEmail, normalizedStudentEmail);
      
      if (similarity > 0.8) { // 80% similarity threshold
        return { success: true };
      }

      return { 
        success: false, 
        error: "Email does not match student record" 
      };

    } catch (error) {
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  }

  /**
   * Parse student data from Google Sheets rows
   */
  private static parseStudentDataFromSheet(
    rows: string[][],
    studentId: string,
    firstName: string,
    lastName: string,
    section: string
  ): StudentData | null {
    if (rows.length === 0) return null;

    try {
      // Skip header row and filter for this specific student
      const studentRows = rows.slice(1).filter(row => 
        row[this.COLUMN_MAPPING.STUDENT_ID] === studentId
      );

      if (studentRows.length === 0) {
        console.log(`No data found for student ID: ${studentId}`);
        return null;
      }

      console.log(`Found ${studentRows.length} records for student ${studentId}`);

      // Parse attendance data from all student rows
      const attendance = studentRows.map(row => ({
        date: this.formatDate(row[this.COLUMN_MAPPING.DATE] || ''),
        status: this.normalizeAttendanceStatus(row[this.COLUMN_MAPPING.ATTENDANCE] || ''),
        classLength: this.parseNumber(row[this.COLUMN_MAPPING.CLASS_LENGTH]),
        classMissed: this.parseNumber(row[this.COLUMN_MAPPING.CLASS_MISSED])
      })).filter(record => record.date && record.status);

          // Parse Zearn progress from Zearn lessons column (Column O)
    const zearnProgress = this.parseZearnProgress(studentRows);

    // Parse Snorkl progress from Lessons Mastered column (Column J) 
    const snorklProgress = this.parseSnorklProgress(studentRows);

    // Determine student's grade level from completed lessons
    const studentGrade = this.determineStudentGrade(zearnProgress, section);

    // FIX: Calculate scope and sequence progress using SNORKL data, not Zearn data
    const progressStats = calculateProgress(
      snorklProgress, // Use Snorkl lessons instead of Zearn
      studentGrade
    );
      
      const scopeSequenceProgress = {
        grade: studentGrade,
        ...progressStats
      } as ScopeSequenceProgress; // Type assertion to handle lesson enum validation

      // Calculate weekly Zearn minutes (placeholder - would need actual time data)
      const weeklyZearnMinutes = this.calculateWeeklyMinutes(studentRows);

      // Mock pre-assessment data (would need separate sheet/data source)
      const preAssessment = {
        question1: 2,
        question2: 4, 
        question3: 4,
        totalCorrect: "2/3"
      };

      const studentData: StudentData = {
        studentId,
        firstName,
        lastName,
        section,
        grade: studentGrade, // Add grade
        attendance,
        zearnProgress,
        scopeSequenceProgress, // Add progress tracking
        preAssessment,
        weeklyZearnMinutes
      };

      console.log(`Parsed data for ${firstName} ${lastName}:`, {
        grade: studentGrade,
        attendanceRecords: attendance.length,
        zearnLessons: zearnProgress.length,
        snorklLessons: snorklProgress.length,
        progressPercentage: scopeSequenceProgress.percentage,
        weeklyMinutes: Object.keys(weeklyZearnMinutes).length
      });

      return studentData;

    } catch (error) {
      console.error('Error parsing student data from sheet:', error);
      return null;
    }
  }

  /**
   * Determine student's grade level from their lesson completions or section
   */
  private static determineStudentGrade(zearnProgress: StudentZearnProgress[], section: string): GradeLevel {
    // Try to determine from completed lessons first
    for (const progress of zearnProgress) {
      const grade = getGradeFromLesson(progress.lesson);
      if (grade) return grade;
    }
    
    // Fallback to section-based logic or default
    // You might have section naming conventions that indicate grade
    if (section.includes('6')) return "6";
    if (section.includes('7')) return "7";
    if (section.includes('8')) return "8";
    
    // Default to grade 6 if cannot determine
    return "6";
  }

  /**
   * Parse Snorkl progress from lessons mastered column (Column J)
   */
  private static parseSnorklProgress(studentRows: string[][]): string[] {
    const lessonsSet = new Set<string>();

    studentRows.forEach(row => {
      const lessonsText = row[this.COLUMN_MAPPING.LESSONS_MASTERED] || '';
      
      if (lessonsText) {
        // Parse comma-separated lessons: "G6 U2 L05, G6 U2 L03, G6 U2 L06"
        const lessons = lessonsText.split(',').map(l => l.trim()).filter(l => l);
        
        lessons.forEach(lesson => {
          // Validate lesson against known scope and sequence
          try {
            AllLessonsZod.parse(lesson);
            lessonsSet.add(lesson);
          } catch (error) {
            console.warn(`Unknown Snorkl lesson found: ${lesson}`, error);
            // Still include unknown lessons
            lessonsSet.add(lesson);
          }
        });
      }
    });

    return Array.from(lessonsSet);
  }

  /**
   * Parse Zearn progress from Zearn lessons column (Column O)
   */
  private static parseZearnProgress(studentRows: string[][]): StudentZearnProgress[] {
    const lessonsMap = new Map<string, StudentZearnProgress>();

    studentRows.forEach(row => {
      const date = this.formatDate(row[this.COLUMN_MAPPING.DATE] || '');
      // FIX: Use ZEARN_LESSONS column instead of LESSONS_MASTERED
      const zearnLessonsText = row[this.COLUMN_MAPPING.ZEARN_LESSONS] || '';
      
      if (zearnLessonsText && date) {
        // Parse comma-separated lessons: "G6 U2 L05, G6 U2 L03, G6 U2 L06"
        const lessons = zearnLessonsText.split(',').map(l => l.trim()).filter(l => l);
        
        lessons.forEach(lesson => {
          // Validate lesson against known scope and sequence
          try {
            const validatedLesson = AllLessonsZod.parse(lesson);
            
            if (!lessonsMap.has(lesson)) {
              lessonsMap.set(lesson, {
                lesson: validatedLesson,
                completedDate: date,
                mastered: true
              });
            }
          } catch (error) {
            console.warn(`Unknown lesson found: ${lesson}`, error);
            // For unknown lessons, we'll still include them but cast as any to bypass type checking
            if (!lessonsMap.has(lesson)) {
              lessonsMap.set(lesson, {
                lesson: lesson as AllLessons,
                completedDate: date,
                mastered: true
              });
            }
          }
        });
      }
    });

    return Array.from(lessonsMap.values());
  }

  /**
   * Calculate weekly Zearn minutes (placeholder implementation)
   */
  private static calculateWeeklyMinutes(studentRows: string[][]): Record<string, string> {
    // Group rows by week and calculate time spent
    // This is a placeholder - would need actual time tracking data
    const weeklyData: Record<string, string> = {};
    
    studentRows.forEach((row, index) => {
      const weekNum = Math.floor(index / 5) + 1; // Rough week calculation
      const lessonsCount = (row[this.COLUMN_MAPPING.ZEARN_LESSONS] || '').split(',').filter(l => l.trim()).length;
      
      if (lessonsCount > 0) {
        const estimatedMinutes = lessonsCount * 15; // Rough estimate: 15 min per lesson
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = estimatedMinutes % 60;
        weeklyData[`Week ${weekNum}`] = `${hours}h ${minutes}m`;
      }
    });

    return weeklyData;
  }

  /**
   * Format date string consistently
   */
  private static formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      // Handle various date formats from Google Sheets
      // "Tue 7/29" -> "2024-07-29" format
      const currentYear = new Date().getFullYear();
      
      // Simple parsing for "Tue 7/29" format
      if (dateStr.includes('/')) {
        const datePart = dateStr.split(' ').find(part => part.includes('/'));
        if (datePart) {
          const [month, day] = datePart.split('/');
          const paddedMonth = month.padStart(2, '0');
          const paddedDay = day.padStart(2, '0');
          return `${currentYear}-${paddedMonth}-${paddedDay}`;
        }
      }
      
      return dateStr;
    } catch (error) {
      console.warn('Error formatting date:', dateStr, error);
      return dateStr;
    }
  }

  /**
   * Normalize attendance status to standard emoji format
   */
  private static normalizeAttendanceStatus(status: string): '✅' | '🟡' | '❌' {
    const normalized = status.trim();
    
    if (normalized === '✅' || normalized.toLowerCase() === 'present') {
      return '✅';
    } else if (normalized === '🟡' || normalized.toLowerCase() === 'late') {
      return '🟡';
    } else if (normalized === '❌' || normalized.toLowerCase() === 'absent') {
      return '❌';
    }
    
    // Default to absent if unclear
    return '❌';
  }

  /**
   * Parse number from string, return undefined if not a valid number
   */
  private static parseNumber(value: string): number | undefined {
    if (!value || value.trim() === '') return undefined;
    
    const parsed = parseInt(value.trim(), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Calculate email similarity for fuzzy matching
   */
  private static calculateEmailSimilarity(email1: string, email2: string): number {
    // Simple similarity calculation - could be improved with more sophisticated algorithms
    if (email1 === email2) return 1.0;
    
    const longer = email1.length > email2.length ? email1 : email2;
    const shorter = email1.length > email2.length ? email2 : email1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance for string similarity
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
} 