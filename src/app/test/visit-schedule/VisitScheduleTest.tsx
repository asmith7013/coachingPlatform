'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/Alert';

// Types based on your schema
enum ScheduleAssignment {
  FULL_PERIOD = "full_period",
  FIRST_HALF = "first_half", 
  SECOND_HALF = "second_half",
}

interface VisitScheduleBlock {
  blockType: "visitScheduleBlock";
  periodNumber: number;
  teacherId: string;
  assignment: ScheduleAssignment;
  purpose: string;
  eventType: string;
}

interface VisitSchedule {
  _id: string;
  scheduleType: "visitSchedule";
  schoolId: string;
  dayIndices: number[];
  cycleId: string;
  date?: string;
  coachingActionPlanId: string;
  coachId: string;
  bellScheduleId: string;
  timeBlocks: VisitScheduleBlock[];
}

interface BellScheduleBlock {
  blockType: "bellScheduleBlock";
  periodNumber: number;
  startTime: string;
  endTime: string;
}

interface Teacher {
  _id: string;
  staffName: string;
  email: string;
  gradeLevelsSupported: string[];
  subjects: string[];
}

// Hardcoded test data based on your MongoDB data
const SCHOOL_ID = "6839fce009387410c1960dde";
const BELL_SCHEDULE_ID = "6851dc2bd64881f5f4e8aeba";
const COACH_ID = "test-coach-1";
const CYCLE_ID = "test-cycle-1";
const COACHING_ACTION_PLAN_ID = "test-cap-1";

const TEST_TEACHERS: Teacher[] = [
  {
    _id: "6839fce009387410c1960de1",
    staffName: "Toni Moricone", 
    email: "TMoricone@schools.nyc.gov",
    gradeLevelsSupported: ["Grade 6"],
    subjects: ["Math 6"]
  },
  {
    _id: "6839fce009387410c1960de3",
    staffName: "Alex Mazza",
    email: "AMazza6@schools.nyc.gov", 
    gradeLevelsSupported: ["Grade 7", "Grade 8"],
    subjects: ["Math 7", "Math 8"]
  },
  {
    _id: "6839fce009387410c1960de0",
    staffName: "Danielle Ramos",
    email: "DRamos7@schools.nyc.gov",
    gradeLevelsSupported: ["Grade 6"],
    subjects: ["Math 6"]
  }
];

const BELL_SCHEDULE: BellScheduleBlock[] = [
  { blockType: "bellScheduleBlock", periodNumber: 1, startTime: "08:00", endTime: "08:45" },
  { blockType: "bellScheduleBlock", periodNumber: 2, startTime: "08:45", endTime: "09:30" },
  { blockType: "bellScheduleBlock", periodNumber: 3, startTime: "09:30", endTime: "10:15" },
  { blockType: "bellScheduleBlock", periodNumber: 4, startTime: "10:15", endTime: "11:00" },
  { blockType: "bellScheduleBlock", periodNumber: 5, startTime: "11:00", endTime: "11:50" },
  { blockType: "bellScheduleBlock", periodNumber: 6, startTime: "11:50", endTime: "12:40" },
  { blockType: "bellScheduleBlock", periodNumber: 7, startTime: "12:40", endTime: "13:30" },
  { blockType: "bellScheduleBlock", periodNumber: 8, startTime: "13:30", endTime: "14:15" },
  { blockType: "bellScheduleBlock", periodNumber: 9, startTime: "14:15", endTime: "14:20" }
];

const INITIAL_VISIT_SCHEDULE: VisitSchedule = {
  _id: "test-visit-schedule-1",
  scheduleType: "visitSchedule",
  schoolId: SCHOOL_ID,
  dayIndices: [0], // Monday
  cycleId: CYCLE_ID,
  date: new Date().toISOString(),
  coachingActionPlanId: COACHING_ACTION_PLAN_ID,
  coachId: COACH_ID,
  bellScheduleId: BELL_SCHEDULE_ID,
  timeBlocks: []
};

export default function VisitScheduleTest() {
  const [visitSchedule, setVisitSchedule] = useState<VisitSchedule>(INITIAL_VISIT_SCHEDULE);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>("");

  // Get existing visit block for a teacher/period combination
  const getExistingBlock = useCallback((teacherId: string, periodNumber: number) => {
    return visitSchedule.timeBlocks.find(
      block => block.teacherId === teacherId && block.periodNumber === periodNumber
    );
  }, [visitSchedule.timeBlocks]);

  // Add or update a visit block
  const updateVisitBlock = useCallback((
    teacherId: string,
    periodNumber: number,
    assignment: ScheduleAssignment
  ) => {
    const teacher = TEST_TEACHERS.find(t => t._id === teacherId);
    if (!teacher) return;

    const newBlock: VisitScheduleBlock = {
      blockType: "visitScheduleBlock",
      periodNumber,
      teacherId,
      assignment,
      purpose: "classroom_observation",
      eventType: "observation"
    };

    setVisitSchedule(prev => {
      const updatedBlocks = prev.timeBlocks.filter(
        block => !(block.teacherId === teacherId && block.periodNumber === periodNumber)
      );
      
      return {
        ...prev,
        timeBlocks: [...updatedBlocks, newBlock]
      };
    });

    setLastAction(`Added ${assignment.replace('_', ' ')} visit for ${teacher.staffName} during Period ${periodNumber}`);
  }, []);

  // Remove a visit block
  const removeVisitBlock = useCallback((teacherId: string, periodNumber: number) => {
    const teacher = TEST_TEACHERS.find(t => t._id === teacherId);
    setVisitSchedule(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter(
        block => !(block.teacherId === teacherId && block.periodNumber === periodNumber)
      )
    }));
    setLastAction(`Removed visit for ${teacher?.staffName} during Period ${periodNumber}`);
  }, []);

  // Format time display
  const formatTime = useCallback((time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  }, []);

  // Get button style for assignment type
  const getAssignmentButtonStyle = useCallback((
    teacherId: string,
    periodNumber: number,
    assignment: ScheduleAssignment
  ) => {
    const existingBlock = getExistingBlock(teacherId, periodNumber);
    const isActive = existingBlock?.assignment === assignment;
    
    return `px-2 py-1 text-xs rounded ${
      isActive 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`;
  }, [getExistingBlock]);

  // Summary statistics
  const summary = useMemo(() => {
    const totalBlocks = visitSchedule.timeBlocks.length;
    const teachersScheduled = new Set(visitSchedule.timeBlocks.map(b => b.teacherId)).size;
    const fullPeriods = visitSchedule.timeBlocks.filter(b => b.assignment === ScheduleAssignment.FULL_PERIOD).length;
    const halfPeriods = visitSchedule.timeBlocks.filter(b => b.assignment !== ScheduleAssignment.FULL_PERIOD).length;
    
    return { totalBlocks, teachersScheduled, fullPeriods, halfPeriods };
  }, [visitSchedule.timeBlocks]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Visit Schedule Test</h1>
        <p className="text-gray-600">City Island School - Interactive Visit Scheduling</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-xl font-semibold">Schedule Summary</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{summary.totalBlocks}</div>
              <div className="text-sm text-gray-600">Total Visits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{summary.teachersScheduled}</div>
              <div className="text-sm text-gray-600">Teachers Scheduled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{summary.fullPeriods}</div>
              <div className="text-sm text-gray-600">Full Periods</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{summary.halfPeriods}</div>
              <div className="text-sm text-gray-600">Half Periods</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Teacher Selection */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-xl font-semibold">Select Teacher</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-2">
            {TEST_TEACHERS.map(teacher => (
              <Button
                key={teacher._id}
                variant={selectedTeacher === teacher._id ? "primary" : "outline"}
                onClick={() => setSelectedTeacher(
                  selectedTeacher === teacher._id ? null : teacher._id
                )}
                className="mb-2"
              >
                {teacher.staffName}
                <span className="ml-2 text-sm opacity-75">
                  ({teacher.subjects.join(', ')})
                </span>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Schedule Grid */}
      {selectedTeacher && (
        <Card className="mb-6">
          <Card.Header>
            <h2 className="text-xl font-semibold">
              Schedule Visits for {TEST_TEACHERS.find(t => t._id === selectedTeacher)?.staffName}
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid gap-4">
              {BELL_SCHEDULE.map(period => {
                const existingBlock = getExistingBlock(selectedTeacher, period.periodNumber);
                
                return (
                  <div key={period.periodNumber} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Period {period.periodNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {formatTime(period.startTime)} - {formatTime(period.endTime)}
                        </p>
                      </div>
                      {existingBlock && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVisitBlock(selectedTeacher, period.periodNumber)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className={getAssignmentButtonStyle(selectedTeacher, period.periodNumber, ScheduleAssignment.FULL_PERIOD)}
                        onClick={() => updateVisitBlock(selectedTeacher, period.periodNumber, ScheduleAssignment.FULL_PERIOD)}
                      >
                        Full Period
                      </button>
                      <button
                        className={getAssignmentButtonStyle(selectedTeacher, period.periodNumber, ScheduleAssignment.FIRST_HALF)}
                        onClick={() => updateVisitBlock(selectedTeacher, period.periodNumber, ScheduleAssignment.FIRST_HALF)}
                      >
                        First Half
                      </button>
                      <button
                        className={getAssignmentButtonStyle(selectedTeacher, period.periodNumber, ScheduleAssignment.SECOND_HALF)}
                        onClick={() => updateVisitBlock(selectedTeacher, period.periodNumber, ScheduleAssignment.SECOND_HALF)}
                      >
                        Second Half
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Current Schedule Display */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-xl font-semibold">Current Visit Schedule</h2>
        </Card.Header>
        <Card.Body>
          {visitSchedule.timeBlocks.length === 0 ? (
            <p className="text-gray-500 italic">No visits scheduled yet</p>
          ) : (
            <div className="space-y-2">
              {visitSchedule.timeBlocks
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((block, index) => {
                  const teacher = TEST_TEACHERS.find(t => t._id === block.teacherId);
                  const period = BELL_SCHEDULE.find(p => p.periodNumber === block.periodNumber);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">Period {block.periodNumber}</span>
                        <span className="mx-2">•</span>
                        <span>{teacher?.staffName}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm text-gray-600">
                          {block.assignment.replace('_', ' ')}
                        </span>
                        {period && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({formatTime(period.startTime)} - {formatTime(period.endTime)})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeVisitBlock(block.teacherId, block.periodNumber)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Action Log */}
      {lastAction && (
        <Alert variant="success" className="mb-6">
          <Alert.Description>{lastAction}</Alert.Description>
        </Alert>
      )}

      {/* JSON Data Display */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Visit Schedule JSON</h2>
        </Card.Header>
        <Card.Body>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(visitSchedule, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
}
