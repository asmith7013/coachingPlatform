"use client";

import { StudentAuth } from "./StudentAuth";
import { AttendanceOverview } from "./AttendanceOverview";
// import { ZearnProgress } from './ZearnProgress';
// import { PreAssessmentData } from './PreAssessmentData';
// import { ScopeSequenceProgress } from './ScopeSequenceProgress';
import { CombinedLessonProgress } from "./CombinedLessonProgress";
import { useStudentData } from "@/hooks/domain/313/useStudentData";
import { Card } from "@/components/composed/cards/Card";
import { Text } from "@/components/core/typography/Text";
import { Heading } from "@/components/core/typography/Heading";
import { Button } from "@/components/core/Button";
import { MonthlyCalendar } from "./monthlyCalendar/MonthlyCalendar";
import { useStudentCalendarData } from "@/hooks/domain/313/useStudentCalendarData";
import { StudentData } from "@/lib/schema/zod-schema/scm/student/student-data";
// import { ScopeSequenceProgress } from './ScopeSequenceProgress';

interface StudentDashboardProps {
  studentId: string;
}

/**
 * Wrapper component for the student calendar
 */
function StudentCalendarView({ studentData }: { studentData: StudentData }) {
  const { dailyCompletions } = useStudentCalendarData(studentData);

  return (
    <MonthlyCalendar
      dailyCompletions={dailyCompletions}
      currentMonth="2025-07"
    />
  );
}

export function StudentDashboard({ studentId }: StudentDashboardProps) {
  const {
    data,
    isLoading,
    error,
    isAuthenticated,
    isAuthenticating,
    authenticate,
    logout,
    refreshData,
  } = useStudentData(studentId);

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <StudentAuth
        onAuthenticate={authenticate}
        isLoading={isAuthenticating}
        error={error}
      />
    );
  }

  // Show loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <Card.Body className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Heading level="h3">Loading Your Dashboard</Heading>
            <Text color="muted" textSize="sm">
              Fetching your Summer Rising progress...
            </Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <Card.Body className="py-8 space-y-4">
            <div className="text-4xl mb-4">⚠️</div>
            <Heading level="h3">Unable to Load Dashboard</Heading>
            <Text color="danger" textSize="sm">
              {error || "No data found for this student"}
            </Text>
            <div className="space-y-2">
              <Button intent="primary" onClick={refreshData} className="w-full">
                Try Again
              </Button>
              <Button
                intent="secondary"
                appearance="outline"
                onClick={logout}
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Heading level="h1">
                Welcome
                {/* , {data.firstName}  */}! 👋
              </Heading>
              <Text color="muted">Summer Rising - Section {data.section}</Text>
            </div>
            <div className="flex space-x-2">
              <Button
                intent="secondary"
                appearance="outline"
                onClick={refreshData}
                disabled={isLoading}
                className="text-sm"
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
              {/* <Button 
                intent="secondary" 
                appearance="outline"
                onClick={logout}
                className="text-sm"
              >
                Logout
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Row 1 - Scope & Sequence Progress (Full Width, Most Prominent) */}
        {/* <ScopeSequenceProgress 
          progress={data.scopeSequenceProgress} 
          studentSection={data.section}
        /> */}
        {/* Row 1 - Combined Lesson Progress (Full Width, Most Prominent) */}
        <CombinedLessonProgress studentData={data} />

        {/* Row 2 - Attendance (Half Width) + Calendar (Half Width) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceOverview attendance={data.attendance} />

          {/* Daily Progress Calendar */}
          <Card>
            <Card.Header>
              <Heading level="h3">Daily Progress Calendar</Heading>
              <Text color="muted" textSize="sm">
                Lessons mastered each day during Summer Rising
              </Text>
            </Card.Header>
            <Card.Body>
              <StudentCalendarView studentData={data} />
            </Card.Body>
          </Card>
        </div>

        {/* Pre-Assessment Data - Commented Out */}
        {/* 
        <PreAssessmentData assessment={data.preAssessment} />
        */}

        {/* Footer */}
        <div className="text-center py-8">
          <Text textSize="xs" color="muted">
            Keep up the great work! Your progress is being tracked to help you
            succeed in math.
          </Text>
        </div>
      </div>
    </div>
  );
}
