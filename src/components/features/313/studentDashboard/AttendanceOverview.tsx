import { useMemo } from "react";
import { StudentAttendance } from "@/lib/schema/zod-schema/scm/student/student-data";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";

interface AttendanceOverviewProps {
  attendance: StudentAttendance[];
}

export function AttendanceOverview({ attendance }: AttendanceOverviewProps) {
  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === "✅").length;
    const late = attendance.filter((a) => a.status === "🟡").length;
    const absent = attendance.filter((a) => a.status === "❌").length;

    return {
      total,
      present: total > 0 ? Math.round((present / total) * 100) : 0,
      late: total > 0 ? Math.round((late / total) * 100) : 0,
      absent: total > 0 ? Math.round((absent / total) * 100) : 0,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
    };
  }, [attendance]);

  const recentAttendance = useMemo(() => {
    return attendance.slice(-7); // Last 7 days
  }, [attendance]);

  return (
    <Card>
      <Card.Header>
        <Heading level="h3">Attendance Overview</Heading>
        <Text color="muted" textSize="sm">
          Your attendance record for Summer Rising
        </Text>
      </Card.Header>

      <Card.Body className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {stats.present}%
            </div>
            <Text textSize="sm" color="muted">
              Present
            </Text>
            <div className="text-xs text-green-600 mt-1">
              {stats.presentCount} days ✅
            </div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {stats.late}%
            </div>
            <Text textSize="sm" color="muted">
              Late
            </Text>
            <div className="text-xs text-yellow-600 mt-1">
              {stats.lateCount} days 🟡
            </div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {stats.absent}%
            </div>
            <Text textSize="sm" color="muted">
              Absent
            </Text>
            <div className="text-xs text-red-600 mt-1">
              {stats.absentCount} days ❌
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        {recentAttendance.length > 0 && (
          <div>
            <Heading level="h4" className="mb-3">
              Recent Days
            </Heading>
            <div className="grid grid-cols-7 gap-2">
              {recentAttendance.map((day, index) => (
                <div
                  key={index}
                  className="text-center p-2 rounded-md bg-gray-50 border"
                  title={`${day.date}: ${day.status === "✅" ? "Present" : day.status === "🟡" ? "Late" : "Absent"}`}
                >
                  <div className="text-xs text-gray-600 mb-1">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-lg">{day.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <Text textSize="sm" className="font-medium">
              Overall Attendance
            </Text>
            <Text textSize="sm" color="muted">
              {stats.presentCount + stats.lateCount} / {stats.total} days
            </Text>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${stats.present + stats.late}%`,
              }}
            ></div>
          </div>
          <Text textSize="xs" color="muted" className="mt-1">
            {stats.present + stats.late}% attendance rate (including late
            arrivals)
          </Text>
        </div>
      </Card.Body>
    </Card>
  );
}
