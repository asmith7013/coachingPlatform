import { connect, disconnect } from 'mongoose';
import mongoose from 'mongoose';
import { CycleModel } from '@mongoose-schema/core/cycle.model';
import { CoachingLogModel } from '@mongoose-schema/visits/coaching-log.model';
import { YesNoEnum } from '@enums';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Main seeding function
async function seedCyclesAndCoachingLogs() {
  console.log('Connecting to MongoDB...');
  try {
    await connect(process.env.DATABASE_URL!);
    console.log('Connected to MongoDB');

    // Clean up existing data
    await CycleModel.deleteMany({});
    console.log('Cleared existing Cycles');
    
    await CoachingLogModel.deleteMany({});
    console.log('Cleared existing Coaching Logs');
    
    // Create sample Cycles
    const cycles = [
      {
        _id: new mongoose.Types.ObjectId(),
        cycleNum: 1,
        ipgIndicator: 'Standard 1.2',
        actionPlanURL: 'https://example.com/actionplan/cycle1',
        implementationIndicator: 'Student engagement',
        supportCycle: 'Fall 2023',
        lookFors: [
          {
            originalLookFor: 'lookfor1',
            title: 'Student Discussion',
            description: 'Students engage in meaningful academic discussions',
            tags: ['Discussion', 'Engagement', 'Participation'],
            lookForIndex: 1,
            teacherIDs: ['john.doe@nycdoe.edu'],
            chosenBy: ['emily.davis@teachinglab.org'],
            active: true
          },
          {
            originalLookFor: 'lookfor2',
            title: 'Multiple Representations',
            description: 'Students use multiple representations to solve problems',
            tags: ['Representations', 'Problem Solving', 'Critical Thinking'],
            lookForIndex: 2,
            teacherIDs: ['jane.smith@nycdoe.edu'],
            chosenBy: ['robert.anderson@teachinglab.org'],
            active: true
          }
        ],
        owners: ['admin@example.com']
      },
      {
        _id: new mongoose.Types.ObjectId(),
        cycleNum: 2,
        ipgIndicator: 'Standard 2.3',
        actionPlanURL: 'https://example.com/actionplan/cycle2',
        implementationIndicator: 'Effective questioning techniques',
        supportCycle: 'Fall 2023',
        lookFors: [
          {
            originalLookFor: 'lookfor3',
            title: 'Higher-Order Questioning',
            description: 'Teacher uses higher-order questions to promote critical thinking',
            tags: ['Questioning', 'Critical Thinking', 'Discussion'],
            lookForIndex: 1,
            teacherIDs: ['sarah.johnson@nycdoe.edu'],
            chosenBy: ['robert.anderson@teachinglab.org'],
            active: true
          }
        ],
        owners: ['admin@example.com']
      },
      {
        _id: new mongoose.Types.ObjectId(),
        cycleNum: 3,
        ipgIndicator: 'Standard 3.1',
        actionPlanURL: 'https://example.com/actionplan/cycle3',
        implementationIndicator: 'Effective use of formative assessment',
        supportCycle: 'Spring 2024',
        lookFors: [
          {
            originalLookFor: 'lookfor4',
            title: 'Formative Assessment',
            description: 'Regular use of formative assessment to guide instruction',
            tags: ['Assessment', 'Feedback', 'Instruction'],
            lookForIndex: 1,
            teacherIDs: ['michael.williams@nycdoe.edu'],
            chosenBy: ['emily.davis@teachinglab.org'],
            active: true
          },
          {
            originalLookFor: 'lookfor5',
            title: 'Student Self-Assessment',
            description: 'Students engage in self-assessment of their learning',
            tags: ['Assessment', 'Self-Reflection', 'Metacognition'],
            lookForIndex: 2,
            teacherIDs: ['michael.williams@nycdoe.edu'],
            chosenBy: ['emily.davis@teachinglab.org'],
            active: true
          }
        ],
        owners: ['admin@example.com']
      }
    ];

    const createdCycles = await CycleModel.create(cycles);
    console.log(`Created ${createdCycles.length} Cycles`);

    // Create sample Coaching Logs
    const coachingLogs = [
      {
        _id: new mongoose.Types.ObjectId(),
        reasonDone: YesNoEnum.YES,
        microPLTopic: 'Effective Questioning Strategies',
        microPLDuration: 30,
        modelTopic: 'Think-Pair-Share Implementation',
        modelDuration: 45,
        adminMeet: true,
        adminMeetDuration: 20,
        NYCDone: true,
        totalDuration: "Half day - 3 hours",
        solvesTouchpoint: "Teacher support",
        primaryStrategy: 'Modeling effective instructional practices',
        solvesSpecificStrategy: 'Demonstration of think-pair-share technique',
        aiSummary: 'Teacher showed improved implementation of questioning strategies. Next steps include varying question complexity and wait time.',
        owners: ['emily.davis@teachinglab.org'],
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        reasonDone: YesNoEnum.YES,
        microPLTopic: 'Data-Driven Instruction',
        microPLDuration: 45,
        modelTopic: 'Exit Ticket Analysis',
        modelDuration: 30,
        adminMeet: false,
        NYCDone: true,
        totalDuration: "Half day - 3 hours",
        solvesTouchpoint: "Teacher OR teacher & leader support",
        primaryStrategy: 'Analysis of student work',
        solvesSpecificStrategy: 'Using exit tickets to guide instruction planning',
        aiSummary: 'Collaborative analysis of exit tickets revealed gaps in student understanding of fractions. Teacher will implement targeted small group instruction next week.',
        owners: ['robert.anderson@teachinglab.org'],
        createdAt: new Date('2023-11-20'),
        updatedAt: new Date('2023-11-20')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        reasonDone: YesNoEnum.NO,
        totalDuration: "Full day - 6 hours",
        solvesTouchpoint: "Leader support",
        primaryStrategy: 'Curriculum alignment',
        solvesSpecificStrategy: 'Mapping curriculum to standards',
        aiSummary: 'Session canceled due to school-wide professional development day. Rescheduled for next week.',
        owners: ['emily.davis@teachinglab.org'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];

    const createdCoachingLogs = await CoachingLogModel.create(coachingLogs);
    console.log(`Created ${createdCoachingLogs.length} Coaching Logs`);

    console.log('Cycles and Coaching Logs data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedCyclesAndCoachingLogs()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  }); 