import { z, ZodType } from "zod";
import { StudentModel } from "@/lib/schema/mongoose-schema/313/student.model";
import { Student, StudentZodSchema, StudentInputZodSchema, StudentInput } from "@/lib/schema/zod-schema/313/student";
import { createCrudActions } from "@server/crud/crud-factory";
import { handleServerError } from "@error/handlers/server";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";

/**
 * API-safe service for student operations
 * This service can be imported by both server actions and API routes
 * Note: This does NOT use "use server" directive and can be imported anywhere
 */
export class StudentService {
  // Create standard CRUD actions using the factory
  private static studentActions = createCrudActions({
    model: StudentModel,
    schema: StudentZodSchema as ZodType<Student>,
    inputSchema: StudentInputZodSchema as ZodType<StudentInput>,
    name: 'Student',
    revalidationPaths: ["/dashboard/students"],
    sortFields: ['lastName', 'firstName', 'section', 'teacher', 'createdAt'],
    defaultSortField: 'lastName',
    defaultSortOrder: 'asc'
  });

  // Standard CRUD operations
  static async fetchStudents(params: QueryParams = DEFAULT_QUERY_PARAMS) {
    return this.studentActions.fetch(params);
  }

  static async fetchStudentById(id: string) {
    return this.studentActions.fetchById(id);
  }

  static async createStudent(data: StudentInput) {
    return this.studentActions.create(data);
  }

  static async updateStudent(id: string, data: Partial<StudentInput>) {
    return this.studentActions.update(id, data);
  }

  static async deleteStudent(id: string) {
    return this.studentActions.delete(id);
  }

  // Specialized student queries
  static async fetchStudentsBySection(section: string) {
    try {
      const students = await StudentModel.find({ section, active: true })
        .sort({ lastName: 1, firstName: 1 });
      
      return { success: true, data: students };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  }

  static async fetchStudentsByTeacher(teacher: string) {
    try {
      const students = await StudentModel.find({ teacher, active: true })
        .sort({ section: 1, lastName: 1, firstName: 1 });
      
      return { success: true, data: students };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  }

  static async fetchStudentByStudentId(studentID: number) {
    try {
      const student = await StudentModel.findOne({ studentID, active: true });
      
      if (!student) {
        return { success: false, error: `Student with ID ${studentID} not found` };
      }
      
      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  }

  static async bulkCreateStudents(studentsData: StudentInput[]) {
    try {
      // Validate all student data first
      const validatedStudents = studentsData.map(data => 
        StudentInputZodSchema.parse(data)
      );
      
      const result = await StudentModel.insertMany(validatedStudents, { 
        ordered: false // Continue inserting even if some fail due to duplicates
      });
      
      return { 
        success: true, 
        data: result,
        message: `Successfully created ${result.length} students`
      };
    } catch (error) {
      // Handle bulk insert errors (some may succeed, some may fail)
      if (error && typeof error === 'object' && 'insertedDocs' in error) {
        const insertedDocs = (error as unknown as { insertedDocs: unknown[] }).insertedDocs;
        const insertedCount = insertedDocs?.length || 0;
        
        return {
          success: insertedCount > 0,
          data: insertedDocs,
          message: `Partial success: created ${insertedCount} students, some failed due to duplicates`,
          warning: 'Some students may have been skipped due to duplicate student IDs'
        };
      }
      
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: `Validation failed: ${error.errors.map(e => e.message).join(', ')}` 
        };
      }
      
      return { success: false, error: handleServerError(error) };
    }
  }
} 