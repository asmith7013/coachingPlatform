import { 
  AllowedGradeEnum, 
  AllowedSubjectsEnum, 
  AllowedSpecialGroupsEnum, 
  TLAdminTypeEnum 
} from '@models/shared/shared-types.model';
import { 
  AllowedRolesNYCPSEnum, 
  AllowedRolesTLEnum, 
  YesNoEnum, 
  LengthTypeEnum, 
  TeacherLeaderTypeEnum 
} from '@models/shared';
// import { Types } from 'mongoose';
// import { DayType, PeriodType } from "@zod-schema/shared/enums";

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
 * Mock NYCPS Staff Data - Updated with teachers from the Bell Schedule CSV
 */
export const mockNYCPSStaff = [
  {
    staffName: 'Ms. Garcia',
    email: 'garcia.m@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.GEOMETRY],
    specialGroups: [],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Ms. Garcia',
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
        years: 6
      }
    ]
  },
  {
    staffName: 'Mr. Thompson',
    email: 'thompson.j@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.GEOMETRY],
    specialGroups: [],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Mr. Thompson',
    notes: [
      {
        date: new Date().toISOString(),
        type: 'Observation',
        heading: 'Initial Meeting',
        subheading: ['Discussed curriculum implementation']
      }
    ],
    experience: [
      {
        type: 'Teaching',
        years: 8
      }
    ]
  },
  {
    staffName: 'Ms. Rodriguez',
    email: 'rodriguez.a@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.GEOMETRY],
    specialGroups: [AllowedSpecialGroupsEnum.ELL],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Ms. Rodriguez',
    notes: [
      {
        date: new Date().toISOString(),
        type: 'Observation',
        heading: 'Initial Meeting',
        subheading: ['Discussed instructional strategies']
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
    staffName: 'Mr. Chen',
    email: 'chen.l@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.ALGEBRA_II],
    specialGroups: [],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Mr. Chen',
    notes: [
      {
        date: new Date().toISOString(),
        type: 'Observation',
        heading: 'Initial Meeting',
        subheading: ['Discussed assessment strategies']
      }
    ],
    experience: [
      {
        type: 'Teaching',
        years: 4
      }
    ]
  },
  {
    staffName: 'Ms. Johnson',
    email: 'johnson.t@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.GEOMETRY],
    specialGroups: [AllowedSpecialGroupsEnum.SPED],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Ms. Johnson',
    notes: [
      {
        date: new Date().toISOString(),
        type: 'Observation',
        heading: 'Initial Meeting',
        subheading: ['Discussed differentiation strategies']
      }
    ],
    experience: [
      {
        type: 'Teaching',
        years: 7
      }
    ]
  },
  {
    staffName: 'Mr. Williams',
    email: 'williams.s@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.ALGEBRA_I, AllowedSubjectsEnum.ALGEBRA_II],
    specialGroups: [],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Mr. Williams',
    notes: [
      {
        date: new Date().toISOString(),
        type: 'Observation',
        heading: 'Initial Meeting',
        subheading: ['Discussed technology integration']
      }
    ],
    experience: [
      {
        type: 'Teaching',
        years: 9
      }
    ]
  },
  {
    staffName: 'Ms. Patel',
    email: 'patel.r@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'], // Washington High School
    owners: ['admin@example.com'],
    gradeLevelsSupported: [AllowedGradeEnum.GRADE_9, AllowedGradeEnum.GRADE_10],
    subjects: [AllowedSubjectsEnum.GEOMETRY, AllowedSubjectsEnum.ALGEBRA_II],
    specialGroups: [],
    rolesNYCPS: [AllowedRolesNYCPSEnum.TEACHER],
    pronunciation: 'Ms. Patel',
    notes: [
      {
        date: new Date().toISOString(),
        type: 'Observation',
        heading: 'Initial Meeting',
        subheading: ['Discussed project-based learning']
      }
    ],
    experience: [
      {
        type: 'Teaching',
        years: 3
      }
    ]
  },
  {
    staffName: 'Michael Williams',
    email: 'michael.williams@nycdoe.edu',
    schools: ['6804406f6b85489a74013483'],
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
        teacherIDs: ['garcia.m@nycdoe.edu'],
        chosenBy: ['emily.davis@teachinglab.org'],
        active: true
      },
      {
        originalLookFor: 'lookfor2',
        title: 'Student Engagement',
        description: 'Students are actively engaged in the learning process',
        tags: ['Engagement', 'Participation', 'Active Learning'],
        lookForIndex: 2,
        teacherIDs: ['thompson.j@nycdoe.edu'],
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
        teacherIDs: ['rodriguez.a@nycdoe.edu'],
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
        teacherIDs: ['chen.l@nycdoe.edu'],
        chosenBy: ['emily.davis@teachinglab.org'],
        active: true
      },
      {
        originalLookFor: 'lookfor5',
        title: 'Student Self-Assessment',
        description: 'Students engage in self-assessment of their learning',
        tags: ['Assessment', 'Self-Reflection', 'Metacognition'],
        lookForIndex: 2,
        teacherIDs: ['johnson.t@nycdoe.edu'],
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

/**
 * Mock Schedule Data
 */

// Generate teacher IDs
const teacherIds = {
  'Ms. Garcia': '68098bdfd98a1511884723ab',
  'Mr. Thompson': '68098bdfd98a1511884723af',
  'Ms. Rodriguez': '68098bdfd98a1511884723b3',
  'Mr. Chen': '68098bdfd98a1511884723b7',
  'Ms. Johnson': '68098bdfd98a1511884723bb',
  'Mr. Williams': '68098bdfd98a1511884723bf',
  'Ms. Patel': '68098bdfd98a1511884723c3'
};

// School ID for Washington High School
const washingtonHighSchoolId = '6804406f6b85489a74013483';

// Owners - typically administrators or system users with access
const scheduleOwners = ['admin@example.com'];

// Create periods based on CSV columns
const periods = [
  { startTime: "8:15", endTime: "8:59" },
  { startTime: "9:02", endTime: "9:46" },
  { startTime: "9:49", endTime: "10:33" },
  { startTime: "10:36", endTime: "11:21" },
  { startTime: "11:24", endTime: "12:09" },
  { startTime: "12:12", endTime: "12:57" },
  { startTime: "1:00", endTime: "1:44" },
  { startTime: "1:47", endTime: "2:32" }
];

// // Subject names for classes
// const mathSubjects = [
//   "Algebra I", "Geometry", "Algebra II", 
//   "Pre-Calculus", "Calculus", "Statistics"
// ];

// // Room numbers
// const rooms = ["201", "202", "203", "204", "205", "206", "301", "302"];

// Generate Bell Schedule
const mockBellSchedule = {
  // _id: new Types.ObjectId(), // Use this instead of string
  // _id: `bs_${washingtonHighSchoolId}`,
  school: 'S003',
  bellScheduleType: "uniform",
  classSchedule: periods.map(period => ({
    dayType: "uniform",
    startTime: period.startTime,
    endTime: period.endTime
  })),
  assignedCycleDays: [
    {
      date: new Date().toISOString().split('T')[0],
      blockDayType: "A"
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      blockDayType: "B"
    }
  ],
  owners: scheduleOwners,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock data from the CSV - to represent what was in each cell
const csvScheduleData = {
  'Ms. Garcia': [
    { class: "Algebra I", room: "201" },
    { class: "Algebra I", room: "201" },
    { class: "Prep", room: null },
    { class: "Algebra I", room: "201" },
    { class: "Lunch", room: null },
    { class: "Geometry", room: "201" },
    { class: "Geometry", room: "201" },
    { class: "Meeting", room: "Office" }
  ],
  'Mr. Thompson': [
    { class: "Prep", room: null },
    { class: "Geometry", room: "202" },
    { class: "Geometry", room: "202" },
    { class: "Algebra II", room: "202" },
    { class: "Lunch", room: null },
    { class: "Algebra II", room: "202" },
    { class: "Meeting", room: "Office" },
    { class: "Prep", room: null }
  ],
  'Ms. Rodriguez': [
    { class: "Algebra I", room: "203" },
    { class: "Algebra I", room: "203" },
    { class: "Algebra I", room: "203" },
    { class: "Prep", room: null },
    { class: "Lunch", room: null },
    { class: "Geometry", room: "203" },
    { class: "Geometry", room: "203" },
    { class: "Meeting", room: "Office" }
  ],
  'Mr. Chen': [
    { class: "Algebra II", room: "204" },
    { class: "Prep", room: null },
    { class: "Algebra II", room: "204" },
    { class: "Algebra II", room: "204" },
    { class: "Lunch", room: null },
    { class: "Pre-Calculus", room: "204" },
    { class: "Pre-Calculus", room: "204" },
    { class: "Pre-Calculus", room: "204" }
  ],
  'Ms. Johnson': [
    { class: "Geometry", room: "205" },
    { class: "Geometry", room: "205" },
    { class: "Geometry", room: "205" },
    { class: "Algebra I", room: "205" },
    { class: "Lunch", room: null },
    { class: "Prep", room: null },
    { class: "Algebra I", room: "205" },
    { class: "Meeting", room: "Office" }
  ],
  'Mr. Williams': [
    { class: "Pre-Calculus", room: "206" },
    { class: "Pre-Calculus", room: "206" },
    { class: "Calculus", room: "206" },
    { class: "Calculus", room: "206" },
    { class: "Lunch", room: null },
    { class: "Meeting", room: "Office" },
    { class: "Prep", room: null },
    { class: "Statistics", room: "206" }
  ],
  'Ms. Patel': [
    { class: "Statistics", room: "301" },
    { class: "Statistics", room: "301" },
    { class: "Prep", room: null },
    { class: "Meeting", room: "Office" },
    { class: "Lunch", room: null },
    { class: "Algebra II", room: "301" },
    { class: "Algebra II", room: "301" },
    { class: "Algebra II", room: "301" }
  ]
};

// Generate Teacher Schedules based on CSV data
const mockTeacherSchedules = Object.entries(csvScheduleData).map(([teacherName, classes]) => {
  const teacherId = teacherIds[teacherName as keyof typeof teacherIds];
  
  return {
    _id: `ts_${teacherId}`,
    teacher: teacherId,
    school: washingtonHighSchoolId,
    scheduleByDay: [
      {
        day: 'uniform',
        periods: classes.map((classInfo, index) => {
          // Determine period type
          let periodType;
          if (classInfo.class === "Prep") {
            periodType = 'prep';
          } else if (classInfo.class === "Lunch") {
            periodType = 'lunch';
          } else if (classInfo.class === "Meeting") {
            periodType = 'meeting';
          } else {
            periodType = 'class';
          }
          
          return {
            periodNum: index + 1,
            className: classInfo.class,
            room: classInfo.room || undefined,
            periodType: periodType
          };
        })
      }
    ],
    owners: scheduleOwners,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
});

export const mockSchedules = {
  bellSchedule: mockBellSchedule,
  teacherSchedules: mockTeacherSchedules
};

export { mockVisitsFromCSV } from './mockVisitData';