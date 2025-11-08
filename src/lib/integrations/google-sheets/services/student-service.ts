import { z, ZodType } from "zod";
import { StudentModel } from "@mongoose-schema/313/student.model";
import { Student, StudentZodSchema, StudentInputZodSchema, StudentInput } from "@zod-schema/313/student";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: StudentModel as any,
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
      
      // ✅ Convert to plain objects using Mongoose transform
      const plainStudents = students.map(doc => doc.toObject());
      
      // ✅ Use correct response format to match client expectations
      return { success: true, items: plainStudents };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  }

  static async fetchStudentsByTeacher(teacher: string) {
    try {
      const students = await StudentModel.find({ teacher, active: true })
        .sort({ section: 1, lastName: 1, firstName: 1 });
      
      // ✅ Convert to plain objects
      const plainStudents = students.map(doc => doc.toObject());
      
      // ✅ Use correct response format
      return { success: true, items: plainStudents };
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
      
      // ✅ Convert to plain object (single entity still uses 'data')
      return { success: true, data: student.toObject() };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  }

  static async bulkCreateStudents(studentsData: StudentInput[]) {
    try {
      console.log('[StudentService] bulkCreateStudents called with', studentsData.length, 'students');

      // Validate all student data first
      const validatedStudents = studentsData.map((data, index) => {
        console.log(`[StudentService] Validating student ${index}:`, data);
        return StudentInputZodSchema.parse(data);
      });

      console.log('[StudentService] All students validated, calling insertMany...');

      // Check for existing students first
      const studentIDs = validatedStudents.map(s => s.studentID);
      const existingStudents = await StudentModel.find({ studentID: { $in: studentIDs } });
      console.log('[StudentService] Found', existingStudents.length, 'existing students with these IDs');
      if (existingStudents.length > 0) {
        console.log('[StudentService] Existing student IDs:', existingStudents.map(s => s.studentID));
      }

      const result = await StudentModel.insertMany(validatedStudents, {
        ordered: false, // Continue inserting even if some fail due to duplicates
        rawResult: true // Get detailed result including errors
      });

      console.log('[StudentService] insertMany rawResult:', JSON.stringify(result, null, 2));

      // Extract inserted IDs from rawResult
      const insertedCount = Object.keys(result.insertedIds || {}).length;
      console.log('[StudentService] Inserted count:', insertedCount);

      // Verify students were actually inserted
      const verifyCount = await StudentModel.countDocuments({ studentID: { $in: studentIDs } });
      console.log('[StudentService] Verification: Found', verifyCount, 'students in DB after insert');

      if (insertedCount === 0 && validatedStudents.length > 0) {
        // All inserts failed - likely all duplicates
        return {
          success: false,
          error: `No students were created. All ${validatedStudents.length} students may already exist (duplicate studentIDs).`,
          data: []
        };
      }

      // Fetch the inserted students to return them
      const insertedStudents = await StudentModel.find({ studentID: { $in: studentIDs } });

      return {
        success: true,
        data: insertedStudents.map((doc) => doc.toObject()),
        message: `Successfully created ${insertedCount} students`
      };
    } catch (error) {
      console.error('[StudentService] Error in bulkCreateStudents:', error);

      // Handle bulk insert errors (some may succeed, some may fail)
      if (error && typeof error === 'object' && 'insertedDocs' in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const insertedDocs = (error as any).insertedDocs || [];
        const insertedCount = insertedDocs.length || 0;

        console.log('[StudentService] Partial success:', insertedCount, 'students created');

        // Convert Mongoose documents to plain objects to avoid circular references
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plainDocs = insertedDocs.map((doc: any) => {
          if (doc && typeof doc.toObject === 'function') {
            return doc.toObject();
          }
          // If it's already a plain object, extract only necessary fields
          return {
            _id: doc._id,
            studentID: doc.studentID,
            firstName: doc.firstName,
            lastName: doc.lastName,
            section: doc.section,
            teacher: doc.teacher,
            gradeLevel: doc.gradeLevel,
            email: doc.email,
            active: doc.active,
            masteredSkills: doc.masteredSkills || []
          };
        });

        return {
          success: insertedCount > 0,
          data: plainDocs,
          message: `Partial success: created ${insertedCount} students, some failed due to duplicates`,
          warning: 'Some students may have been skipped due to duplicate student IDs'
        };
      }

      if (error instanceof z.ZodError) {
        console.error('[StudentService] Validation error:', error.issues);
        return {
          success: false,
          error: `Validation failed: ${error.issues.map((e: z.core.$ZodIssue) => e.message).join(', ')}`
        };
      }

      console.error('[StudentService] Unhandled error:', error);
      return { success: false, error: handleServerError(error) };
    }
  }
} 