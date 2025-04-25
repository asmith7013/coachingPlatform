import { Types } from 'mongoose';

/**
 * Generates a MongoDB compatible ID string
 */
function generateMongoId(): string {
  return new Types.ObjectId().toString();
}

/**
 * Adds MongoDB _id fields to all nested objects in the schedules data structure
 */
export function generateScheduleWithIds() {
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

  // Teacher IDs for referencing in schedules
  const teacherIds = {
    'Ms. Garcia': '68098bdfd98a1511884723ab',
    'Mr. Thompson': '68098bdfd98a1511884723af',
    'Ms. Rodriguez': '68098bdfd98a1511884723b3',
    'Mr. Chen': '68098bdfd98a1511884723b7',
    'Ms. Johnson': '68098bdfd98a1511884723bb',
    'Mr. Williams': '68098bdfd98a1511884723bf',
    'Ms. Patel': '68098bdfd98a1511884723c3'
  };

  // Generate Bell Schedule with proper _id fields
  const bellSchedule = {
    _id: generateMongoId(),
    school: washingtonHighSchoolId,
    bellScheduleType: "uniform",
    classSchedule: periods.map(period => ({
      _id: generateMongoId(),
      dayType: "uniform",
      startTime: period.startTime,
      endTime: period.endTime
    })),
    assignedCycleDays: [
      {
        _id: generateMongoId(),
        date: new Date().toISOString().split('T')[0],
        blockDayType: "A"
      },
      {
        _id: generateMongoId(),
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        blockDayType: "B"
      }
    ],
    owners: scheduleOwners,
    createdAt: new Date(),
    updatedAt: new Date()
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

  // Generate Teacher Schedules based on CSV data with proper _id fields
  const teacherSchedules = Object.entries(csvScheduleData).map(([teacherName, classes]) => {
    const teacherId = teacherIds[teacherName as keyof typeof teacherIds];
    
    return {
      _id: generateMongoId(),
      teacher: teacherId,
      school: washingtonHighSchoolId,
      scheduleByDay: [
        {
          _id: generateMongoId(),
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
              _id: generateMongoId(),
              periodNum: index + 1,
              className: classInfo.class,
              room: classInfo.room || undefined,
              periodType: periodType
            };
          })
        }
      ],
      owners: scheduleOwners,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  return {
    bellSchedule,
    teacherSchedules
  };
} 