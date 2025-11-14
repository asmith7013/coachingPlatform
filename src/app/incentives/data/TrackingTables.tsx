"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  fetchStudentOfTheDay,
  fetchSmallGroupActivities,
  fetchInquiryActivities,
  fetchLessonsForUnit,
  fetchShoutoutsTeamwork,
  StudentOfTheDayRecord,
  SmallGroupRecord,
  InquiryRecord,
  LessonInfo,
  ShoutoutsTeamworkRecord
} from "./tracking-actions";

interface TrackingTablesProps {
  section?: string;
  unitId?: string;
}

export function TrackingTables({ section, unitId }: TrackingTablesProps) {
  const [studentOfDayData, setStudentOfDayData] = useState<StudentOfTheDayRecord[]>([]);
  const [smallGroupData, setSmallGroupData] = useState<SmallGroupRecord[]>([]);
  const [inquiryData, setInquiryData] = useState<InquiryRecord[]>([]);
  const [shoutoutsTeamworkData, setShoutoutsTeamworkData] = useState<ShoutoutsTeamworkRecord[]>([]);
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

  // Fetch Shoutouts/Teamwork data (always shown, independent of unit)
  useEffect(() => {
    async function loadShoutoutsTeamwork() {
      const result = await fetchShoutoutsTeamwork(section);
      if (result.success && result.data) {
        setShoutoutsTeamworkData(result.data);
      }
    }
    loadShoutoutsTeamwork();
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
      {/* Top Row: Small Groups Table (left) and Calendar (right) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Small Groups / Acceleration Table */}
        {!unitId || !section ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Small Groups / Acceleration Tracking
            </h2>
            <div className="text-center text-gray-500 py-8">
              <p>Please select both a section and a unit to view small group activities.</p>
            </div>
          </div>
        ) : (
          <SmallGroupsTable
            data={smallGroupData}
            lessons={lessons}
            isLoading={isLoading}
          />
        )}

        {/* Student of the Day Calendar */}
        <StudentOfTheDayCalendar data={studentOfDayData} />
      </div>

      {/* Middle Row: Shoutouts/Teamwork Table (full width) */}
      <ShoutoutsTeamworkTable data={shoutoutsTeamworkData} section={section} />

      {/* Bottom Row: Inquiry Groups Table (full width) */}
      {!unitId || !section ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inquiry Groups Tracking
          </h2>
          <div className="text-center text-gray-500 py-8">
            <p>Please select both a section and a unit to view inquiry activities.</p>
          </div>
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
  const today = new Date();

  // Create a map for quick lookup: date string -> student name
  const dataMap = new Map(data.map((d) => [d.date, d.studentName]));

  // Custom tile content to show student name on the date
  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const studentName = dataMap.get(dateStr);

    if (studentName) {
      return (
        <div className="w-full text-center">
          <div className="text-[10px] font-semibold text-blue-700 break-words px-0.5 leading-tight">
            {studentName}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tile styling
  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const studentName = dataMap.get(dateStr);

    if (studentName) {
      return "has-student-of-day";
    }
    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Student of the Day
      </h2>
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .react-calendar__navigation {
          height: 36px;
          margin-bottom: 0.25rem;
        }
        .react-calendar__navigation button {
          min-width: 36px;
          font-size: 0.875rem;
        }
        .react-calendar__month-view__weekdays {
          font-size: 0.75rem;
          font-weight: 600;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.25rem;
        }
        .react-calendar__tile {
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0.25rem 0.125rem;
          position: relative;
          font-size: 0.75rem;
        }
        .react-calendar__tile abbr {
          margin-bottom: 0.125rem;
          font-size: 0.875rem;
        }
        .react-calendar__tile.has-student-of-day {
          background-color: #dbeafe !important;
        }
        .react-calendar__tile.has-student-of-day:enabled:hover,
        .react-calendar__tile.has-student-of-day:enabled:focus {
          background-color: #bfdbfe !important;
        }
        .react-calendar__tile--now {
          background-color: #fef3c7 !important;
        }
        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus {
          background-color: #fde68a !important;
        }
        .react-calendar__tile--now abbr {
          color: #1f2937 !important;
        }
        .react-calendar__tile.has-student-of-day.react-calendar__tile--now {
          background-color: #bbf7d0 !important;
        }
        .react-calendar__tile.has-student-of-day.react-calendar__tile--now:enabled:hover,
        .react-calendar__tile.has-student-of-day.react-calendar__tile--now:enabled:focus {
          background-color: #86efac !important;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #d1d5db;
        }
        .react-calendar__month-view__days__day--weekend {
          visibility: hidden;
          pointer-events: none;
        }
        .react-calendar__month-view__weekdays abbr[title="Sunday"],
        .react-calendar__month-view__weekdays abbr[title="Saturday"] {
          visibility: hidden;
        }
      `}</style>
      <Calendar
        value={today}
        defaultActiveStartDate={today}
        tileContent={tileContent}
        tileClassName={tileClassName}
        showNeighboringMonth={false}
        tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
      />
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

  if (students.length === 0 || lessons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Small Groups / Acceleration Tracking
        </h2>
        <div className="text-center text-gray-500 py-8">
          {students.length === 0 && lessons.length === 0 ? (
            <p>No small group activities or lessons found for this unit.</p>
          ) : students.length === 0 ? (
            <p>No small group activities found for this unit. Lessons: {lessons.length}</p>
          ) : (
            <p>No lessons found for this unit. Students with activities: {students.length}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Small Groups / Acceleration Tracking ({students.length} students, {lessons.length} lessons)
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
// SHOUTOUTS AND TEAMWORK TABLE
// =====================================

function ShoutoutsTeamworkTable({
  data,
  section
}: {
  data: ShoutoutsTeamworkRecord[];
  section?: string;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState<ShoutoutsTeamworkRecord[]>(data);

  // Update filtered data when date range or data changes
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredData(data);
      return;
    }

    const filtered = data.map(student => ({
      ...student,
      shoutoutDates: student.shoutoutDates.filter(date => date >= startDate && date <= endDate),
      teamworkDates: student.teamworkDates.filter(date => date >= startDate && date <= endDate),
      studentOfDayDates: student.studentOfDayDates.filter(date => date >= startDate && date <= endDate)
    })).filter(student => student.shoutoutDates.length > 0 || student.teamworkDates.length > 0 || student.studentOfDayDates.length > 0);

    setFilteredData(filtered);
  }, [data, startDate, endDate]);

  // Reload data when date range changes
  useEffect(() => {
    async function reloadData() {
      if (startDate && endDate) {
        const result = await fetchShoutoutsTeamwork(section, startDate, endDate);
        if (result.success && result.data) {
          setFilteredData(result.data);
        }
      }
    }
    reloadData();
  }, [startDate, endDate, section]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Shoutouts, Teamwork & Student of the Day Tracking
        </h2>
        <div className="text-center text-gray-500 py-8">
          No activities found.
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    // Parse date as local date to avoid timezone issues
    // dateStr is in YYYY-MM-DD format
    const [_year, month, day] = dateStr.split('-').map(Number);
    return `${month}/${day}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Shoutouts, Teamwork & Student of the Day Tracking ({filteredData.length} students)
        </h2>

        {/* Date Range Filters */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50 sticky left-0 z-10">
                Student
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50">
                Teamwork (👥)
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50">
                Shoutouts (💡)
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50">
                Student of the Day (⭐)
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50">
                Total Points
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student) => {
              const totalPoints = (student.teamworkDates.length * 5) + (student.shoutoutDates.length * 5) + (student.studentOfDayDates.length * 10);

              return (
                <tr key={student.studentId}>
                  <td className="px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-white sticky left-0 z-10">
                    {student.studentName}
                  </td>
                  <td className="px-3 py-2 text-sm border border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {student.teamworkDates.map((date, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                      {student.teamworkDates.length === 0 && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm border border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {student.shoutoutDates.map((date, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800"
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                      {student.shoutoutDates.length === 0 && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm border border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {student.studentOfDayDates.map((date, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                      {student.studentOfDayDates.length === 0 && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-sm font-semibold text-gray-900 border border-gray-200">
                    {totalPoints}
                  </td>
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
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50 sticky left-0 z-10">
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
