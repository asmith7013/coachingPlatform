#!/usr/bin/env tsx
import { connectToDB } from '../src/lib/server/db/connection';
import { StudentModel } from '../src/lib/schema/mongoose-schema/scm/student/student.model';

/**
 * Script to delete all documents from the students collection
 * This will permanently remove all student data from the database
 */
async function deleteAllStudents() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDB();

    console.log('📊 Checking current student count...');
    const initialCount = await StudentModel.countDocuments();
    console.log(`📈 Found ${initialCount} students in the database`);

    if (initialCount === 0) {
      console.log('✅ No students found to delete. Database is already clean.');
      return;
    }

    console.log('🗑️ Deleting all student documents...');
    const deleteResult = await StudentModel.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} student documents`);
    
    // Verify deletion
    const finalCount = await StudentModel.countDocuments();
    console.log(`📊 Final student count: ${finalCount}`);
    
    if (finalCount === 0) {
      console.log('🎉 All student documents have been successfully removed from the database!');
    } else {
      console.warn(`⚠️ Warning: ${finalCount} documents still remain in the database`);
    }

  } catch (error) {
    console.error('❌ Error deleting students:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Execute the deletion with confirmation
console.log('🚨 WARNING: This will permanently delete ALL student documents from the database!');
console.log('📍 Target: coaching > ai-coaching-platform > students collection');
console.log('⏳ Starting deletion in 3 seconds...');

setTimeout(() => {
  deleteAllStudents();
}, 3000);
