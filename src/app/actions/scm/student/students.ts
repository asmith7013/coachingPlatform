"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentService } from "@/lib/integrations/google-sheets/services/student-service";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { StudentInput } from "@zod-schema/scm/student/student";

/**
 * Server action wrappers for student operations
 * Delegates to API-safe service
 */

export async function fetchStudents(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(() => StudentService.fetchStudents(params));
}

export async function fetchStudentById(id: string) {
  return withDbConnection(() => StudentService.fetchStudentById(id));
}

export async function createStudent(data: StudentInput) {
  return withDbConnection(() => StudentService.createStudent(data));
}

export async function updateStudent(id: string, data: Partial<StudentInput>) {
  return withDbConnection(() => StudentService.updateStudent(id, data));
}

export async function deleteStudent(id: string) {
  return withDbConnection(() => StudentService.deleteStudent(id));
}

// Specialized student queries
export async function fetchStudentsBySection(section: string) {
  return withDbConnection(() => StudentService.fetchStudentsBySection(section));
}

export async function fetchStudentsByTeacher(teacher: string) {
  return withDbConnection(() => StudentService.fetchStudentsByTeacher(teacher));
}

export async function fetchStudentByStudentId(studentID: number) {
  return withDbConnection(() => StudentService.fetchStudentByStudentId(studentID));
}

export async function bulkCreateStudents(studentsData: StudentInput[]) {
  return withDbConnection(() => StudentService.bulkCreateStudents(studentsData));
} 