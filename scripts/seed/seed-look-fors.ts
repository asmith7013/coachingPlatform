import { connect, disconnect } from 'mongoose';
import mongoose from 'mongoose';
import { LookForModel, LookForItemModel } from '../../src/lib/data-schema/mongoose-schema/look-fors/look-for.model';
import { exampleRubrics } from './mockRubrics';
import { LookForZodSchema, LookForItemZodSchema } from '@zod-schema/look-fors/look-for';
import { ZodError } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Support both environment variable names
const MONGO_URI = process.env.DATABASE_URL

async function seedLookFors() {
  console.log('Connecting to MongoDB...');

  if (!MONGO_URI) {
    throw new Error("Missing DATABASE_URL in environment variables");
  }
  await connect(MONGO_URI);
  console.log('Connected to MongoDB');

  try {
    // Clear existing data
    await LookForModel.deleteMany({});
    await LookForItemModel.deleteMany({});
    console.log('Cleared existing Look-For data');

    // Create sample Look-Fors
    const lookFors = [
      {
        _id: new mongoose.Types.ObjectId(),
        lookForIndex: 1,
        schools: ['S001', 'S002'],
        teachers: ['john.smith@nycdoe.edu', 'sarah.johnson@nycdoe.edu'],
        topic: 'Student Engagement',
        description: 'Observe student engagement during mathematics instruction',
        category: 'Instruction',
        status: 'Active',
        studentFacing: true,
        rubric: exampleRubrics.studentEngagement,
        owners: ['admin@example.com']
      },
      {
        _id: new mongoose.Types.ObjectId(),
        lookForIndex: 2,
        schools: ['S002', 'S003'],
        teachers: ['sarah.johnson@nycdoe.edu', 'michael.williams@nycdoe.edu'],
        topic: 'Mathematical Discourse',
        description: 'Observe quality of mathematical discourse and reasoning',
        category: 'Instruction',
        status: 'Active',
        studentFacing: true,
        rubric: exampleRubrics.mathematicalDiscourse,
        owners: ['admin@example.com']
      },
      {
        _id: new mongoose.Types.ObjectId(),
        lookForIndex: 3,
        schools: ['S003'],
        teachers: ['michael.williams@nycdoe.edu'],
        topic: 'Differentiation',
        description: 'Observe implementation of differentiation strategies',
        category: 'Planning',
        status: 'Active',
        studentFacing: false,
        rubric: exampleRubrics.differentiation,
        owners: ['admin@example.com']
      }
    ];

    // Validate against Zod schema before inserting
    for (let i = 0; i < lookFors.length; i++) {
      try {
        // Convert _id to string for Zod validation
        const lookForForValidation = {
          ...lookFors[i],
          _id: lookFors[i]._id.toString(),
          studentFacing: String(lookFors[i].studentFacing) // Convert to string as required by schema
        };
        
        // Validate with Zod
        LookForZodSchema.parse(lookForForValidation);
      } catch (error) {
        if (error instanceof ZodError) {
          console.error(`Zod validation failed for LookFor ${i + 1}:`, error.errors);
          throw new Error(`Zod validation failed when inserting LookFor ${i + 1}: ${error.message}`);
        }
        throw error; // Re-throw if it's not a ZodError
      }
    }

    const createdLookFors = await LookForModel.create(lookFors);
    console.log(`Created ${createdLookFors.length} Look-Fors`);

    // Create sample Look-For Items
    const lookForItems = [
      {
        _id: new mongoose.Types.ObjectId(),
        originalLookFor: createdLookFors[0]._id.toString(),
        title: 'Student Participation Rate',
        description: 'Track the percentage of students actively participating in discussions and activities',
        tags: ['Engagement', 'Participation', 'Mathematics'],
        lookForIndex: 1,
        teacherIDs: ['john.smith@nycdoe.edu'],
        chosenBy: ['emily.davis@teachinglab.org'],
        active: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        originalLookFor: createdLookFors[0]._id.toString(),
        title: 'Student Questions',
        description: 'Monitor the frequency and quality of student-initiated questions',
        tags: ['Engagement', 'Questioning', 'Critical Thinking'],
        lookForIndex: 2,
        teacherIDs: ['sarah.johnson@nycdoe.edu'],
        chosenBy: ['emily.davis@teachinglab.org'],
        active: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        originalLookFor: createdLookFors[1]._id.toString(),
        title: 'Mathematical Vocabulary Usage',
        description: 'Track student use of precise mathematical vocabulary in discussions',
        tags: ['Discourse', 'Vocabulary', 'Precision'],
        lookForIndex: 1,
        teacherIDs: ['sarah.johnson@nycdoe.edu'],
        chosenBy: ['robert.anderson@teachinglab.org'],
        active: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        originalLookFor: createdLookFors[2]._id.toString(),
        title: 'Tiered Assignment Implementation',
        description: 'Observe how effectively tiered assignments are used to address diverse needs',
        tags: ['Differentiation', 'Tiered Assignments', 'Equity'],
        lookForIndex: 1,
        teacherIDs: ['michael.williams@nycdoe.edu'],
        chosenBy: ['robert.anderson@teachinglab.org'],
        active: true
      }
    ];

    // Validate against Zod schema before inserting
    for (let i = 0; i < lookForItems.length; i++) {
      try {
        // Prepare item for validation
        const itemForValidation = {
          ...lookForItems[i],
          _id: lookForItems[i]._id.toString()
        };
        
        // Validate with Zod
        LookForItemZodSchema.parse(itemForValidation);
      } catch (error) {
        if (error instanceof ZodError) {
          console.error(`Zod validation failed for LookForItem ${i + 1}:`, error.errors);
          throw new Error(`Zod validation failed when inserting LookForItem ${i + 1}: ${error.message}`);
        }
        throw error; // Re-throw if it's not a ZodError
      }
    }

    const createdLookForItems = await LookForItemModel.create(lookForItems);
    console.log(`Created ${createdLookForItems.length} Look-For Items`);

    console.log('Look-For data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with error code
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedLookFors().catch(error => {
  console.error('Fatal error in seed script:', error);
  process.exit(1);
}); 