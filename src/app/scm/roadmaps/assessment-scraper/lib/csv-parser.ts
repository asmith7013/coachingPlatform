import {
  AssessmentRow,
  AssessmentRowZod,
} from "@/lib/schema/zod-schema/scm/assessment-scraper";

/**
 * Parse CSV content from assessment history export
 * Format: Name,Skill Name,Skill Number,Attempt,Date Completed,Result
 */
export function parseAssessmentCSV(csvContent: string): AssessmentRow[] {
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows");
  }

  // Skip header row
  const dataLines = lines.slice(1);

  const assessmentData: AssessmentRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue; // Skip empty lines

    // Split by comma, but handle commas within quoted fields
    const columns = parseCSVLine(line);

    if (columns.length < 6) {
      console.warn(`Skipping malformed row ${i + 2}: ${line}`);
      continue;
    }

    try {
      const row = AssessmentRowZod.parse({
        name: columns[0].trim(),
        skillName: columns[1].trim(),
        skillNumber: columns[2].trim(),
        attempt: parseInt(columns[3].trim(), 10),
        dateCompleted: columns[4].trim(),
        result: columns[5].trim(),
      });

      assessmentData.push(row);
    } catch (error) {
      console.warn(`Skipping invalid row ${i + 2}:`, error);
      continue;
    }
  }

  return assessmentData;
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

/**
 * Group assessment rows by student
 */
export function groupByStudent(
  rows: AssessmentRow[],
): Map<string, AssessmentRow[]> {
  const grouped = new Map<string, AssessmentRow[]>();

  for (const row of rows) {
    const existing = grouped.get(row.name) || [];
    existing.push(row);
    grouped.set(row.name, existing);
  }

  return grouped;
}

/**
 * Group assessment rows by skill within a student
 */
export function groupBySkill(
  rows: AssessmentRow[],
): Map<string, AssessmentRow[]> {
  const grouped = new Map<string, AssessmentRow[]>();

  for (const row of rows) {
    const existing = grouped.get(row.skillNumber) || [];
    existing.push(row);
    grouped.set(row.skillNumber, existing);
  }

  return grouped;
}
