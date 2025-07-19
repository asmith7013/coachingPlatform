#!/usr/bin/env tsx

import { connectToDB } from '@/lib/server/db/connection';
import { StudentModel } from '@/lib/schema/mongoose-schema/313/student.model';
import { StudentInputZodSchema, type StudentInput } from '@/lib/schema/zod-schema/313/student';
import studentData from '@/lib/ui/json/d11student.json';

/**
 * Script to import student data from JSON file into MongoDB
 * Run with: npm run import-students
 */

interface JsonStudentData {
  section: string;
  teacher: string;
  studentID: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  gradeLevel: string;
  subject: string;
}

/**
 * Transform JSON data to conform to StudentInput schema
 */
function transformStudentData(jsonStudent: JsonStudentData): StudentInput {
  return {
    studentID: jsonStudent.studentID,
    firstName: jsonStudent.firstName,
    lastName: jsonStudent.lastName,
    section: jsonStudent.section,
    teacher: jsonStudent.teacher,
    username: jsonStudent.username,
    password: jsonStudent.password,
    gradeLevel: jsonStudent.gradeLevel,
    active: true,
    ownerIds: [] // Default empty array - update as needed
  };
}

/**
 * Validate and prepare student data for import
 */
function prepareStudentData(): StudentInput[] {
  const validStudents: StudentInput[] = [];
  const errors: string[] = [];

  for (const [index, student] of studentData.entries()) {
    try {
      const transformedStudent = transformStudentData(student);
      const validatedStudent = StudentInputZodSchema.parse(transformedStudent);
      validStudents.push(validatedStudent);
    } catch (error) {
      console.error(`Validation error for student at index ${index}:`, error);
      errors.push(`Student ${student.firstName} ${student.lastName} (ID: ${student.studentID}): ${error}`);
    }
  }

  if (errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log(`\n✅ Successfully validated ${validStudents.length} out of ${studentData.length} students`);
  return validStudents;
}

/**
 * Import students into MongoDB
 */
async function importStudents(): Promise<void> {
  try {
    console.log('🔌 Connecting to database...');
    await connectToDB();
    
    console.log('📊 Preparing student data...');
    const validStudents = prepareStudentData();
    
    if (validStudents.length === 0) {
      console.log('❌ No valid students to import');
      return;
    }

    console.log(`\n📥 Importing ${validStudents.length} students...`);
    
    // Check for existing students to avoid duplicates
    const existingStudentIds = await StudentModel.find({}, { studentID: 1 }).lean();
    const existingIds = new Set(existingStudentIds.map(s => s.studentID));
    
    const newStudents = validStudents.filter(student => !existingIds.has(student.studentID));
    const duplicateCount = validStudents.length - newStudents.length;
    
    if (duplicateCount > 0) {
      console.log(`⚠️  Found ${duplicateCount} students that already exist (will skip)`);
    }

    if (newStudents.length === 0) {
      console.log('✅ All students already exist in database');
      return;
    }

    // Insert new students
    const result = await StudentModel.insertMany(newStudents, { 
      ordered: false, // Continue on individual failures
      rawResult: true 
    });

    console.log(`\n✅ Successfully imported ${result.insertedCount} students`);
    
    // Log any insertion errors
    if (result.mongoose?.results) {
      const failedInserts = result.mongoose.results.filter((r: { error: unknown }) => r.error);
      if (failedInserts.length > 0) {
        console.log(`⚠️  ${failedInserts.length} students failed to insert:`);
        failedInserts.forEach((failure: { error: unknown }, index: number) => {
          console.log(`  - Student ${index}: ${failure.error}`);
        });
      }
    }

    // Summary statistics
    const totalStudents = await StudentModel.countDocuments();
    console.log(`\n📊 Database now contains ${totalStudents} total students`);
    
    // Group by section for summary
    const sectionCounts = await StudentModel.aggregate([
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📚 Students by section:');
    sectionCounts.forEach(section => {
      console.log(`  ${section._id}: ${section.count} students`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

/**
 * Dry run - validate data without importing
 */
async function dryRun(): Promise<void> {
  console.log('🧪 Running validation check (dry run)...');
  
  const validStudents = prepareStudentData();
  
  if (validStudents.length > 0) {
    console.log('\n📋 Sample valid student:');
    console.log(JSON.stringify(validStudents[0], null, 2));
    
    // Check for potential duplicates by studentID
    const studentIds = validStudents.map(s => s.studentID);
    const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.log(`\n⚠️  Found ${duplicateIds.length} duplicate student IDs in JSON data:`);
      console.log(duplicateIds);
    }
  }
  
  console.log('\n✅ Dry run complete');
}

/**
 * Main script execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  
  try {
    if (isDryRun) {
      await dryRun();
    } else {
      console.log('🚀 Starting student data import...');
      console.log('💡 Use --dry-run flag to validate without importing\n');
      
      await importStudents();
      console.log('\n🎉 Import completed successfully!');
    }
  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run the script
main();