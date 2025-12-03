import type { LessonConfig, ProgressData } from "../types";

interface StudentInfo {
  studentId: string;
  name: string;
  email: string;
}

// Type for student data (can be Mongoose document or plain object)
type StudentData = {
  _id: string;
  studentID: number;
  firstName: string;
  lastName: string;
  email?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/**
 * Generates CSV content from progress data
 *
 * CSV Structure:
 * - Student Name | Student Email | Assignment ID | Assignment Name | Unit | Section | Activity Type | Q1 Correctness | Q1 Explanation Score | Q2 Correctness | ...
 * - Rows sorted by: Assignment first, then student name alphabetically within each assignment
 */
export function generateProgressCsv(
  lessons: LessonConfig[],
  progressData: ProgressData[],
  students: StudentData[]
): string {
  // Create student lookup map - use MongoDB _id as key to match progressData.studentId
  const studentMap = new Map<string, StudentInfo>();
  students.forEach(student => {
    // Convert _id to string (it might be ObjectId)
    const id = String(student._id);
    studentMap.set(id, {
      studentId: id,
      name: `${student.firstName} ${student.lastName}`.trim(),
      email: student.email || '',
    });
  });

  // Find maximum number of questions across all assignments
  const maxQuestions = Math.max(...lessons.map(l => l.totalQuestions), 0);

  // Generate CSV header
  const headers = [
    'Student Name',
    'Student Email',
    'Assignment ID',
    'Assignment Name',
    'Unit',
    'Section',
    'Activity Type',
  ];

  // Add question columns (Correctness, Explanation Score, and Completion Date for each question)
  for (let i = 1; i <= maxQuestions; i++) {
    headers.push(`Q${i} Correctness`);
    headers.push(`Q${i} Explanation Score`);
    headers.push(`Q${i} Completion Date`);
  }

  const rows: string[][] = [headers];

  // Process each assignment
  lessons.forEach(lesson => {
    // Get all progress data for this assignment
    const assignmentProgressData = progressData.filter(p =>
      p.podsieAssignmentId
        ? p.podsieAssignmentId === lesson.podsieAssignmentId
        : p.rampUpId === lesson.unitLessonId
    );

    // Get unique students from progress data
    const studentIdsInProgress = new Set(assignmentProgressData.map(p => p.studentId));

    // If no students have been synced, get all students in the section
    // (This would require passing section students list - for now just use synced students)
    const studentsForAssignment = Array.from(studentIdsInProgress)
      .map(studentId => {
        const student = studentMap.get(studentId);
        const progress = assignmentProgressData.find(p => p.studentId === studentId);
        return { student, progress };
      })
      .filter(item => item.student) // Only include students we have info for
      .sort((a, b) => {
        // Sort alphabetically by student name
        const nameA = a.student?.name || '';
        const nameB = b.student?.name || '';
        return nameA.localeCompare(nameB);
      });

    // Generate row for each student
    studentsForAssignment.forEach(({ student, progress }) => {
      if (!student) return;

      const row: string[] = [
        student.name,
        student.email,
        lesson.podsieAssignmentId || '',
        lesson.lessonName || '',
        String(lesson.unitNumber || ''),
        lesson.section || '',
        lesson.activityType === 'mastery-check' ? 'Mastery Check' : 'Sidekick',
      ];

      // Add question scores
      for (let qNum = 1; qNum <= maxQuestions; qNum++) {
        if (qNum <= lesson.totalQuestions && progress) {
          const question = progress.questions.find(q => q.questionNumber === qNum);

          // Correctness (0 or 1)
          const correctness = question?.correctScore !== undefined
            ? String(question.correctScore)
            : '';

          // Explanation Score (1-3)
          const explanationScore = question?.explanationScore !== undefined
            ? String(question.explanationScore)
            : '';

          // Completion Date (ISO format or empty)
          // Note: completedAt is only set when a question is marked as completed (correct answer)
          // For incorrect/incomplete questions, this will be empty
          const completionDate = question?.completedAt || '';

          row.push(correctness);
          row.push(explanationScore);
          row.push(completionDate);
        } else {
          // Empty cells for questions beyond this assignment's total
          row.push('');
          row.push('');
          row.push('');
        }
      }

      rows.push(row);
    });
  });

  // Convert rows to CSV string
  return rows.map(row =>
    row.map(cell => {
      // Escape cells containing commas, quotes, or newlines
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

/**
 * Triggers a browser download of the CSV file
 */
export function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generates a filename for the CSV export based on current filters
 */
export function generateCsvFilename(
  selectedSection: string,
  selectedUnit: number | null,
  selectedLessonSection: string
): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const section = selectedSection.replace(/[^a-zA-Z0-9]/g, '_');
  const unit = selectedUnit !== null ? `U${selectedUnit}` : 'AllUnits';
  const lessonSection = selectedLessonSection === 'all'
    ? 'AllLessons'
    : selectedLessonSection.replace(/[^a-zA-Z0-9]/g, '_');

  return `podsie_progress_${section}_${unit}_${lessonSection}_${timestamp}.csv`;
}
