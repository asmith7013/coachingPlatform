import { 
  ModeDoneZod, 
  AllowedPurposeZod, 
  DurationValues,
  GradeLevelsSupportedZod,
  type GradeLevelsSupported
} from '@enums';

/**
 * Mock Visit Data Generator
 * Uses placeholder data formatted to resemble CSV data
 * Replace the mockVisitRows with actual parsed CSV data when available
 */
export const mockVisitsFromCSV = () => {
  // Washington High School ID
  const washingtonHighSchoolId = '6804406f6b85489a74013483';
  
  // Define coaches from TeachingLab staff
  const coaches = [
    {
      id: 'emily.davis@teachinglab.org',
      name: 'Emily Davis'
    },
    {
      id: 'robert.anderson@teachinglab.org',
      name: 'Robert Anderson'
    }
  ];
  
  // Staff IDs from mockNYCPSStaff
  const staff = [
    { id: '68098bdfd98a1511884723ab', name: 'Ms. Garcia' },
    { id: '68098bdfd98a1511884723af', name: 'Mr. Thompson' },
    { id: '68098bdfd98a1511884723b3', name: 'Ms. Rodriguez' },
    { id: '68098bdfd98a1511884723b7', name: 'Mr. Chen' },
    { id: '68098bdfd98a1511884723bb', name: 'Ms. Johnson' },
    { id: '68098bdfd98a1511884723bf', name: 'Mr. Williams' },
    { id: '68098bdfd98a1511884723c3', name: 'Ms. Patel' }
  ];

  // Cycle references
  const cycleRefs = ['cycle-1', 'cycle-2', 'cycle-3'];
  
  // This is where you would normally parse the CSV data
  // For now, we'll create placeholder data structured like CSV output
  // When you get the actual CSV, replace this with parsing logic
  
  // Sample structure for mock visit data
  // This should be replaced with actual CSV data
  const mockVisitRows = [
    {
      date: '2025-03-15',
      coachName: 'Emily Davis',
      purposeType: 'Initial Walkthrough',
      modeType: 'In-person',
      gradeLevels: ['Grade 9', 'Grade 10'],
      observedTeachers: ['Ms. Garcia', 'Mr. Thompson'],
      eventTypes: ['observation', 'debrief'],
      durations: ['60', '45'],
      notes: 'Initial classroom observation with debrief.'
    },
    {
      date: '2025-03-22',
      coachName: 'Robert Anderson', 
      purposeType: 'Visit',
      modeType: 'Virtual',
      gradeLevels: ['Grade 11'],
      observedTeachers: ['Ms. Rodriguez'],
      eventTypes: ['observation', 'debrief'],
      durations: ['45', '30'],
      notes: 'Virtual observation with focus on student engagement.'
    },
    {
      date: '2025-03-29',
      coachName: 'Emily Davis',
      purposeType: 'Visit',
      modeType: 'Hybrid',
      gradeLevels: ['Grade 9', 'Grade 12'],
      observedTeachers: ['Mr. Chen', 'Ms. Johnson'],
      eventTypes: ['observation', 'debrief', 'debrief'],
      durations: ['60', '30', '30'],
      notes: 'Hybrid classroom observation with individual debriefs.'
    },
    {
      date: '2025-04-05',
      coachName: 'Robert Anderson',
      purposeType: 'Final Walkthrough',
      modeType: 'In-person',
      gradeLevels: ['Grade 10'],
      observedTeachers: ['Mr. Williams', 'Ms. Patel'],
      eventTypes: ['observation', 'debrief'],
      durations: ['90', '45'],
      notes: 'Final observation of the semester.'
    },
    {
      date: '2025-04-12',
      coachName: 'Emily Davis',
      purposeType: 'Visit',
      modeType: 'Virtual',
      gradeLevels: ['Grade 11', 'Grade 12'],
      observedTeachers: ['Ms. Garcia'],
      eventTypes: ['observation'],
      durations: ['45'],
      notes: 'Follow-up observation on implementation of strategies.'
    }
  ];
  
  // Transform mock rows into the format expected by the schema
  return mockVisitRows.map((row) => {
    // Find coach ID
    const coach = coaches.find(c => c.name === row.coachName) || coaches[0];
    
    // Create events
    const events = row.eventTypes.map((type, index) => {
      // Find observed teachers
      const eventStaff = row.observedTeachers.map(teacherName => {
        const teacherObj = staff.find(s => s.name === teacherName);
        return teacherObj ? teacherObj.id : staff[0].id;
      });
      
      // Make sure we're using a valid duration value from the enum
      const duration = row.durations[index] || DurationValues[0];
      
      // Verify the duration is in the allowed values
      const validDuration: typeof DurationValues[number] = 
        // Check if the duration is valid
        DurationValues.some(d => d === duration)
          ? duration as typeof DurationValues[number]
          : DurationValues[Math.floor(Math.random() * DurationValues.length)];
      
      return {
        eventType: type,
        staff: eventStaff,
        duration: validDuration
      };
    });
    
    // Create session links for virtual or hybrid visits
    const sessionLinks = row.modeType !== 'In-person' ? [
      {
        purpose: row.eventTypes[0],
        title: `${row.eventTypes[0]} - ${row.date}`,
        url: `https://meeting-link.example.com/${Math.random().toString(36).substring(2, 15)}`,
        staff: row.observedTeachers.map(teacherName => {
          const teacherObj = staff.find(s => s.name === teacherName);
          return teacherObj ? teacherObj.id : staff[0].id;
        })
      }
    ] : undefined;
    
    // Map purpose type to enum
    let allowedPurpose;
    if (row.purposeType === 'Initial Walkthrough') {
      allowedPurpose = AllowedPurposeZod.options[0];
    } else if (row.purposeType === 'Final Walkthrough') {
      allowedPurpose = AllowedPurposeZod.options[2];
    } else {
      allowedPurpose = AllowedPurposeZod.options[1];
    }
    
    // Map mode type to enum
    let modeDone;
    if (row.modeType === 'Virtual') {
      modeDone = ModeDoneZod.options[1];
    } else if (row.modeType === 'Hybrid') {
      modeDone = ModeDoneZod.options[2];
    } else {
      modeDone = ModeDoneZod.options[0];
    }
    
    // Filter grade levels to those in the enum
    const gradeLevelsSupported = row.gradeLevels
      .filter(grade => GradeLevelsSupportedZod.options.includes(grade as GradeLevelsSupported))
      .map(grade => grade as GradeLevelsSupported);
    
    // Return visit object in the correct format
    return {
      date: row.date,
      school: washingtonHighSchoolId,
      coach: coach.id,
      cycleRef: cycleRefs[Math.floor(Math.random() * cycleRefs.length)],
      allowedPurpose,
      modeDone,
      gradeLevelsSupported,
      events,
      sessionLinks,
      owners: [coach.id]
    };
  });
}; 