import { RoadmapSheetMetadata, StudentSkillData, RoadmapSheetData } from './types';

/**
 * Parse student name from "LASTNAME, FIRSTNAME" format
 * Returns { firstName, lastName }
 */
export function parseStudentName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.split(',').map(p => p.trim());

  if (parts.length === 2) {
    return {
      lastName: parts[0],
      firstName: parts[1],
    };
  }

  // If no comma, assume it's already "FIRSTNAME LASTNAME"
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length >= 2) {
    return {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
    };
  }

  // Fallback: treat entire string as last name
  return {
    firstName: '',
    lastName: fullName.trim(),
  };
}

/**
 * Parse metadata from cell C1
 * Format: "Section: 803 | Teacher: Alex Smith | Roadmap: Illustrative Math New York - 8th Grade | Date: 10/29/2025"
 */
export function parseMetadata(metadataCell: string): RoadmapSheetMetadata {
  const parts = metadataCell.split('|').map(p => p.trim());

  const metadata: Partial<RoadmapSheetMetadata> = {
    section: '',
    teacher: '',
    roadmap: '',
    date: '',
  };

  parts.forEach(part => {
    if (part.startsWith('Section:')) {
      metadata.section = part.replace('Section:', '').trim();
    } else if (part.startsWith('Teacher:')) {
      metadata.teacher = part.replace('Teacher:', '').trim();
    } else if (part.startsWith('Roadmap:')) {
      metadata.roadmap = part.replace('Roadmap:', '').trim();
    } else if (part.startsWith('Date:')) {
      metadata.date = part.replace('Date:', '').trim();
    }
  });

  return metadata as RoadmapSheetMetadata;
}

/**
 * Extract student names from row 3, starting at column I (index 8)
 * Returns array of student names
 */
export function extractStudentNames(row: string[]): string[] {
  // Column I is index 8 (A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8)
  const studentNames: string[] = [];

  for (let i = 8; i < row.length; i++) {
    const name = row[i]?.trim();
    if (name) {
      studentNames.push(name);
    } else {
      // Stop when we hit an empty cell
      break;
    }
  }

  return studentNames;
}

/**
 * Extract skill numbers from column A, starting from row 4
 * Looks for patterns like "Unit 1", "Unit 2", etc. in column A
 * and skill numbers in subsequent rows
 */
export function extractSkillsByUnit(rows: string[][]): Map<string, string[]> {
  const skillsByUnit = new Map<string, string[]>();
  let currentUnit = '';

  // Start from row 4 (index 3, since row 1 is index 0)
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    const cellA = row[0]?.trim() || '';

    // Check if this is a unit header (e.g., "Unit 1", "Unit 2")
    if (cellA.match(/^Unit\s+\d+/i)) {
      currentUnit = cellA;
      skillsByUnit.set(currentUnit, []);
    } else if (cellA && currentUnit) {
      // This is a skill number for the current unit
      const existingSkills = skillsByUnit.get(currentUnit) || [];
      skillsByUnit.set(currentUnit, [...existingSkills, cellA]);
    }
  }

  return skillsByUnit;
}

/**
 * Parse the entire sheet data to extract student mastered skills
 *
 * @param rows - All rows from the sheet
 * @returns Parsed roadmap sheet data with student mastered skills
 */
export function parseRoadmapSheet(rows: string[][]): RoadmapSheetData {
  if (rows.length < 4) {
    throw new Error('Sheet must have at least 4 rows (metadata, headers, student names, and skill data)');
  }

  // Parse metadata from C1 (row 0, column 2)
  const metadataCell = rows[0][2] || '';
  const metadata = parseMetadata(metadataCell);

  // Extract student names from row 3 (index 2)
  const studentNames = extractStudentNames(rows[2]);

  if (studentNames.length === 0) {
    throw new Error('No student names found in row 3, starting from column I');
  }

  // Initialize student data
  const studentDataMap = new Map<string, Set<string>>();
  studentNames.forEach(name => {
    studentDataMap.set(name, new Set<string>());
  });

  // Parse skills and check mastery for each student
  // Starting from row 4 (index 3)
  console.log(`[Parser] Processing ${rows.length} total rows`);
  console.log(`[Parser] Starting skill parsing from row 4 (index 3)`);
  console.log(`[Parser] Sample of first 5 skill rows:`, rows.slice(3, 8).map((r, i) => ({
    row: i + 4,
    colA: r[0],
    colB: r[1],
    colC: r[2],
    colD: r[3]
  })));

  let skillRowCount = 0;
  let poCount = 0;

  for (let rowIndex = 3; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const cellA = row[0]?.trim() || '';
    const cellB = row[1]?.trim() || '';
    const cellC = row[2]?.trim() || '';
    const cellD = row[3]?.trim() || '';

    // Skip rows where column C or D is empty (header/separator rows)
    if (!cellC || !cellD) {
      if (cellA || cellB) {
        console.log(`[Parser] Skipping header/separator at row ${rowIndex + 1}: "${cellA}" (C and D empty)`);
      }
      continue;
    }

    // The skill CODE is in column C (3-digit code like "114", "194", etc.)
    const skillNumber = cellC;

    // Skip if no skill number
    if (!skillNumber) {
      continue;
    }

    skillRowCount++;

    // Check each student column (starting at column I, index 8)
    let rowPOCount = 0;
    studentNames.forEach((studentName, studentIndex) => {
      const columnIndex = 8 + studentIndex;
      const cellValue = row[columnIndex]?.trim().toLowerCase();

      // Check for "PO" (Passed Out) indicating mastery
      if (cellValue === 'po') {
        rowPOCount++;
        poCount++;
        const studentSkills = studentDataMap.get(studentName);
        if (studentSkills) {
          studentSkills.add(skillNumber);
        }
      }
    });

    // Log first few rows to see what values we're finding
    if (skillRowCount <= 5) {
      console.log(`[Parser] Row ${rowIndex + 1} (skill: ${skillNumber}): Found ${rowPOCount} PO marks. Sample values:`,
        studentNames.slice(0, 3).map((name, idx) => {
          const colIdx = 8 + idx;
          return `${name.substring(0, 20)}: "${row[colIdx]}"`;
        })
      );
    }
  }

  console.log(`[Parser] Processed ${skillRowCount} skill rows`);
  console.log(`[Parser] Found ${poCount} total "PO" marks across all students`);

  // Convert to array format
  const students: StudentSkillData[] = Array.from(studentDataMap.entries()).map(
    ([studentName, skillsSet]) => ({
      studentName,
      masteredSkills: Array.from(skillsSet),
    })
  );

  // Calculate totals
  const totalSkillsFound = students.reduce((sum, s) => sum + s.masteredSkills.length, 0);

  return {
    metadata,
    students,
    totalSkillsFound,
    totalStudentsFound: students.length,
  };
}

