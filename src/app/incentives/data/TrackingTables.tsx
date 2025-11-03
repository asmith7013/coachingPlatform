"use client";

import { useEffect, useState } from "react";
import {
  fetchStudentOfTheDay,
  fetchSmallGroupActivities,
  fetchInquiryActivities,
  fetchLessonsForUnit,
  StudentOfTheDayRecord,
  SmallGroupRecord,
  InquiryRecord,
  LessonInfo
} from "./tracking-actions";

interface TrackingTablesProps {
  section?: string;
  unitId?: string;
}

export function TrackingTables({ section, unitId }: TrackingTablesProps) {
  const [studentOfDayData, setStudentOfDayData] = useState<StudentOfTheDayRecord[]>([]);
  const [smallGroupData, setSmallGroupData] = useState<SmallGroupRecord[]>([]);
  const [inquiryData, setInquiryData] = useState<InquiryRecord[]>([]);
  const [lessons, setLessons] = useState<LessonInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Student of the Day data (always shown, independent of unit)
  useEffect(() => {
    async function loadStudentOfDay() {
      const result = await fetchStudentOfTheDay(section);
      if (result.success && result.data) {
        setStudentOfDayData(result.data);
      }
    }
    loadStudentOfDay();
  }, [section]);

  // Fetch unit-specific data when unit is selected
  useEffect(() => {
    if (!unitId) {
      setSmallGroupData([]);
      setInquiryData([]);
      setLessons([]);
      return;
    }

    async function loadUnitData() {
      if (!unitId) return;

      setIsLoading(true);
      const [smallGroupResult, inquiryResult, lessonsResult] = await Promise.all([
        fetchSmallGroupActivities(unitId, section),
        fetchInquiryActivities(unitId, section),
        fetchLessonsForUnit(unitId)
      ]);

      if (smallGroupResult.success && smallGroupResult.data) {
        setSmallGroupData(smallGroupResult.data);
      }

      if (inquiryResult.success && inquiryResult.data) {
        setInquiryData(inquiryResult.data);
      }

      if (lessonsResult.success && lessonsResult.data) {
        setLessons(lessonsResult.data);
      }

      setIsLoading(false);
    }

    loadUnitData();
  }, [unitId, section]);

  return (
    <div className="space-y-6">
      {/* Student of the Day Calendar */}
      <StudentOfTheDayCalendar data={studentOfDayData} />

      {/* Small Groups / Acceleration Table */}
      {!unitId || !section ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Small Groups / Acceleration Tracking
          </h2>
          <p className="text-sm text-gray-500">
            Please select both a section and a unit to view small group activities.
          </p>
        </div>
      ) : (
        <SmallGroupsTable
          data={smallGroupData}
          lessons={lessons}
          isLoading={isLoading}
        />
      )}

      {/* Inquiry Groups Table */}
      {!unitId || !section ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Inquiry Groups Tracking
          </h2>
          <p className="text-sm text-gray-500">
            Please select both a section and a unit to view inquiry activities.
          </p>
        </div>
      ) : (
        <InquiryGroupsTable data={inquiryData} isLoading={isLoading} />
      )}
    </div>
  );
}

// =====================================
// STUDENT OF THE DAY CALENDAR
// =====================================

function StudentOfTheDayCalendar({ data }: { data: StudentOfTheDayRecord[] }) {
  // Generate calendar for last 4 weeks
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 27); // Last 28 days including today

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Start from the beginning of the week containing startDate
  const current = new Date(startDate);
  current.setDate(current.getDate() - current.getDay()); // Go to Sunday

  for (let i = 0; i < 28; i++) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Create a map for quick lookup
  const dataMap = new Map(data.map((d) => [d.date, d.studentName]));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Student of the Day (Last 4 Weeks)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <th
                  key={day}
                  className="px-2 py-2 text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const studentName = dataMap.get(dateStr);
                  const isToday = dateStr === today.toISOString().split("T")[0];
                  const isPast = date < startDate || date > today;

                  return (
                    <td
                      key={dayIndex}
                      className={`px-2 py-3 border border-gray-200 text-sm align-top min-w-[100px] ${
                        isToday
                          ? "bg-blue-50 border-blue-300"
                          : isPast
                          ? "bg-gray-50 text-gray-400"
                          : ""
                      }`}
                    >
                      <div className="font-semibold text-gray-700 mb-1">
                        {date.getDate()}
                      </div>
                      {studentName && (
                        <div className="text-xs text-gray-900 font-medium">
                          {studentName}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================
// SMALL GROUPS TABLE
// =====================================

function SmallGroupsTable({
  data,
  lessons,
  isLoading
}: {
  data: SmallGroupRecord[];
  lessons: LessonInfo[];
  isLoading: boolean;
}) {
  // Get unique students
  const students = Array.from(
    new Set(data.map((d) => `${d.studentId}|||${d.studentName}`))
  ).map((str) => {
    const [studentId, studentName] = str.split("|||");
    return { studentId, studentName };
  });

  // Create a map: studentId -> lessonId -> isAcceleration
  const activityMap = new Map<string, Map<string, boolean>>();
  data.forEach((record) => {
    if (!activityMap.has(record.studentId)) {
      activityMap.set(record.studentId, new Map());
    }
    activityMap.get(record.studentId)!.set(record.lessonId, record.isAcceleration);
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Small Groups / Acceleration Tracking
        </h2>
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Small Groups / Acceleration Tracking
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50 sticky left-0 z-10">
                Student
              </th>
              {lessons.map((lesson) => (
                <th
                  key={lesson.lessonId}
                  className="px-3 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50"
                >
                  L{lesson.lessonNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const studentActivities = activityMap.get(student.studentId);
              return (
                <tr key={student.studentId}>
                  <td className="px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-white sticky left-0 z-10">
                    {student.studentName}
                  </td>
                  {lessons.map((lesson) => {
                    const isAcceleration = studentActivities?.get(lesson.lessonId);
                    return (
                      <td
                        key={lesson.lessonId}
                        className="px-3 py-2 text-center border border-gray-200"
                      >
                        {isAcceleration !== undefined && (
                          <span className="text-lg">
                            {isAcceleration ? "🚀" : "✓"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================
// INQUIRY GROUPS TABLE
// =====================================

function InquiryGroupsTable({
  data,
  isLoading
}: {
  data: InquiryRecord[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Inquiry Groups Tracking
        </h2>
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Inquiry Groups Tracking
        </h2>
        <div className="text-center text-gray-500 py-8">
          No inquiry activities found for this unit.
        </div>
      </div>
    );
  }

  // Get unique inquiry questions
  const inquiryQuestions = Array.from(new Set(data.map((d) => d.inquiryQuestion))).sort();

  // Get unique students
  const students = Array.from(
    new Set(data.map((d) => `${d.studentId}|||${d.studentName}`))
  ).map((str) => {
    const [studentId, studentName] = str.split("|||");
    return { studentId, studentName };
  }).sort((a, b) => a.studentName.localeCompare(b.studentName));

  // Create a map: studentId -> Set of inquiry questions
  const activityMap = new Map<string, Set<string>>();
  data.forEach((record) => {
    if (!activityMap.has(record.studentId)) {
      activityMap.set(record.studentId, new Set());
    }
    activityMap.get(record.studentId)!.add(record.inquiryQuestion);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Inquiry Groups Tracking ({students.length} students, {inquiryQuestions.length} questions)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50 sticky left-0 z-10 bg-gray-50">
                Student
              </th>
              {inquiryQuestions.map((question, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50 min-w-[150px]"
                >
                  <div className="line-clamp-2" title={question}>
                    {question}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const studentQuestions = activityMap.get(student.studentId);
              return (
                <tr key={student.studentId}>
                  <td className="px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-white sticky left-0 z-10">
                    {student.studentName}
                  </td>
                  {inquiryQuestions.map((question, index) => {
                    const hasCompleted = studentQuestions?.has(question);
                    return (
                      <td
                        key={index}
                        className="px-3 py-2 text-center border border-gray-200"
                      >
                        {hasCompleted && <span className="text-lg">✓</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
