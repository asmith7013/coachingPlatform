import mongoose from 'mongoose';
import { StudentModel } from '@mongoose-schema/scm/student/student.model';

async function dropStudentIDRefIndex() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the students collection
    const collection = StudentModel.collection;

    // List all indexes
    console.log('\nCurrent indexes on students collection:');
    const indexes = await collection.indexes();
    indexes.forEach((index: any) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the problematic index if it exists
    const indexName = 'studentIDref_1';
    try {
      console.log(`\nDropping index "${indexName}"...`);
      await collection.dropIndex(indexName);
      console.log(`✅ Successfully dropped index "${indexName}"`);
    } catch (error: any) {
      if (error.code === 27) {
        console.log(`ℹ️  Index "${indexName}" does not exist (already dropped or never existed)`);
      } else {
        throw error;
      }
    }

    // List indexes after dropping
    console.log('\nIndexes after cleanup:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((index: any) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Index cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

dropStudentIDRefIndex();
