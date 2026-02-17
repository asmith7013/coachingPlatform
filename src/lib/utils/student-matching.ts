/**
 * Shared utility for matching students by email across systems.
 *
 * Used by:
 * - Podsie incentives API endpoints (matching Podsie emails to MongoDB students)
 * - Attendance import (matching Podsie emails to student records)
 * - Student sync operations
 */

import { StudentModel } from "@mongoose-schema/scm/student/student.model";

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface MatchedStudent {
  _id: string;
  studentID: number;
  firstName: string;
  lastName: string;
  email: string;
  section: string;
  gradeLevel: string;
  school?: string;
}

/**
 * Find a single student by email (case-insensitive).
 * Optionally filter by school to handle sections that exist in multiple schools.
 */
export async function findStudentByEmail(
  email: string,
  school?: string,
): Promise<MatchedStudent | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    email: { $regex: new RegExp(`^${escapeRegex(email)}$`, "i") },
    active: true,
  };
  if (school) {
    query.school = school;
  }

  const student = await StudentModel.findOne(query).lean();
  if (!student) return null;

  return {
    _id: String(student._id),
    studentID: Number(student.studentID),
    firstName: String(student.firstName),
    lastName: String(student.lastName),
    email: String(student.email),
    section: String(student.section),
    gradeLevel: String(student.gradeLevel || "8"),
    school: student.school ? String(student.school) : undefined,
  };
}

/**
 * Find multiple students by email (case-insensitive).
 * Returns a Map keyed by lowercase email for easy lookup.
 * Optionally filter by school.
 */
export async function findStudentsByEmails(
  emails: string[],
  school?: string,
): Promise<Map<string, MatchedStudent>> {
  if (emails.length === 0) return new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    email: { $in: emails.map((e) => new RegExp(`^${escapeRegex(e)}$`, "i")) },
    active: true,
  };
  if (school) {
    query.school = school;
  }

  const students = await StudentModel.find(query).lean();

  const result = new Map<string, MatchedStudent>();
  for (const s of students) {
    result.set(String(s.email).toLowerCase(), {
      _id: String(s._id),
      studentID: Number(s.studentID),
      firstName: String(s.firstName),
      lastName: String(s.lastName),
      email: String(s.email),
      section: String(s.section),
      gradeLevel: String(s.gradeLevel || "8"),
      school: s.school ? String(s.school) : undefined,
    });
  }

  return result;
}
