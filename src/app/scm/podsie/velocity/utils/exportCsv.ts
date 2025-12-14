import type { DailyVelocityStats, StudentDailyData } from "@/app/actions/scm/velocity/velocity";

interface SectionInfo {
  id: string;
  school: string;
  classSection: string;
}

/**
 * Generates CSV content for class-level velocity data
 *
 * CSV Structure:
 * - Date | Section | School | Block Type | Students Present | Total Completions | Lessons | Ramp Ups | Velocity
 */
export function generateClassVelocityCsv(
  sections: SectionInfo[],
  velocityData: Map<string, DailyVelocityStats[]>,
  startDate: string,
  endDate: string
): string {
  const headers = [
    'Date',
    'Section',
    'School',
    'Block Type',
    'Students Present',
    'Total Completions',
    'Lessons',
    'Ramp Ups',
    'Velocity (Completions/Student)',
  ];

  const rows: string[][] = [headers];

  // Process each section
  sections.forEach((section) => {
    const sectionData = velocityData.get(section.id);
    if (!sectionData) return;

    // Filter by date range and sort
    const filteredData = sectionData
      .filter((d) => d.date >= startDate && d.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Generate row for each date
    filteredData.forEach((dayData) => {
      const velocity = dayData.studentsPresent > 0
        ? (dayData.totalCompletions / dayData.studentsPresent).toFixed(2)
        : '0';

      const row: string[] = [
        dayData.date,
        section.classSection,
        section.school,
        dayData.blockType,
        String(dayData.studentsPresent),
        String(dayData.totalCompletions),
        String(dayData.byLessonType.lessons),
        String(dayData.byLessonType.rampUps),
        velocity,
      ];

      rows.push(row);
    });
  });

  return rowsToCsv(rows);
}

/**
 * Generates CSV content for student-level velocity data
 *
 * CSV Structure:
 * - Date | Section | School | Student Name | Attendance | Total Completions | Lessons | Ramp Ups
 */
export function generateStudentVelocityCsv(
  sections: SectionInfo[],
  detailData: Map<string, StudentDailyData[]>,
  startDate: string,
  endDate: string
): string {
  const headers = [
    'Date',
    'Section',
    'School',
    'Student ID',
    'Student Name',
    'Attendance',
    'Total Completions',
    'Lessons',
    'Ramp Ups',
  ];

  const rows: string[][] = [headers];

  // Process each section
  sections.forEach((section) => {
    const students = detailData.get(section.id);
    if (!students) return;

    // Process each student
    students.forEach((student) => {
      // Process each date in student's daily progress
      Object.entries(student.dailyProgress)
        .filter(([date]) => date >= startDate && date <= endDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, dayData]) => {
          const row: string[] = [
            date,
            section.classSection,
            section.school,
            String(student.studentId),
            student.studentName,
            dayData.attendance || 'unknown',
            String(dayData.totalCompletions),
            String(dayData.lessons),
            String(dayData.rampUps),
          ];

          rows.push(row);
        });
    });
  });

  return rowsToCsv(rows);
}

/**
 * Convert rows array to CSV string with proper escaping
 */
function rowsToCsv(rows: string[][]): string {
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
 * Generates a filename for the CSV export
 */
export function generateVelocityCsvFilename(
  dataType: 'class' | 'student',
  sectionCount: number,
  startDate: string,
  endDate: string
): string {
  // Format timestamp in EST with date and time
  const now = new Date();
  const estTimestamp = now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/[/,: ]/g, '-').replace('--', '_');

  const sections = sectionCount === 1 ? '1section' : `${sectionCount}sections`;

  return `velocity_${dataType}_${sections}_${startDate}_to_${endDate}_${estTimestamp}.csv`;
}
