import { AllowedGradeEnum, AllowedSubjectsEnum, AllowedSpecialGroupsEnum, TLAdminTypeEnum } from '@models/shared/shared-types.model';
import { AllowedRolesNYCPSEnum, AllowedRolesTLEnum, YesNoEnum, LengthTypeEnum, TeacherLeaderTypeEnum } from '@models/shared';

// Example rubrics - comment out since the external path is not available
// import { exampleRubrics } from '@/scripts/seed/mockRubrics';

// Simplified version of seed data for UI display and API calls

/**
 * Mock School Data
 */
export const mockSchools = [
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

/**
 * Mock NYCPS Staff Data
 */
export const mockNYCPSStaff = [
  {
    staffName: 'John Smith',
    email: 'john.smith@nycdoe.edu',
    schools: ['S001'], // Will be converted to IDs after schools are created
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
    schools: ['S002'],
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
    schools: ['S003'],
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

/**
 * Mock Teaching Lab Staff Data
 */
export const mockTLStaff = [
  {
    staffName: 'Emily Davis',
    email: 'emily.davis@teachinglab.org',
    schools: ['S001', 'S002', 'S003'],
    owners: ['admin@example.com'],
    adminLevel: TLAdminTypeEnum.COACH,
    assignedDistricts: ['District 1', 'District 2'],
    rolesTL: [AllowedRolesTLEnum.COACH]
  },
  {
    staffName: 'Robert Anderson',
    email: 'robert.anderson@teachinglab.org',
    schools: ['S002', 'S003'],
    owners: ['admin@example.com'],
    adminLevel: TLAdminTypeEnum.MANAGER,
    assignedDistricts: ['District 2', 'District 3'],
    rolesTL: [AllowedRolesTLEnum.CPM]
  }
];

/**
 * Mock Cycles Data
 */
export const mockCycles = [
  {
    cycleNum: 1,
    ipgIndicator: 'Standard 1.2',
    actionPlanURL: 'https://example.com/actionplan/cycle1',
    implementationIndicator: 'Strong lesson planning with clear objective',
    supportCycle: 'Spring 2023',
    lookFors: [
      {
        originalLookFor: 'lookfor1',
        title: 'Clear Learning Objectives',
        description: 'Lesson objectives are clearly communicated to students',
        tags: ['Planning', 'Objectives', 'Communication'],
        lookForIndex: 1,
        teacherIDs: ['john.smith@nycdoe.edu'],
        chosenBy: ['emily.davis@teachinglab.org'],
        active: true
      },
      {
        originalLookFor: 'lookfor2',
        title: 'Student Engagement',
        description: 'Students are actively engaged in the learning process',
        tags: ['Engagement', 'Participation', 'Active Learning'],
        lookForIndex: 2,
        teacherIDs: ['john.smith@nycdoe.edu'],
        chosenBy: ['emily.davis@teachinglab.org'],
        active: true
      }
    ],
    owners: ['admin@example.com']
  },
  {
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

/**
 * Mock Coaching Logs Data
 */
export const mockCoachingLogs = [
  {
    reasonDone: YesNoEnum.YES,
    microPLTopic: 'Effective Questioning Strategies',
    microPLDuration: 30,
    modelTopic: 'Think-Pair-Share Implementation',
    modelDuration: 45,
    adminMeet: true,
    adminMeetDuration: 20,
    NYCDone: true,
    totalDuration: LengthTypeEnum.HALF_DAY___3_HOURS,
    solvesTouchpoint: TeacherLeaderTypeEnum.TEACHER_SUPPORT,
    primaryStrategy: 'Modeling effective instructional practices',
    solvesSpecificStrategy: 'Demonstration of think-pair-share technique',
    aiSummary: 'Teacher showed improved implementation of questioning strategies. Next steps include varying question complexity and wait time.',
    owners: ['emily.davis@teachinglab.org']
  },
  {
    reasonDone: YesNoEnum.YES,
    microPLTopic: 'Data-Driven Instruction',
    microPLDuration: 45,
    modelTopic: 'Exit Ticket Analysis',
    modelDuration: 30,
    adminMeet: false,
    NYCDone: true,
    totalDuration: LengthTypeEnum.HALF_DAY___3_HOURS,
    solvesTouchpoint: TeacherLeaderTypeEnum.TEACHER_OR_TEACHER___LEADER_SUPPORT,
    primaryStrategy: 'Analysis of student work',
    solvesSpecificStrategy: 'Using exit tickets to guide instruction planning',
    aiSummary: 'Collaborative analysis of exit tickets revealed gaps in student understanding of fractions. Teacher will implement targeted small group instruction next week.',
    owners: ['robert.anderson@teachinglab.org']
  },
  {
    reasonDone: YesNoEnum.NO,
    totalDuration: LengthTypeEnum.FULL_DAY___6_HOURS,
    solvesTouchpoint: TeacherLeaderTypeEnum.LEADER_SUPPORT,
    primaryStrategy: 'Curriculum alignment',
    solvesSpecificStrategy: 'Mapping curriculum to standards',
    aiSummary: 'Session canceled due to school-wide professional development day. Rescheduled for next week.',
    owners: ['emily.davis@teachinglab.org']
  }
]; 