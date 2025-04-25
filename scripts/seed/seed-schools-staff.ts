import { connect, disconnect } from 'mongoose';
import { SchoolModel } from '../../src/lib/data-schema/mongoose-schema/core/school.model';
import { NYCPSStaffModel, TeachingLabStaffModel } from '../../src/lib/data-schema/mongoose-schema/core/staff.model';
import { AllowedGradeEnum, AllowedSubjectsEnum, AllowedSpecialGroupsEnum, TLAdminTypeEnum } from '../../src/lib/data-schema/enum';
import { AllowedRolesNYCPSEnum, AllowedRolesTLEnum } from '@data-schema/enum';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.DATABASE_URL

async function seedDatabase() {
  console.log('Connecting to MongoDB...');
  if (!MONGO_URI) {
    throw new Error("Missing DATABASE_URL in environment variables");
  }
  await connect(MONGO_URI);
  console.log('Connected to MongoDB');

  try {
    // Clear existing data
    await SchoolModel.deleteMany({});
    await NYCPSStaffModel.deleteMany({});
    await TeachingLabStaffModel.deleteMany({});
    console.log('Cleared existing schools and staff data');

    // Create sample schools
    const schools = [
      {
        schoolNumber: 'S001',
        district: 'District 1',
        schoolName: 'Roosevelt Elementary',
        address: '123 Education Ave, New York, NY 10001',
        emoji: '🏫',
        gradeLevelsSupported: [
          AllowedGradeEnum.KINDERGARTEN,
          AllowedGradeEnum.GRADE_1,
          AllowedGradeEnum.GRADE_2,
          AllowedGradeEnum.GRADE_3,
          AllowedGradeEnum.GRADE_4,
          AllowedGradeEnum.GRADE_5
        ],
        staffList: [],
        schedules: [],
        cycles: [],
        owners: ['admin@example.com']
      },
      {
        schoolNumber: 'S002',
        district: 'District 2',
        schoolName: 'Lincoln Middle School',
        address: '456 Learning Blvd, New York, NY 10002',
        emoji: '🏫',
        gradeLevelsSupported: [
          AllowedGradeEnum.GRADE_6,
          AllowedGradeEnum.GRADE_7,
          AllowedGradeEnum.GRADE_8
        ],
        staffList: [],
        schedules: [],
        cycles: [],
        owners: ['admin@example.com']
      },
      {
        schoolNumber: 'S003',
        district: 'District 3',
        schoolName: 'Washington High School',
        address: '789 Academic St, New York, NY 10003',
        emoji: '🏫',
        gradeLevelsSupported: [
          AllowedGradeEnum.GRADE_9,
          AllowedGradeEnum.GRADE_10,
          AllowedGradeEnum.GRADE_11,
          AllowedGradeEnum.GRADE_12
        ],
        staffList: [],
        schedules: [],
        cycles: [],
        owners: ['admin@example.com']
      }
    ];

    const createdSchools = await SchoolModel.create(schools);
    console.log(`Created ${createdSchools.length} schools`);

    // Create NYCPS staff members
    const nypsStaff = [
      {
        staffName: 'John Smith',
        email: 'john.smith@nycdoe.edu',
        schools: [createdSchools[0]._id.toString()],
        owners: ['admin@example.com'],
        gradeLevelsSupported: [AllowedGradeEnum.GRADE_3, AllowedGradeEnum.GRADE_4, AllowedGradeEnum.GRADE_5],
        subjects: [AllowedSubjectsEnum.MATH_6, AllowedSubjectsEnum.MATH_7],
        specialGroups: [AllowedSpecialGroupsEnum.SPED],
        rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
        pronunciation: 'John Smith',
        notes: [
          {
            date: new Date().toISOString(),
            type: 'Observation',
            heading: 'Initial Meeting',
            subheading: ['Discussed curriculum alignment']
          }
        ],
        experience: [
          {
            type: 'Teaching',
            years: 5
          }
        ]
      },
      {
        staffName: 'Sarah Johnson',
        email: 'sarah.johnson@nycdoe.edu',
        schools: [createdSchools[1]._id.toString()],
        owners: ['admin@example.com'],
        gradeLevelsSupported: [AllowedGradeEnum.GRADE_6, AllowedGradeEnum.GRADE_7],
        subjects: [AllowedSubjectsEnum.MATH_6, AllowedSubjectsEnum.MATH_7],
        specialGroups: [AllowedSpecialGroupsEnum.ELL],
        rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
        pronunciation: 'Sarah Johnson',
        experience: [
          {
            type: 'Teaching',
            years: 8
          }
        ]
      },
      {
        staffName: 'Michael Williams',
        email: 'michael.williams@nycdoe.edu',
        schools: [createdSchools[2]._id.toString()],
        owners: ['admin@example.com'],
        gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
        subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.GEOMETRY],
        specialGroups: [AllowedSpecialGroupsEnum.SPED],
        rolesNYCPS: [AllowedRolesNYCPSEnum.PRINCIPAL],
        pronunciation: 'Michael Williams',
        experience: [
          {
            type: 'Administration',
            years: 10
          },
          {
            type: 'Teaching',
            years: 5
          }
        ]
      }
    ];

    const createdNYCPSStaff = await NYCPSStaffModel.create(nypsStaff);
    console.log(`Created ${createdNYCPSStaff.length} NYCPS staff members`);

    // Update school staffList
    for (const staff of createdNYCPSStaff) {
      for (const schoolId of staff.schools) {
        await SchoolModel.findByIdAndUpdate(
          schoolId,
          { $push: { staffList: staff._id.toString() } }
        );
      }
    }

    // Create Teaching Lab staff members
    const teachingLabStaff = [
      {
        staffName: 'Emily Davis',
        email: 'emily.davis@teachinglab.org',
        schools: createdSchools.map(school => school._id.toString()),
        owners: ['admin@example.com'],
        adminLevel: TLAdminTypeEnum.COACH,
        assignedDistricts: ['District 1', 'District 2'],
        rolesTL: [AllowedRolesTLEnum.COACH]
      },
      {
        staffName: 'Robert Anderson',
        email: 'robert.anderson@teachinglab.org',
        schools: [createdSchools[1]._id.toString(), createdSchools[2]._id.toString()],
        owners: ['admin@example.com'],
        adminLevel: TLAdminTypeEnum.MANAGER,
        assignedDistricts: ['District 2', 'District 3'],
        rolesTL: [AllowedRolesTLEnum.CPM]
      }
    ];

    const createdTLStaff = await TeachingLabStaffModel.create(teachingLabStaff);
    console.log(`Created ${createdTLStaff.length} Teaching Lab staff members`);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase().catch(console.error); 